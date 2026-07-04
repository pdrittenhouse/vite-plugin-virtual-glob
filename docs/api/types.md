# Types

All public types are exported from the package root:

```ts
import type {
  VirtualGlobEntry,
  SideEffectEntry,
  RawMapEntry,
} from '@pdrittenhouse/vite-plugin-virtual-glob';
```

## VirtualGlobEntry

Union type for all supported virtual module entry shapes. Pass this to functions that accept entries generically.

```ts
type VirtualGlobEntry = SideEffectEntry | RawMapEntry;
```

## SideEffectEntry

See [Entry Types — SideEffectEntry](/api/entries#sideeffectentry) for the full field reference.

```ts
interface SideEffectEntry {
  id: string;
  pattern: string;
  type: 'side-effect';
}
```

## RawMapEntry

See [Entry Types — RawMapEntry](/api/entries#rawmapentry) for the full field reference.

```ts
interface RawMapEntry {
  id: string;
  pattern: string;
  type: 'raw-map';
  transform?: (content: string, filePath: string) => string;
}
```
