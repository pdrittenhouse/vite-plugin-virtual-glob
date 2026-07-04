# API Overview

The plugin exports the following from its main entry point:

```ts
import {
  virtualGlob,
  stripSvgMetadata,
} from '@pdrittenhouse/vite-plugin-virtual-glob';

import type {
  VirtualGlobEntry,
  SideEffectEntry,
  RawMapEntry,
} from '@pdrittenhouse/vite-plugin-virtual-glob';
```

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| [`virtualGlob`](/api/virtual-glob) | function | Creates a Vite plugin from an array of virtual module entries |
| [`stripSvgMetadata`](/api/transforms) | function | Built-in transform — strips XML declarations and comments from SVG content |
| [`VirtualGlobEntry`](/api/types) | type | Union of `SideEffectEntry \| RawMapEntry` |
| [`SideEffectEntry`](/api/entries#sideeffectentry) | interface | Virtual module that imports all matched files as side effects |
| [`RawMapEntry`](/api/entries#rawmapentry) | interface | Virtual module that exports `Map<filename, content>` |
