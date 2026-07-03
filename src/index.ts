import type { Plugin } from 'vite';
import { globSync } from 'glob';
import { readFileSync } from 'fs';
import { basename } from 'path';

export type { VirtualGlobEntry, SideEffectEntry, RawMapEntry } from './types.js';

// Prefix that marks an ID as a resolved virtual module internally.
// The '\0' prefix is the Rollup/Vite convention for virtual modules that
// should not be passed to other resolvers.
const RESOLVED_PREFIX = '\0vite-plugin-virtual-glob:';

/**
 * Strips the XML declaration and HTML comments from an SVG string, then trims
 * whitespace. Designed for use as the `transform` option on `raw-map` entries
 * that load SVG files.
 *
 * @example
 * ```ts
 * {
 *   id: 'virtual:svg-registry',
 *   pattern: path.join(SVG_DIR, '**\/*.svg'),
 *   type: 'raw-map',
 *   transform: stripSvgMetadata,
 * }
 * ```
 */
export function stripSvgMetadata(content: string, _filePath: string): string {
  return content
    .replace(/<\?xml[^?]*\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/**
 * Creates a Vite plugin that resolves virtual module IDs to generated module
 * code built from filesystem globs evaluated at build/serve time.
 *
 * **Problem this solves:** `import.meta.glob()` requires a string literal —
 * Vite's static analysis cannot handle runtime-computed paths. When the path
 * you need to glob is determined dynamically (e.g. a parent-theme directory
 * discovered at startup), you're stuck with hardcoded strings.
 *
 * **How it works:** Register a virtual ID for each glob. When Vite resolves
 * that ID, the plugin scans the filesystem and emits module code containing
 * explicit imports (for `side-effect`) or inlined string values (for
 * `raw-map`). Matched files are watched so the virtual module is invalidated
 * when they change. Adding _new_ files that match the pattern requires a
 * Vite server restart.
 *
 * @param entries - One entry per virtual module to create.
 *
 * @example
 * ```ts
 * // vite.config.ts (or viteFinal in .storybook/main.ts)
 * import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';
 * import path from 'path';
 *
 * export default {
 *   plugins: [
 *     virtualGlob([
 *       {
 *         id: 'virtual:theme-pattern-css',
 *         pattern: path.join(THEME_DIR, 'dist/css/patterns/**\/*.css'),
 *         type: 'side-effect',
 *       },
 *       {
 *         id: 'virtual:svg-registry',
 *         pattern: path.join(ICONS_DIR, '**\/*.svg'),
 *         type: 'raw-map',
 *         transform: stripSvgMetadata,
 *       },
 *     ]),
 *   ],
 * };
 * ```
 */
export function virtualGlob(entries: import('./types.js').VirtualGlobEntry[]): Plugin {
  const entryMap = new Map(entries.map(e => [e.id, e]));

  return {
    name: 'vite-plugin-virtual-glob',

    resolveId(id) {
      if (entryMap.has(id)) return RESOLVED_PREFIX + id;
      return null;
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return null;

      const virtualId = id.slice(RESOLVED_PREFIX.length);
      const entry = entryMap.get(virtualId);
      if (!entry) return null;

      const files = globSync(entry.pattern, { absolute: true });

      // Watch every matched file. Vite will invalidate this virtual module
      // when any of them changes, causing load() to re-run with fresh content.
      // Note: files added after the server starts are not detected until restart.
      for (const f of files) {
        this.addWatchFile(f);
      }

      // ── side-effect ───────────────────────────────────────────────────────
      // One `import '/abs/path';` per matched file. Vite handles the files
      // normally (CSS pipeline, HMR, etc.).
      if (entry.type === 'side-effect') {
        if (files.length === 0) {
          return `// vite-plugin-virtual-glob: no files matched\n// pattern: ${entry.pattern}`;
        }
        return files.map(f => `import ${JSON.stringify(f)};`).join('\n');
      }

      // ── raw-map ───────────────────────────────────────────────────────────
      // File contents are read and inlined as string literals. The generated
      // module exports a Map<filename, content> so consumers get a simple
      // synchronous key-value lookup without needing `?raw` query params.
      const lines: string[] = [];
      const mapEntries: string[] = [];

      files.forEach((f, i) => {
        const raw = readFileSync(f, 'utf-8');
        const content = entry.transform ? entry.transform(raw, f) : raw;
        const varName = `_r${i}`;
        lines.push(`const ${varName} = ${JSON.stringify(content)};`);
        mapEntries.push(`[${JSON.stringify(basename(f))}, ${varName}]`);
      });

      lines.push(`export default new Map([${mapEntries.join(', ')}]);`);
      return lines.join('\n');
    },
  };
}
