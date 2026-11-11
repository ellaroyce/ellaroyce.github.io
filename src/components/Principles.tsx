import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { Reveal } from './Reveal';

const PRINCIPLES: Array<{ title: CopyKey; text: CopyKey }> = [
  { title: 'principles.p1t', text: 'principles.p1' },
  { title: 'principles.p2t', text: 'principles.p2' },
  { title: 'principles.p3t', text: 'principles.p3' },
];

/** Operating principles. */
export function Principles() {
  const { t } = usePrefs();
  return (
    <section className="section principles" id="principles">
      <div className="wrap">
        <Reveal as="p" className="eyebrow">{t('principles.eyebrow')}</Reveal>
        <Reveal as="blockquote" className="principles__quote">{t('principles.quote')}</Reveal>

        <div className="principles__grid">
          {PRINCIPLES.map((p) => (
            <Reveal className="principle" key={p.title}>
              <span className="principle__tick" aria-hidden="true" />
              <h3 className="principle__title">{t(p.title)}</h3>
              <p className="principle__text">{t(p.text)}</p>
            </Reveal>
          ))}
        </div>

        <Reveal as="p" className="principles__refs">{t('principles.refs')}</Reveal>
      </div>
    </section>
  );
}
