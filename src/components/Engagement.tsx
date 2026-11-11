import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { Reveal } from './Reveal';

const TIERS: Array<{ index: string; label: CopyKey; detail: CopyKey }> = [
  { index: 'A', label: 'engage.t1l', detail: 'engage.t1d' },
  { index: 'B', label: 'engage.t2l', detail: 'engage.t2d' },
  { index: 'C', label: 'engage.t3l', detail: 'engage.t3d' },
];

/** Engagement model / process. */
export function Engagement() {
  const { t } = usePrefs();
  return (
    <section className="section engage" id="process">
      <div className="wrap engage__grid">
        <Reveal className="engage__left">
          <p className="eyebrow">{t('engage.eyebrow')}</p>
          <h2 className="section__title section__title--sm">{t('engage.title')}</h2>
          <p className="section__lede">{t('engage.lede')}</p>
          <p className="section__lede">{t('engage.body')}</p>
        </Reveal>
        <div className="engage__right">
          {TIERS.map((tier) => (
            <Reveal className="tier" key={tier.index}>
              <span className="tier__index">{tier.index}</span>
              <div>
                <span className="tier__label">{t(tier.label)}</span>
                <p className="tier__detail">{t(tier.detail)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
