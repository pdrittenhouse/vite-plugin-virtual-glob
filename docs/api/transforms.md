# Transforms

## stripSvgMetadata

A built-in transform for SVG files. Strips the XML declaration (`<?xml … ?>`) and HTML comments (`<!-- … -->`), then trims whitespace. Safe on any standards-compliant SVG — never touches the `<svg>` element or its content.

## Signature

```ts
function stripSvgMetadata(content: string, filePath: string): string
```

## Usage

Pass it directly as the `transform` option on a `raw-map` entry:

```ts
import { virtualGlob, stripSvgMetadata } from '@pdrittenhouse/vite-plugin-virtual-glob';

virtualGlob([
  {
    id: 'virtual:svg-registry',
    pattern: path.join(ICONS_DIR, '**/*.svg'),
    type: 'raw-map',
    transform: stripSvgMetadata,
  },
])
```

## Custom transforms

Any function with the signature `(content: string, filePath: string) => string` works as a transform. See [Custom Transforms](/guide/custom-transforms) for examples including SVGO minification, JSON comment stripping, and transform chaining.
