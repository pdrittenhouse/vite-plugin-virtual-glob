import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'vite-plugin-virtual-glob',
  tagline: 'Virtual modules from filesystem globs — solves the static-path limitation of import.meta.glob()',

  url: 'https://pdrittenhouse.github.io',
  baseUrl: '/vite-plugin-virtual-glob/',

  organizationName: 'pdrittenhouse',
  projectName: 'vite-plugin-virtual-glob',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          path: '.',
          routeBasePath: '/',
          exclude: [
            '**/node_modules/**',
            '**/build/**',
            '**/.docusaurus/**',
            '**/src/**',
            '**/static/**',
          ],
          editUrl: 'https://github.com/pdrittenhouse/vite-plugin-virtual-glob/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'vite-plugin-virtual-glob',
      items: [
        {
          to: '/intro',
          label: 'Getting Started',
          position: 'left',
        },
        {
          to: '/api-reference',
          label: 'API Reference',
          position: 'left',
        },
        {
          to: '/guides/storybook',
          label: 'Guides',
          position: 'left',
        },
        {
          href: 'https://github.com/pdrittenhouse/vite-plugin-virtual-glob',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@pdrittenhouse/vite-plugin-virtual-glob',
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/intro' },
            { label: 'API Reference', to: '/api-reference' },
            { label: 'Storybook Guide', to: '/guides/storybook' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/pdrittenhouse/vite-plugin-virtual-glob' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@pdrittenhouse/vite-plugin-virtual-glob' },
            { label: 'Changelog', to: '/changelog' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Patrick Rittenhouse. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
