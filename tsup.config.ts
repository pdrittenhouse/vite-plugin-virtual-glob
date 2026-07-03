import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  // glob is bundled so consumers need only vite installed.
  // path and fs are Node built-ins — always external.
  external: ['vite', 'path', 'fs'],
  platform: 'node',
  target: 'node20',
});
