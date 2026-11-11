import { useEffect, useRef, useState } from 'react';
import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { prefersReducedMotion } from '../lib/site';
import { Reveal } from './Reveal';

const STATS: Array<{ count: number; label: CopyKey }> = [
  { count: 9, label: 'rail.1' },
  { count: 10, label: 'rail.2' },
  { count: 2500, label: 'rail.3' },
];

const COUNT_MS = 900;

/** A number that counts up once when it scrolls into view. */
function CountUp({ target }: { target: number }) {
  const { lang } = usePrefs();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / COUNT_MS);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span className="stat__num" ref={ref}>
      {value.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}+
    </span>
  );
}

/** Proof strip: truthful stats and credentials only. */
export function ProofStrip() {
  const { t } = usePrefs();
  return (
    <section className="strip strip--proof" aria-label={t('rail.label')}>
      <div className="strip__inner">
        {STATS.map((s) => (
          <Reveal className="stat" key={s.label}>
            <CountUp target={s.count} />
            <span className="stat__label">{t(s.label)}</span>
          </Reveal>
        ))}
        <Reveal className="stat">
          <span className="stat__num stat__num--text">Google · GitHub · Anthropic</span>
          <span className="stat__label">{t('rail.4')}</span>
        </Reveal>
      </div>
    </section>
  );
}
