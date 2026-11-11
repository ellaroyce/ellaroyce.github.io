import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { Reveal } from './Reveal';

const MODULES: Array<{ title: CopyKey; text: CopyKey }> = [
  { title: 'svc1.h', text: 'svc1.p' },
  { title: 'svc2.h', text: 'svc2.p' },
  { title: 'svc3.h', text: 'svc3.p' },
  { title: 'svc5.h', text: 'svc5.p' },
];

/** Services as a system map: four modules routing into one architecture. */
export function Services() {
  const { t } = usePrefs();
  return (
    <section className="section services" id="work">
      <div className="wrap">
        <header className="section__head">
          <Reveal as="p" className="eyebrow">{t('work.eyebrow')}</Reveal>
          <Reveal as="h2" className="section__title">{t('work.title')}</Reveal>
          <Reveal as="p" className="section__lede">{t('work.lede')}</Reveal>
        </header>

        <ol className="modules">
          {MODULES.map((m, i) => (
            <Reveal as="li" className="module" key={m.title}>
              <div className="module__index">
                <span className="module__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="module__wire" aria-hidden="true" />
              </div>
              <div className="module__body">
                <h3 className="module__title">{t(m.title)}</h3>
                <p className="module__text">{t(m.text)}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
