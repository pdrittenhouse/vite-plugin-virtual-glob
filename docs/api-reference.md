---
id: api-reference
title: API Reference
sidebar_label: API Reference
---

# API Reference

## `virtualGlob(entries)`

Returns a Vite `Plugin`. Pass an array of [`VirtualGlobEntry`](#virtualglobentry) objects — one per virtual module to create.

```ts
import { virtualGlob } from '@pdrittenhouse/vite-plugin-virtual-glob';

virtualGlob(entries: VirtualGlobEntry[]): Plugin
```

Register it in your Vite config or Storybook's `viteFinal`:

```ts
config.plugins.push(
  virtualGlob([
    { id: 'virtual:my-css', pattern: '/abs/path/**/*.css', type: 'side-effect' },
    { id: 'virtual:my-map', pattern: '/abs/path/**/*.svg', type: 'raw-map' },
  ])
);
```

---

## Entry types

### `SideEffectEntry`

Generates a module that imports every matched file as a side effect — equivalent to `void import.meta.glob(pattern, { eager: true })`. The generated module body is one `import '/abs/path/to/file';` line per match. Vite processes each import normally (CSS pipeline, HMR, etc.).

```ts
interface SideEffectEntry {
  /** Virtual module ID used in import statements. */
  id: string;
  /** Absolute glob pattern. Must be absolute — see note below. */
  pattern: string;
  type: 'side-effect';
}
```

**Example:**

```ts
// register
{ id: 'virtual:pattern-css', pattern: path.join(THEME, 'dist/css/patterns/**/*.css'), type: 'side-effect' }

// consume
import 'virtual:pattern-css';
```

If no files match the pattern, the module is a no-op comment — no error is thrown.

---

### `RawMapEntry`

Generates a module that exports `Map<filename, rawContent>`. File contents are read at build/serve time and inlined as string literals. The map key is the **bare filename** (no directory path), e.g. `'icon-arrow.svg'`.

```ts
interface RawMapEntry {
  /** Virtual module ID used in import statements. */
  id: string;
  /** Absolute glob pattern. Must be absolute — see note below. */
  pattern: string;
  type: 'raw-map';
  /** Optional transform applied to each file's raw string before it enters the map. */
  transform?: (content: string, filePath: string) => string;
}
```

**Example:**

```ts
// register
{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS, '**/*.svg'),
  type: 'raw-map',
  transform: stripSvgMetadata,
}

// consume
import svgMap from 'virtual:svg-registry';
// Map { 'icon-arrow.svg' => '<svg>…</svg>', 'icon-close.svg' => '…' }

const content = svgMap.get('icon-arrow.svg');
```

---

## `stripSvgMetadata(content, filePath)`

A built-in `transform` function for SVG files. Strips the XML declaration (`<?xml … ?>`) and HTML comments (`<!-- … -->`), then trims whitespace. Safe on any SVG — leaves the `<svg>` element and all inner content untouched.

```ts
import { stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

stripSvgMetadata(content: string, filePath: string): string
```

Pass it directly as the `transform` option:

```ts
{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS_DIR, '**/*.svg'),
  type: 'raw-map',
  transform: stripSvgMetadata,
}
```

---

## TypeScript types

All public types are exported from the package root:

```ts
import type { VirtualGlobEntry, SideEffectEntry, RawMapEntry } from '@pdrittenhouse/vite-plugin-virtual-glob';
```

### `VirtualGlobEntry`

```ts
type VirtualGlobEntry = SideEffectEntry | RawMapEntry;
```

---

## Notes

### Patterns must be absolute

Relative glob patterns are resolved from `process.cwd()`, which is unpredictable inside a Vite plugin. Always build patterns with `path.join()` or `path.resolve()`:

```ts
// ✅ correct
pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css')

// ❌ will resolve from cwd, not from the file's location
pattern: '../../theme/dist/css/patterns/**/*.css'
```

### New files require a server restart

Only files that existed when the dev server started are watched. Adding a new file that matches the pattern requires restarting `vite dev`. This is a fundamental constraint of Vite's watch system for dynamic patterns — per-file `addWatchFile()` calls cannot watch for files that don't yet exist.

### `raw-map` content is inlined at build time

File contents become string literals in the generated module. Avoid using `raw-map` for large binary-like files — use `side-effect` or a standard Vite asset import instead.
