# TypeScript

Virtual module IDs like `'virtual:parent-pattern-css'` are unknown to TypeScript — importing them without a declaration produces a `Cannot find module` error. Add a `virtual-modules.d.ts` file to declare their shapes.

## Declaration file

Create `virtual-modules.d.ts` alongside your `.storybook/` directory (or in `src/` for a standard Vite app):

```ts
// virtual-modules.d.ts

declare module 'virtual:parent-pattern-css' {
  // side-effect only — no exports
}

declare module 'virtual:framework-svg-registry' {
  const map: Map<string, string>;
  export default map;
}
```

## Shapes by entry type

### `side-effect` entries

A side-effect module has no exports. An empty declaration is all TypeScript needs:

```ts
declare module 'virtual:my-css' {
  // side-effect only
}
```

### `raw-map` entries

A raw-map module exports `Map<string, string>` as its default export. The key is always the bare filename:

```ts
declare module 'virtual:my-registry' {
  const map: Map<string, string>;
  export default map;
}
```

## Placement

TypeScript picks up `virtual-modules.d.ts` automatically if it's in a directory covered by your `tsconfig.json`. A typical setup that covers both `src/` and `.storybook/`:

```json
{
  "include": ["src", ".storybook"]
}
```

Place the file in whichever directory is most natural for where the virtual imports are used. For Storybook, placing it directly in `.storybook/` is the most explicit option.
