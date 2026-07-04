---
id: storybook
title: Storybook Integration
sidebar_label: Storybook
---

# Storybook Integration

Storybook is the primary use case for this plugin. When your stories live in a plugin or child theme that needs to load CSS and assets from a dynamically resolved parent-theme directory, `import.meta.glob()` can't be used in `preview.ts` because the path isn't a string literal — it's computed at startup.

## The setup

There are two files to update: `.storybook/main.ts` registers the virtual modules via `viteFinal`, and `.storybook/preview.ts` imports them.

### `.storybook/main.ts`

Resolve the parent-theme directory at startup (this is plain Node.js — any filesystem logic works), then register virtual modules inside `viteFinal`:

```ts
import path from 'path';
import fs from 'fs';
import type { StorybookConfig } from '@storybook/html-vite';
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

// Walk up from __dirname to find the parent theme that owns this Storybook.
// Adjust this discovery logic to fit your directory structure.
const themesDir = path.resolve(__dirname, '../../../themes');
let PARENT: string | null = null;
for (const entry of fs.readdirSync(themesDir)) {
  const candidate = path.join(themesDir, entry);
  // Identify the parent by the presence of a known vendor directory
  if (fs.existsSync(path.join(candidate, 'vendor/timberland/framework'))) {
    PARENT = candidate;
    break;
  }
}
if (!PARENT) throw new Error('[Storybook] Could not find parent theme directory');
const FRAMEWORK = path.join(PARENT, 'vendor/timberland/framework');

const config: StorybookConfig = {
  // ... your existing config ...

  async viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push(
      virtualGlob([
        // Inject all compiled pattern CSS from the parent theme
        {
          id: 'virtual:parent-pattern-css',
          pattern: path.join(PARENT!, 'dist/wp/css/patterns/**/*.css'),
          type: 'side-effect',
        },
        // Expose SVG icons as a Map for the story SVG registry
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

export default config;
```

### `.storybook/preview.ts`

Import both virtual IDs. The CSS module is a pure side effect (no import binding needed). The SVG map is a default export:

```ts
// Inject all parent-theme pattern CSS
import 'virtual:parent-pattern-css';

// Build the SVG source registry used by icon stories
import svgMap from 'virtual:framework-svg-registry';

const reg: Record<string, string> = {};
for (const [fileName, content] of svgMap) {
  reg[`/svg/${fileName}`] = content;
}
(window as any).__svgSourceRegistry = reg;
```

## TypeScript declarations

If you use TypeScript in your Storybook, add a `virtual-modules.d.ts` file alongside your `.storybook/` directory so the compiler knows the shape of each virtual ID. See the [TypeScript Declarations](/guides/typescript) guide.

## How it differs from `import.meta.glob()`

| | `import.meta.glob()` | `virtualGlob()` |
|---|---|---|
| Pattern type | String literal only | Any runtime expression |
| Pattern resolution | Relative to the calling file | Absolute (you control it) |
| Works with dynamic paths | No | Yes |
| File watching (HMR) | Built-in | Per-file via `addWatchFile()` |
| New files detected at runtime | Yes | Requires server restart |
