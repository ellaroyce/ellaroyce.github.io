import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { observeReveal } from '../lib/reveal';
import { cx } from '../lib/site';

type RevealProps<T extends ElementType> = {
  /** Element to render. Defaults to a div. */
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children' | 'style'>;

/** Fades its element in the first time it scrolls into view. */
export function Reveal<T extends ElementType = 'div'>({ as, className, children, ...rest }: RevealProps<T>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const [delay, setDelay] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, setDelay);
  }, []);

  return (
    <Tag
      ref={ref}
      className={cx('reveal', delay !== null && 'in', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
