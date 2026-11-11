export interface IntroEngine {
  play(opts?: { force?: boolean }): void;
  skip(): void;
  destroy(): void;
}
export interface IntroOptions {
  overlay: HTMLElement;
  canvas: HTMLCanvasElement;
  statusEl: HTMLElement | null;
  /** Has the intro already played in this browser session? */
  hasPlayed(): boolean;
  markPlayed(): void;
  /** Localised text announced to screen readers when the intro starts. */
  getStatus(): string;
  /** Called the moment the overlay starts to fade. */
  onHandoff(): void;
}
export function createIntro(opts: IntroOptions): IntroEngine | null;
