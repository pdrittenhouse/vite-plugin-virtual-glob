---
id: custom-transforms
title: Custom Transforms
sidebar_label: Custom Transforms
---

# Custom Transforms

The `transform` option on `raw-map` entries lets you process each file's content before it is stored in the generated `Map`. The transform runs at build/serve time in Node.js — you have full access to the file system, `Buffer`, third-party packages, etc.

## Signature

```ts
transform?: (content: string, filePath: string) => string;
```

- `content` — the raw UTF-8 string read from the file
- `filePath` — absolute path to the file (useful for logging or conditional logic)
- Return the processed string that will be stored in the map

## Built-in: `stripSvgMetadata`

The package ships with one ready-made transform for SVG files:

```ts
import { stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';
```

It strips `<?xml … ?>` declarations and `<!-- … -->` comments, then trims whitespace. This is safe for any standards-compliant SVG — it never touches the `<svg>` element itself.

```ts
{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS_DIR, '**/*.svg'),
  type: 'raw-map',
  transform: stripSvgMetadata,
}
```

## Writing your own transform

Any function matching the signature works:

### Minify SVG content

```ts
import { optimize } from 'svgo';

function minifySvg(content: string, filePath: string): string {
  const result = optimize(content, { path: filePath });
  return result.data;
}

// register
{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS_DIR, '**/*.svg'),
  type: 'raw-map',
  transform: minifySvg,
}
```

### Strip JSON comments (JSON5-style)

```ts
function stripJsonComments(content: string): string {
  return content.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

{
  id: 'virtual:config-map',
  pattern: path.join(CONFIG_DIR, '**/*.json'),
  type: 'raw-map',
  transform: stripJsonComments,
}
```

### Encode to base64 (for binary-safe inlining)

```ts
import { readFileSync } from 'fs';

// Note: the transform receives the content as a UTF-8 string.
// For true binary files, read with Buffer directly instead.
function toBase64(_content: string, filePath: string): string {
  return readFileSync(filePath).toString('base64');
}
```

### Conditional transform based on file path

```ts
function processIcon(content: string, filePath: string): string {
  if (filePath.includes('/animated/')) {
    return content; // leave animated SVGs untouched
  }
  return stripSvgMetadata(content, filePath);
}
```

## Combining transforms

Chain transforms with a simple wrapper:

```ts
const pipe =
  (...fns: Array<(c: string, p: string) => string>) =>
  (content: string, filePath: string) =>
    fns.reduce((c, fn) => fn(c, filePath), content);

{
  id: 'virtual:svg-registry',
  pattern: '…',
  type: 'raw-map',
  transform: pipe(stripSvgMetadata, minifySvg),
}
```
