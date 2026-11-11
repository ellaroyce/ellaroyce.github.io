import type { Ref } from 'react';

export function Logo({ size, ref }: { size: number; ref?: Ref<SVGSVGElement> }) {
  return (
    <svg ref={ref} className="nav__logo" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.85">
        <path d="M16 6 L16 11.5 M16 20.5 L16 26 M6 16 L11.5 16 M20.5 16 L26 16" />
      </g>
      <circle cx="6" cy="16" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="26" cy="16" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="6" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="26" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="16" r="4.6" fill="none" stroke="var(--cobalt)" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="1.9" fill="var(--signal)" />
    </svg>
  );
}
