# Entry Types

## SideEffectEntry

Generates a virtual module that imports every matched file as a side effect. The generated module body is one `import '/abs/path/to/file';` line per match — equivalent to `void import.meta.glob(pattern, { eager: true })` but with a runtime-resolved pattern.

**Use for:** CSS files or anything you want injected without capturing exports.

```ts
interface SideEffectEntry {
  id: string;
  pattern: string;
  type: 'side-effect';
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Virtual module ID used in import statements, e.g. `'virtual:theme-css'`. Must start with `virtual:` by convention. |
| `pattern` | `string` | Absolute glob pattern. See [Pattern requirements](#pattern-requirements). |
| `type` | `'side-effect'` | Discriminant — selects this entry type. |

### Example

```ts
// register
{
  id: 'virtual:pattern-css',
  pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css'),
  type: 'side-effect',
}

// consume
import 'virtual:pattern-css';
```

If no files match the pattern, the module is a no-op comment — no error is thrown.

---

## RawMapEntry

Generates a virtual module that exports `Map<filename, rawContent>`. File contents are read at build/serve time and inlined as string literals. The map key is the **bare filename** with no directory path, e.g. `'icon-arrow.svg'`.

**Use for:** SVG icon registries, JSON data files, or any raw text assets you need to look up by name at runtime.

```ts
interface RawMapEntry {
  id: string;
  pattern: string;
  type: 'raw-map';
  transform?: (content: string, filePath: string) => string;
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Virtual module ID used in import statements, e.g. `'virtual:svg-registry'`. |
| `pattern` | `string` | Absolute glob pattern. See [Pattern requirements](#pattern-requirements). |
| `type` | `'raw-map'` | Discriminant — selects this entry type. |
| `transform` | `(content: string, filePath: string) => string` | Optional. Applied to each file's raw content before it is stored in the map. See [Custom Transforms](/guide/custom-transforms). |

### Example

```ts
// register
{
  id: 'virtual:svg-registry',
  pattern: path.join(ICONS_DIR, '**/*.svg'),
  type: 'raw-map',
  transform: stripSvgMetadata,
}

// consume
import svgMap from 'virtual:svg-registry';
// Map { 'icon-arrow.svg' => '<svg>…</svg>', 'icon-close.svg' => '…' }

const content = svgMap.get('icon-arrow.svg');
```

::: warning `raw-map` content is inlined at build time
File contents become string literals in the generated module. Avoid using `raw-map` for large files — use `side-effect` or a standard Vite asset import instead.
:::

---

## Pattern requirements

Both entry types require **absolute glob patterns**. Relative patterns are resolved from `process.cwd()`, which is unpredictable inside a Vite plugin.

```ts
// ✅ correct — absolute path built with path.join()
pattern: path.join(THEME_DIR, 'dist/css/patterns/**/*.css')

// ❌ wrong — resolved from cwd, not the calling file
pattern: '../../theme/dist/css/patterns/**/*.css'
```
