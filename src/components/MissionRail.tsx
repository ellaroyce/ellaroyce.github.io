import type { Ref } from 'react';
import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { cx } from '../lib/site';

// One label per mission stage, in page order (see MISSION_STAGES in engines/mission.js).
const LABELS: CopyKey[] = [
  'mission.launch', 'mission.transit', 'mission.route', 'mission.signal',
  'mission.systems', 'mission.checks', 'mission.arrival',
];

interface MissionRailProps {
  /** True once scroll tracking is active; fades the rail in. */
  ready: boolean;
  /** Index of the stage the visitor is in, or -1 before the first update. */
  stage: number;
  /** The fill bar, driven directly by the scroll engine (transform only). */
  fillRef: Ref<HTMLDivElement>;
}

/** Fixed mission-progress rail on the right edge. Decorative, non-interactive. */
export function MissionRail({ ready, stage, fillRef }: MissionRailProps) {
  const { t } = usePrefs();
  return (
    <div id="mission-rail" className={cx(ready && 'is-ready')} aria-hidden="true">
      <div className="mission-rail__track">
        <div className="mission-rail__fill" ref={fillRef} />
      </div>
      {LABELS.map((key, i) => (
        <div className={cx('mission-rail__stage', i === stage && 'is-active', i < stage && 'is-past')} key={key}>
          <span className="mission-rail__dot" />
          <span className="mission-rail__label">{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
