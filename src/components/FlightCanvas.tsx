import { useEffect, useRef, type RefObject } from 'react';
import { mountFlight, type FlightEngine } from '../engines/scrollflight.js';

/**
 * Persistent scroll-flight layer: the shuttle travels down the page as the
 * visitor scrolls. Decorative, never intercepts input.
 */
export function FlightCanvas({ engineRef }: { engineRef: RefObject<FlightEngine | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const engine = mountFlight(canvas.current);
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [engineRef]);

  return <canvas id="flight-canvas" className="flight-canvas" aria-hidden="true" ref={canvas} />;
}
