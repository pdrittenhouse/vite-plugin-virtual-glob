import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'vite-plugin-virtual-glob',
  description: 'Vite plugin that creates virtual modules from filesystem globs — solves the static-path limitation of import.meta.glob()',
  base: '/vite-plugin-virtual-glob/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vite-plugin-virtual-glob/favicon.svg' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/', activeMatch: '/api/' },
      {
        text: '0.1.1',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@pdrittenhouse/vite-plugin-virtual-glob' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Storybook Integration', link: '/guide/storybook' },
          { text: 'Custom Transforms', link: '/guide/custom-transforms' },
          { text: 'TypeScript', link: '/guide/typescript' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'virtualGlob()', link: '/api/virtual-glob' },
          { text: 'Entry Types', link: '/api/entries' },
          { text: 'Transforms', link: '/api/transforms' },
          { text: 'Types', link: '/api/types' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdrittenhouse/vite-plugin-virtual-glob' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@pdrittenhouse/vite-plugin-virtual-glob' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © P.D. Rittenhouse',
    },

    editLink: {
      pattern: 'https://github.com/pdrittenhouse/vite-plugin-virtual-glob/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
    },
  },
});
