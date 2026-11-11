export interface HeroEngine {
  /** Replay the formation from a clean state (intro hand-off). */
  kick(): void;
  /** Fire a burst of signals toward the core (logo easter egg). */
  burst(): void;
  destroy(): void;
}
export function mountHero(canvas: HTMLCanvasElement, heroSection: HTMLElement | null): HeroEngine | null;
