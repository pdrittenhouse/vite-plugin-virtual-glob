---
layout: home

hero:
  name: vite-plugin-virtual-glob
  text: Virtual modules from filesystem globs
  tagline: Solves the static-path limitation of import.meta.glob() — register a virtual ID for any runtime-resolved pattern and import it like any other module.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pdrittenhouse/vite-plugin-virtual-glob

features:
  - icon:
      src: /icons/funnel.svg
    title: Dynamic path resolution
    details: import.meta.glob() requires a string literal. This plugin resolves patterns in Node.js at serve/build time, so the path can be computed from the filesystem, environment, or any runtime value.
  - icon:
      src: /icons/puzzle.svg
    title: CSS side-effect injection
    details: The side-effect entry type generates one import per matched file — equivalent to eager import.meta.glob() but with a path you control. Vite's CSS pipeline, HMR, and all processing apply normally.
  - icon:
      src: /icons/blocks.svg
    title: Raw content maps
    details: The raw-map entry type exports a Map<filename, content> with file contents inlined as strings. Ideal for SVG icon registries, JSON data files, or any text assets you need to look up by name at runtime.
  - icon:
      src: /icons/gear.svg
    title: File watching included
    details: Every matched file is registered with Vite's watch system. Change a file and the virtual module is invalidated — no manual cache busting required.
  - icon:
      src: /icons/pencil.svg
    title: Custom transforms
    details: An optional transform function lets you process each file's raw content before it enters the map. The built-in stripSvgMetadata helper strips XML declarations and comments from SVG files.
  - icon:
      src: /icons/book.svg
    title: Fully typed
    details: Written in TypeScript with exported types for all entry interfaces, the transform signature, and the virtualGlob function itself.
---
