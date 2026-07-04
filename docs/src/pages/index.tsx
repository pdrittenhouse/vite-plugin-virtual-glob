import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const features = [
  {
    title: 'Getting Started',
    description: 'Install the plugin, register your first virtual module, and import it in 5 minutes.',
    link: '/vite-plugin-virtual-glob/intro',
    linkLabel: 'Get started →',
  },
  {
    title: 'API Reference',
    description: 'Full reference for virtualGlob(), SideEffectEntry, RawMapEntry, and stripSvgMetadata.',
    link: '/vite-plugin-virtual-glob/api-reference',
    linkLabel: 'View API →',
  },
  {
    title: 'Storybook Guide',
    description: 'The primary use case — load parent-theme CSS and SVG registries from dynamic paths in viteFinal.',
    link: '/vite-plugin-virtual-glob/guides/storybook',
    linkLabel: 'Read guide →',
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout title="vite-plugin-virtual-glob" description="Virtual modules from filesystem globs — solves the static-path limitation of import.meta.glob()">
      <main>
        <section className={styles.hero}>
          <h1 className={styles.title}>vite-plugin-virtual-glob</h1>
          <p className={styles.tagline}>
            Virtual modules from filesystem globs.
            <br />
            <span className={styles.taglineSub}>
              Solves the static-path limitation of <code>import.meta.glob()</code>.
            </span>
          </p>
          <pre className={styles.installCmd}>npm install --save-dev @pdrittenhouse/vite-plugin-virtual-glob</pre>
          <div className={styles.actions}>
            <Link className={styles.btnPrimary} to="/vite-plugin-virtual-glob/intro">
              Get Started
            </Link>
            <Link className={styles.btnSecondary} href="https://github.com/pdrittenhouse/vite-plugin-virtual-glob">
              GitHub
            </Link>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresGrid}>
            {features.map(({ title, description, link, linkLabel }) => (
              <div key={title} className={styles.card}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardDesc}>{description}</p>
                <Link to={link} className={styles.cardLink}>
                  {linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
