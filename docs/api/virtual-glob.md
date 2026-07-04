# virtualGlob()

Creates a Vite plugin that resolves virtual module IDs to generated module code built from filesystem globs.

## Signature

```ts
function virtualGlob(entries: VirtualGlobEntry[]): Plugin
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entries` | `VirtualGlobEntry[]` | One entry per virtual module to create. See [Entry Types](/api/entries). |

## Returns

A Vite `Plugin` object. Pass it to the `plugins` array in your Vite config or Storybook's `viteFinal`.

## Example

```ts
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';
import path from 'path';

// In vite.config.ts
export default defineConfig({
  plugins: [
    virtualGlob([
      {
        id: 'virtual:pattern-css',
        pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css'),
        type: 'side-effect',
      },
      {
        id: 'virtual:svg-registry',
        pattern: path.join(ICONS_DIR, '**/*.svg'),
        type: 'raw-map',
        transform: stripSvgMetadata,
      },
    ]),
  ],
});
```

## How it works

1. **`resolveId`** — When Vite encounters an import matching a registered `id`, the plugin claims it and returns a prefixed internal ID (the `\0` prefix is the Rollup/Vite convention for virtual modules that should not be passed to other resolvers).

2. **`load`** — For `side-effect` entries, the plugin calls `globSync` with the pattern and emits one `import` statement per matched file. For `raw-map` entries, it reads each matched file, applies any `transform`, and emits a module exporting a `Map`.

3. **File watching** — Every matched file is registered via `this.addWatchFile()`. Vite invalidates the virtual module and re-runs `load()` when any watched file changes.

::: warning New files require a server restart
Only files that existed when the dev server started are watched. Adding a new file that matches the pattern requires restarting `vite dev`. This is a fundamental constraint of Vite's watch system for dynamic patterns.
:::
