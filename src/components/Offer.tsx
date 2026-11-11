import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { BOOKING_URL } from '../lib/site';
import { Reveal } from './Reveal';

const POINTS: CopyKey[] = ['offer.li1', 'offer.li2', 'offer.li3'];
const SPECS: Array<{ term: CopyKey; value: CopyKey }> = [
  { term: 'offer.m1', value: 'offer.m1v' },
  { term: 'offer.m2', value: 'offer.m2v' },
  { term: 'offer.m3', value: 'offer.m3v' },
];

/** Health check offer: cobalt panel with a system-spec sidebar. */
export function Offer() {
  const { t } = usePrefs();
  return (
    <section className="section" aria-label={t('offer.label')}>
      <div className="wrap">
        <Reveal className="offer">
          <div className="offer__body">
            <span className="offer__badge">{t('offer.badge')}</span>
            <h2 className="offer__title">{t('offer.title')}</h2>
            <p className="offer__lede">{t('offer.lede')}</p>
            <ul className="offer__list" role="list">
              {POINTS.map((key) => <li key={key}>{t(key)}</li>)}
            </ul>
          </div>
          <div className="offer__aside">
            <dl className="offer__specs">
              {SPECS.map((s) => (
                <div key={s.term}>
                  <dt>{t(s.term)}</dt>
                  <dd>{t(s.value)}</dd>
                </div>
              ))}
            </dl>
            <a href={BOOKING_URL} className="btn btn--ondark offer__cta" target="_blank" rel="noopener noreferrer">
              {t('offer.cta')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
