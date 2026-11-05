import { useLayoutEffect, useRef, useState } from 'react';

const PREVIEW_HEIGHT = 72;

/** Measure the complete card body even while its visible viewport is clipped. */
export default function useAnimatedCardHeight(collapsed: boolean) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [fullHeight, setFullHeight] = useState(PREVIEW_HEIGHT);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setFullHeight(content.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    contentRef.current?.querySelectorAll('[aria-hidden]').forEach((section) => {
      if (collapsed) section.setAttribute('inert', '');
      else section.removeAttribute('inert');
    });
  }, [collapsed]);

  return {
    contentRef,
    height: collapsed ? Math.min(fullHeight, PREVIEW_HEIGHT) : fullHeight
  };
}
