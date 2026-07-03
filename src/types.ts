/**
 * A virtual module that imports every matched file as a side effect.
 *
 * The generated module body is one `import '/abs/path/to/file';` line per
 * match — equivalent to `void import.meta.glob(pattern, { eager: true })`
 * but with a runtime-resolved pattern.
 *
 * Typical use: CSS files you want injected without capturing the exports.
 *
 * @example
 * ```ts
 * {
 *   id: 'virtual:parent-pattern-css',
 *   pattern: path.join(PARENT, 'dist/wp/css/patterns/**\/*.css'),
 *   type: 'side-effect',
 * }
 * ```
 * ```ts
 * // consumer
 * import 'virtual:parent-pattern-css';
 * ```
 */
export interface SideEffectEntry {
  /** Virtual module ID used in import statements, e.g. `'virtual:parent-pattern-css'`. */
  id: string;
  /**
   * Absolute glob pattern passed to `glob.globSync`.
   * Must be an absolute path — relative patterns are resolved from `process.cwd()`,
   * which is unpredictable inside Vite plugins.
   */
  pattern: string;
  type: 'side-effect';
}

/**
 * A virtual module that exports a `Map<filename, rawContent>` built from
 * all files matching the pattern.
 *
 * File contents are read at build/serve time and inlined as string literals
 * in the generated module. An optional `transform` function is applied to
 * each file's content before it enters the map.
 *
 * The map key is the bare filename (no directory path), e.g. `'icon-arrow.svg'`.
 *
 * @example
 * ```ts
 * {
 *   id: 'virtual:framework-svg-registry',
 *   pattern: path.join(FRAMEWORK, 'src/design-system/patterns/01-atoms/svg/svg/**\/*.svg'),
 *   type: 'raw-map',
 *   transform: stripSvgMetadata,
 * }
 * ```
 * ```ts
 * // consumer
 * import svgMap from 'virtual:framework-svg-registry';
 * const content = svgMap.get('icon-arrow.svg');
 * ```
 */
export interface RawMapEntry {
  /** Virtual module ID used in import statements, e.g. `'virtual:framework-svg-registry'`. */
  id: string;
  /**
   * Absolute glob pattern passed to `glob.globSync`.
   * Must be an absolute path — see {@link SideEffectEntry.pattern}.
   */
  pattern: string;
  type: 'raw-map';
  /**
   * Optional transform applied to each file's raw string content before it is
   * stored in the map. Receives the raw content and the absolute file path.
   * Use {@link stripSvgMetadata} for SVG files.
   */
  transform?: (content: string, filePath: string) => string;
}

/** Union of all supported virtual module entry types. */
export type VirtualGlobEntry = SideEffectEntry | RawMapEntry;
