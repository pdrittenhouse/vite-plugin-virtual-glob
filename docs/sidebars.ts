import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'api-reference',
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/storybook',
        'guides/custom-transforms',
        'guides/typescript',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
