// Scroll reveal: one shared IntersectionObserver for every <Reveal> element.
// Elements fade/slide in once, staggered by their position among the reveal
// elements of the same parent (max 4 steps of 70ms), as on the original site.
import { prefersReducedMotion } from './site';

type OnShow = (delayMs: number) => void;

const pending = new Map<Element, OnShow>();
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const onShow = pending.get(el);
        pending.delete(el);
        observer?.unobserve(el);
        const siblings = el.parentElement ? Array.from(el.parentElement.querySelectorAll('.reveal')) : [];
        onShow?.(Math.min(Math.max(siblings.indexOf(el), 0), 4) * 70);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  return observer;
}

export function observeReveal(el: Element, onShow: OnShow): () => void {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    onShow(0);
    return () => {};
  }
  pending.set(el, onShow);
  getObserver().observe(el);
  return () => {
    pending.delete(el);
    observer?.unobserve(el);
  };
}
