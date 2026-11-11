export interface FlightEngine {
  /** Recompute the route after layout changes (fonts, language switch). */
  refresh(): void;
  destroy(): void;
}
export function mountFlight(canvas: HTMLCanvasElement): FlightEngine | null;
