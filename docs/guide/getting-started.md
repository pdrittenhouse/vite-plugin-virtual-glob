# Getting Started

## The problem

Vite's `import.meta.glob()` is powerful, but it requires a **string literal**. Vite's static analysis cannot handle runtime-computed paths. If the path you need to glob is determined dynamically — for example, a parent-theme directory discovered by walking the filesystem — you're stuck:

```ts
// ❌ hardcoded — breaks if the directory is ever renamed or moved
void import.meta.glob('../../../themes/timberland-starter/dist/wp/css/patterns/**/*.css', { eager: true });
```

This plugin moves the glob into a Vite plugin where Node.js code runs freely, and exposes the results as stable **virtual module IDs**.

```ts
// ✅ stable virtual ID — path resolved at serve/build time
import 'virtual:parent-pattern-css';
```

## Installation

```bash
npm install --save-dev @pdrittenhouse/vite-plugin-virtual-glob
```

**Peer dependency:** Vite 4, 5, or 6. Node.js 20+.

## Quick start

Register virtual modules in your Vite config using `virtualGlob()`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

const THEME_DIR = '/absolute/path/to/theme'; // resolved however you need

export default defineConfig({
  plugins: [
    virtualGlob([
      // Inject CSS files as side effects
      {
        id: 'virtual:theme-pattern-css',
        pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css'),
        type: 'side-effect',
      },
      // Expose SVG files as Map<filename, content>
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

Then import the virtual IDs anywhere in your source:

```ts
// Injects all matched CSS — no exports
import 'virtual:theme-pattern-css';

// Returns Map<filename, svgContent>
import svgMap from 'virtual:svg-registry';
const arrowSvg = svgMap.get('icon-arrow.svg');
```

## Two module types

| Type | Generated module | Use for |
|---|---|---|
| `side-effect` | One `import` per matched file | CSS injection, any file without exports |
| `raw-map` | `Map<filename, content>` with inlined strings | SVG registries, JSON data, raw text assets |

## Next steps

- [Storybook Integration](/guide/storybook) — the primary use case with a complete end-to-end example
- [Custom Transforms](/guide/custom-transforms) — processing file content before it enters the map
- [TypeScript](/guide/typescript) — ambient declarations for virtual module IDs
- [API Reference](/api/) — full option signatures
