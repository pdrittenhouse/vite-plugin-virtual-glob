# @pdrittenhouse/vite-plugin-virtual-glob

A Vite plugin that creates virtual modules from filesystem globs resolved at runtime — solving the static-path limitation of `import.meta.glob()`.

## The problem

Vite's `import.meta.glob()` is powerful, but it requires a **string literal**. If the path you need to glob is determined at runtime — for example, a parent-theme directory discovered by walking the filesystem — you're stuck with something like this:

```ts
// preview.ts — hardcoded, breaks if the directory is ever renamed
void import.meta.glob('../../../themes/timberland-starter/dist/wp/css/patterns/**/*.css', { eager: true });
```

This plugin solves it by moving the glob into a Vite plugin where Node.js code runs freely, and exposing the results as stable virtual module IDs.

```ts
// preview.ts — no hardcoded paths
import 'virtual:parent-pattern-css';
```

## Installation

```bash
npm install --save-dev @pdrittenhouse/vite-plugin-virtual-glob
```

Requires Vite 4, 5, or 6 and Node 20+.

## Quick start

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

const THEME_DIR = '/absolute/path/to/theme'; // resolved however you need

export default defineConfig({
  plugins: [
    virtualGlob([
      {
        id: 'virtual:theme-pattern-css',
        pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css'),
        type: 'side-effect',
      },
      {
        id: 'virtual:svg-registry',
        pattern: path.join(THEME_DIR, 'src/icons/**/*.svg'),
        type: 'raw-map',
        transform: stripSvgMetadata,
      },
    ]),
  ],
});
```

Then in your source files:

```ts
import 'virtual:theme-pattern-css';           // injects all matched CSS
import svgMap from 'virtual:svg-registry';    // Map<filename, svgContent>

const arrowSvg = svgMap.get('icon-arrow.svg');
```

## Usage in Storybook

The plugin works in `.storybook/main.ts` via Storybook's `viteFinal` hook. This is the primary use case — the parent-theme directory is resolved dynamically, so `import.meta.glob()` can't be used in `preview.ts`.

```ts
// .storybook/main.ts
import path from 'path';
import fs from 'fs';
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

// Resolve parent theme dynamically
const themesDir = path.resolve(__dirname, '../../../themes');
let PARENT: string | null = null;
for (const entry of fs.readdirSync(themesDir)) {
  const candidate = path.join(themesDir, entry);
  if (fs.existsSync(path.join(candidate, 'vendor/my-framework'))) {
    PARENT = candidate;
    break;
  }
}
if (!PARENT) throw new Error('Could not find parent theme');
const FRAMEWORK = path.join(PARENT, 'vendor/my-framework');

export default {
  // ...
  async viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push(
      virtualGlob([
        {
          id: 'virtual:parent-pattern-css',
          pattern: path.join(PARENT, 'dist/wp/css/patterns/**/*.css'),
          type: 'side-effect',
        },
        {
          id: 'virtual:framework-svg-registry',
          pattern: path.join(FRAMEWORK, 'src/design-system/patterns/01-atoms/svg/svg/*.svg'),
          type: 'raw-map',
          transform: stripSvgMetadata,
        },
      ]),
    );
    return config;
  },
};
```

```ts
// .storybook/preview.ts
import 'virtual:parent-pattern-css';
import svgMap from 'virtual:framework-svg-registry';

// Build SVG source registry from the map
const reg: Record<string, string> = {};
for (const [fileName, content] of svgMap) {
  reg[`/svg/${fileName}`] = content;
}
(window as any).__svgSourceRegistry = reg;
```

## API

### `virtualGlob(entries)`

Returns a Vite `Plugin`. Accepts an array of `VirtualGlobEntry` objects.

```ts
import { virtualGlob } from '@pdrittenhouse/vite-plugin-virtual-glob';
```

### Entry types

#### `SideEffectEntry`

Generates a module that imports every matched file as a side effect — equivalent to `void import.meta.glob(pattern, { eager: true })`. Use for CSS files or anything you want injected without capturing exports.

```ts
interface SideEffectEntry {
  id: string;       // virtual module ID, e.g. 'virtual:theme-css'
  pattern: string;  // absolute glob pattern
  type: 'side-effect';
}
```

The generated module looks like:

```js
import '/abs/path/to/file1.css';
import '/abs/path/to/file2.css';
// ...
```

Vite handles each imported file normally — CSS pipeline, HMR, and all.

#### `RawMapEntry`

Generates a module that exports a `Map<filename, rawContent>`. File contents are read at build/serve time and inlined as string literals. The map key is the bare filename (no directory path).

```ts
interface RawMapEntry {
  id: string;       // virtual module ID, e.g. 'virtual:svg-registry'
  pattern: string;  // absolute glob pattern
  type: 'raw-map';
  transform?: (content: string, filePath: string) => string;
}
```

```ts
import svgMap from 'virtual:svg-registry';
// Map { 'icon-arrow.svg' => '<svg>...</svg>', 'icon-close.svg' => '...' }
```

### `stripSvgMetadata(content, filePath)`

A ready-made `transform` function for SVG files. Strips the XML declaration (`<?xml ... ?>`) and HTML comments (`<!-- ... -->`), then trims whitespace. Safe to use on any SVG; leaves the `<svg>` element and all its content untouched.

```ts
import { stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS_DIR, '**/*.svg'),
  type: 'raw-map',
  transform: stripSvgMetadata,
}
```

### TypeScript types

```ts
import type { VirtualGlobEntry, SideEffectEntry, RawMapEntry } from '@pdrittenhouse/vite-plugin-virtual-glob';
```

## How it works

1. **`resolveId`** — When Vite sees an import matching a registered `id`, the plugin claims it and returns an internal resolved ID (prefixed with `\0` per Rollup convention so other resolvers skip it).

2. **`load`** — For `side-effect` entries, the plugin calls `globSync` with the pattern and emits one `import` statement per matched file. For `raw-map` entries, it reads each file with `fs.readFileSync`, applies any `transform`, and emits a module that exports a `Map` of the results.

3. **File watching** — Every matched file is registered via `this.addWatchFile()`. When a file changes, Vite invalidates the virtual module and re-runs `load()` with fresh content.

## Limitations

- **New files require a server restart.** Only files that existed when the server started are watched. If a new file is added that matches the pattern, restart `vite dev` to pick it up. This is a fundamental constraint of Vite's watch system for dynamic patterns.

- **Patterns must be absolute.** Relative glob patterns are resolved from `process.cwd()`, which is unpredictable inside Vite plugins. Always use `path.join()` or `path.resolve()` to build absolute patterns.

- **`raw-map` content is inlined at build time.** File contents become string literals in the generated module. Large files (e.g. high-resolution images) should not use `raw-map` — use `side-effect` or a standard Vite asset import instead.

## License

MIT
