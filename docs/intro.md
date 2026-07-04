---
id: intro
title: Getting Started
sidebar_label: Getting Started
---

# Getting Started

## The problem

Vite's `import.meta.glob()` is powerful, but it requires a **string literal**. Vite's static analysis cannot handle runtime-computed paths. If the path you need to glob is determined dynamically — for example, a parent-theme directory discovered by walking the filesystem — you're stuck:

```ts
// ❌ hardcoded — breaks if the directory is ever renamed or moved
void import.meta.glob('../../../themes/timberland-starter/dist/wp/css/patterns/**/*.css', { eager: true });
```

This plugin moves the glob into a Vite plugin where Node.js code runs freely, and exposes the results as stable **virtual module IDs**.

```ts
// ✅ stable virtual ID — path resolved at serve/build time, not hardcoded here
import 'virtual:parent-pattern-css';
```

## Requirements

- **Vite** 4, 5, or 6
- **Node.js** 20+

## Installation

```bash
npm install --save-dev @pdrittenhouse/vite-plugin-virtual-glob
```

## Quick start

Register virtual modules in your Vite config (or Storybook's `viteFinal`):

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

// Resolve paths however you need — this is plain Node.js code
const THEME_DIR = '/absolute/path/to/theme';

export default defineConfig({
  plugins: [
    virtualGlob([
      // CSS files injected as side effects
      {
        id: 'virtual:theme-pattern-css',
        pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css'),
        type: 'side-effect',
      },
      // SVG files exposed as a Map<filename, content>
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
// Injects all matched CSS files — no exports
import 'virtual:theme-pattern-css';

// Returns Map<filename, svgContent>
import svgMap from 'virtual:svg-registry';
const arrowSvg = svgMap.get('icon-arrow.svg');
```

## Two module types

| Type | What it generates | Use for |
|---|---|---|
| `side-effect` | One `import` per matched file | CSS injection, anything without exports |
| `raw-map` | `Map<filename, content>` with file contents inlined | SVG registries, JSON data, any raw text |

## Next steps

- [API Reference](/api-reference) — full option signatures and TypeScript types
- [Storybook Guide](/guides/storybook) — the primary use case with a complete working example
- [Custom Transforms](/guides/custom-transforms) — writing your own `transform` function
- [TypeScript Declarations](/guides/typescript) — ambient module declarations for virtual IDs
