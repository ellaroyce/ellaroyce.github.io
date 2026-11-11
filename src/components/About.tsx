import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { Reveal } from './Reveal';

// Credential names are proper nouns and stay untranslated; `nameKey` is used
// where the name itself is copy.
const EVIDENCE: Array<{ name?: string; nameKey?: CopyKey; desc: CopyKey }> = [
  { name: 'ArchiMate', desc: 'certs.c1' },
  { name: 'IPMA', desc: 'certs.c2' },
  { name: 'GitHub Foundations', desc: 'certs.c3' },
  { name: 'Google', desc: 'certs.c5' },
  { name: 'Anthropic', desc: 'certs.c6' },
  { nameKey: 'certs.c4n', desc: 'certs.c4' },
];

/** About: first-person copy plus a credentials evidence rail. */
export function About() {
  const { t } = usePrefs();
  return (
    <section className="section about" id="about">
      <div className="wrap about__grid">
        <Reveal className="about__copy">
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h2 className="section__title section__title--sm">{t('about.title')}</h2>
          <p className="about__bio">{t('about.bio')}</p>
          <p className="about__bio">{t('about.bio2')}</p>
        </Reveal>

        <Reveal as="aside" className="about__evidence" aria-label={t('evidence.label')}>
          <p className="evidence__intro">{t('evidence.intro')}</p>
          <ul className="evidence__list" role="list">
            {EVIDENCE.map((item) => (
              <li className="evidence__item" key={item.desc}>
                <span className="evidence__name">{item.nameKey ? t(item.nameKey) : item.name}</span>
                <span className="evidence__desc">{t(item.desc)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
