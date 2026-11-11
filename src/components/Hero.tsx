import { useEffect, useRef, type RefObject } from 'react';
import { mountHero, type HeroEngine } from '../engines/hero.js';
import { usePrefs } from '../lib/PrefsContext';
import { BOOKING_URL, prefersReducedMotion } from '../lib/site';
import { Reveal } from './Reveal';

interface HeroProps {
  /** Receives the running canvas engine (intro hand-off, logo easter egg). */
  engineRef: RefObject<HeroEngine | null>;
  onReplayIntro(): void;
}

/** Hero: living architecture map on canvas, short confident copy. */
export function Hero({ engineRef, onReplayIntro }: HeroProps) {
  const { t } = usePrefs();
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const engine = mountHero(canvas.current, section.current);
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [engineRef]);

  // The "/" key focuses the booking CTA, like a command palette.
  useEffect(() => {
    let timer = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const el = cta.current;
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      el.focus({ preventScroll: true });
      el.classList.add('btn--ping');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => el.classList.remove('btn--ping'), 700);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={section}>
      <canvas id="hero-canvas" className="hero__canvas" aria-hidden="true" ref={canvas} />
      <p className="hero__viz-note sr-only">{t('hero.vizalt')}</p>

      <div className="hero__inner">
        <Reveal as="p" className="hero__tag">
          <span className="hero__dot" aria-hidden="true" />
          {t('hero.eyebrow')}
        </Reveal>
        <Reveal as="h1" className="hero__statement">
          <span className="hero__line">{t('hero.l1')}</span>{' '}
          <span className="hero__line hero__line--accent">{t('hero.l2')}</span>
        </Reveal>
        <Reveal as="p" className="hero__lede">{t('hero.lede')}</Reveal>
        <Reveal className="hero__meta">
          <span>{t('hero.role')}</span>
          <span className="hero__sep" aria-hidden="true">/</span>
          <span>{t('hero.place')}</span>
        </Reveal>
        <Reveal className="hero__actions">
          <a href={BOOKING_URL} className="btn btn--primary" target="_blank" rel="noopener noreferrer" ref={cta}>
            {t('hero.cta1')}
          </a>
          <a href="#work" className="btn btn--ghost">{t('hero.cta2')}</a>
        </Reveal>
        <Reveal as="p" className="hero__hint" aria-hidden="true">
          <kbd>/</kbd> <span>{t('hero.hint')}</span>
        </Reveal>
        <Reveal as="p" className="hero__replay-wrap">
          <button type="button" id="intro-replay" className="hero__replay" onClick={onReplayIntro}>
            {t('intro.replay')}
          </button>
        </Reveal>
      </div>

      <Reveal as="ul" className="hero__legend" aria-hidden="true">
        <li><span className="legend__mark legend__mark--node" /><span>{t('hero.leg1')}</span></li>
        <li><span className="legend__mark legend__mark--cluster" /><span>{t('hero.leg2')}</span></li>
        <li><span className="legend__mark legend__mark--core" /><span>{t('hero.leg3')}</span></li>
      </Reveal>
    </section>
  );
}
