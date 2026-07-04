---
id: typescript
title: TypeScript Declarations
sidebar_label: TypeScript
---

# TypeScript Declarations

Virtual module IDs like `'virtual:parent-pattern-css'` are not known to TypeScript — importing them without a declaration produces a `Cannot find module` error. Add a `virtual-modules.d.ts` file to declare their shapes.

## Creating the declaration file

Create `virtual-modules.d.ts` alongside your `.storybook/` config directory (or in your project root's `src/` if you use the plugin in a standard Vite app):

```ts
// virtual-modules.d.ts

declare module 'virtual:parent-pattern-css' {
  // side-effect only — this module has no exports
}

declare module 'virtual:framework-svg-registry' {
  const map: Map<string, string>;
  export default map;
}
```

## Declaration shapes by type

### `side-effect` entries

A side-effect module has no exports. An empty module declaration is sufficient:

```ts
declare module 'virtual:my-css' {
  // side-effect only
}
```

### `raw-map` entries

A raw-map module exports a `Map<string, string>` as its default export. The key is always the bare filename; the value is the processed file content:

```ts
declare module 'virtual:my-registry' {
  const map: Map<string, string>;
  export default map;
}
```

## Placement

TypeScript will pick up `virtual-modules.d.ts` automatically if it's:

- In a directory included by your `tsconfig.json`'s `include` or `rootDir`
- In the same directory as the files that import the virtual IDs

For Storybook, placing it in `.storybook/` works if your `tsconfig.json` includes that directory. Alternatively, place it in `src/` or the project root.

## Checking your tsconfig

Make sure the file is covered by your `tsconfig.json`. A typical setup:

```json
{
  "include": ["src", ".storybook"]
}
```

If you place `virtual-modules.d.ts` in `.storybook/` but that directory isn't in `include`, TypeScript won't find the declarations.
