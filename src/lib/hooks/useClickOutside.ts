import { useEffect, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  onOutside: () => void,
  active = true,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) {
        onOutside();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, onOutside, active]);
}
