export const MISSION_STAGES: readonly string[];
export interface MissionEngine {
  /** Recompute snap points after layout changes. */
  refresh(): void;
  destroy(): void;
}
export interface MissionOptions {
  gsap: unknown;
  ScrollTrigger: unknown;
  Lenis: unknown;
  fillEl: HTMLElement | null;
  onStage(index: number): void;
  onReady(ready: boolean): void;
}
export function mountMission(opts: MissionOptions): MissionEngine | null;
