import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { Reveal } from './Reveal';

const QUESTIONS: Array<{ q: CopyKey; a: CopyKey }> = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
];

/** FAQ: native <details>, so it works without JavaScript. */
export function Faq() {
  const { t } = usePrefs();
  return (
    <section className="section faq" id="faq">
      <div className="wrap">
        <header className="section__head">
          <Reveal as="p" className="eyebrow">{t('faq.eyebrow')}</Reveal>
          <Reveal as="h2" className="section__title">{t('faq.title')}</Reveal>
        </header>
        <div className="faq__list">
          {QUESTIONS.map((item) => (
            <Reveal as="details" className="faq__item" key={item.q}>
              <summary>{t(item.q)}</summary>
              <p>{t(item.a)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
