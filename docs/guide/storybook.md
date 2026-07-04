# Storybook Integration

Storybook is the primary use case for this plugin. When your stories live in a plugin or child theme that needs to load CSS and assets from a dynamically resolved parent-theme directory, `import.meta.glob()` can't be used in `preview.ts` — the path isn't a string literal, it's computed at startup from the filesystem.

## Setup

There are two files to update: `.storybook/main.ts` registers the virtual modules via `viteFinal`, and `.storybook/preview.ts` consumes them.

### 1. Register virtual modules in `main.ts`

Resolve the parent-theme directory at startup, then add `virtualGlob()` inside `viteFinal`:

```ts
// .storybook/main.ts
import path from 'path';
import fs from 'fs';
import type { StorybookConfig } from '@storybook/html-vite';
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

// Resolve parent theme dynamically — any Node.js logic works here
const themesDir = path.resolve(__dirname, '../../../themes');
let PARENT: string | null = null;
for (const entry of fs.readdirSync(themesDir)) {
  const candidate = path.join(themesDir, entry);
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
        {
          id: 'virtual:parent-pattern-css',
          pattern: path.join(PARENT!, 'dist/wp/css/patterns/**/*.css'),
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

export default config;
```

### 2. Import virtual IDs in `preview.ts`

```ts
// .storybook/preview.ts

// Inject all parent-theme pattern CSS as a side effect
import 'virtual:parent-pattern-css';

// Build an SVG registry from the map
import svgMap from 'virtual:framework-svg-registry';

const reg: Record<string, string> = {};
for (const [fileName, content] of svgMap) {
  reg[`/svg/${fileName}`] = content;
}
(window as any).__svgSourceRegistry = reg;
```

### 3. Add TypeScript declarations

Create `.storybook/virtual-modules.d.ts` so the compiler recognises the virtual IDs:

```ts
declare module 'virtual:parent-pattern-css' {
  // side-effect only — no exports
}

declare module 'virtual:framework-svg-registry' {
  const map: Map<string, string>;
  export default map;
}
```

See the [TypeScript](/guide/typescript) guide for placement details.

## How it differs from `import.meta.glob()`

| | `import.meta.glob()` | `virtualGlob()` |
|---|---|---|
| Pattern type | String literal only | Any runtime expression |
| Pattern resolution | Relative to the calling file | Absolute — you control it |
| Works with dynamic paths | No | Yes |
| File watching (HMR) | Built-in | Per-file via `addWatchFile()` |
| New files at runtime | Detected automatically | Requires server restart |
