# Custom Transforms

The `transform` option on `raw-map` entries lets you process each file's content before it is stored in the generated `Map`. Transforms run at build/serve time in Node.js — you have full access to the filesystem, `Buffer`, and any installed packages.

## Signature

```ts
transform?: (content: string, filePath: string) => string;
```

- `content` — raw UTF-8 string read from the file
- `filePath` — absolute path to the file (useful for conditional logic or logging)
- Return the processed string that will be stored in the map

## Built-in: `stripSvgMetadata`

```ts
import { stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';
```

Strips `<?xml … ?>` declarations and `<!-- … -->` comments, then trims whitespace. Safe on any standards-compliant SVG — leaves the `<svg>` element and all inner content untouched.

```ts
{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS_DIR, '**/*.svg'),
  type: 'raw-map',
  transform: stripSvgMetadata,
}
```

## Writing your own transform

Any function matching the signature works.

### Minify SVG with SVGO

```ts
import { optimize } from 'svgo';

function minifySvg(content: string, filePath: string): string {
  const result = optimize(content, { path: filePath });
  return result.data;
}
```

### Strip JSON comments

```ts
function stripJsonComments(content: string): string {
  return content
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}
```

### Base64 encode

```ts
import { readFileSync } from 'fs';

// The transform receives content as a UTF-8 string.
// Re-read with Buffer for binary-accurate base64.
function toBase64(_content: string, filePath: string): string {
  return readFileSync(filePath).toString('base64');
}
```

### Conditional logic based on file path

```ts
function processIcon(content: string, filePath: string): string {
  if (filePath.includes('/animated/')) {
    return content; // leave animated SVGs untouched
  }
  return stripSvgMetadata(content, filePath);
}
```

## Chaining transforms

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
