import { useEffect, useRef, type RefObject } from 'react';
import { createIntro, type IntroEngine } from '../engines/intro.js';
import { usePrefs } from '../lib/PrefsContext';
import { introPlayed, markIntroPlayed } from '../lib/prefs';

interface IntroProps {
  /** Receives the running engine so other components can replay or skip it. */
  engineRef: RefObject<IntroEngine | null>;
  /** Called the moment the overlay starts to fade out. */
  onHandoff(): void;
}

/**
 * Cinematic launch intro. Plays once per session and is skipped under reduced
 * motion. The canvas animation itself lives in engines/intro.js; this component
 * renders the overlay and wires it up.
 */
export function Intro({ engineRef, onHandoff }: IntroProps) {
  const { t } = usePrefs();
  const overlay = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const status = useRef<HTMLParagraphElement>(null);

  // The engine is created once; it reads the latest copy/callback through a ref.
  const latest = useRef({ t, onHandoff });
  latest.current = { t, onHandoff };

  useEffect(() => {
    if (!overlay.current || !canvas.current) return;
    const engine = createIntro({
      overlay: overlay.current,
      canvas: canvas.current,
      statusEl: status.current,
      hasPlayed: introPlayed,
      markPlayed: markIntroPlayed,
      getStatus: () => latest.current.t('intro.status'),
      onHandoff: () => latest.current.onHandoff(),
    });
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [engineRef]);

  return (
    <div id="intro" className="intro" role="dialog" aria-label={t('intro.label')} aria-modal="true" ref={overlay}>
      <canvas id="intro-canvas" className="intro__canvas" aria-hidden="true" ref={canvas} />
      <p id="intro-status" className="sr-only" role="status" aria-live="polite" ref={status} />
      <button type="button" id="intro-skip" className="intro__skip" onClick={() => engineRef.current?.skip()}>
        {t('intro.skip')}
      </button>
    </div>
  );
}
