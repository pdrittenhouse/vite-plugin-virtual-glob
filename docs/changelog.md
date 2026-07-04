# Changelog

## 0.1.1 <small>2025-07-03</small>

### Changed

- Upgraded `glob` dependency from `^11.0.0` to `^13.0.0` (v11 was deprecated upstream)

---

## 0.1.0 <small>2025-07-03</small>

### Added

- `virtualGlob(entries)` — Vite plugin factory accepting an array of virtual module entries
- `SideEffectEntry` — generates a module that eagerly imports every matched file (equivalent to `import.meta.glob(pattern, { eager: true })` with a runtime-resolved path)
- `RawMapEntry` — generates a module that exports `Map<filename, content>` with file contents inlined as strings; supports an optional `transform` function
- `stripSvgMetadata` — built-in transform that strips XML declarations and HTML comments from SVG content
- File watching via `this.addWatchFile()` — virtual modules are invalidated on file change
- TypeScript types exported from the package root (`VirtualGlobEntry`, `SideEffectEntry`, `RawMapEntry`)
- Dual CJS/ESM build via `tsup`
