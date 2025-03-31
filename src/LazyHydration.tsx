import React, { useId, useRef, useEffect, useState, useCallback } from 'react';

import type { LazyHydrationProps } from './types';

const isServer = typeof window === 'undefined';

const WRAPPER_STYLE = { display: 'contents' };

export const LazyHydration = React.forwardRef<HTMLDivElement, LazyHydrationProps>(
  ({ fallback, children, intersectionObserver, idleCallback, events = [] }, ref) => {
    const id = useId();
    const htmlRef = useRef<string | null>(null);
    const [shouldHydrate, setShouldHydrate] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const isHydrated = useRef(false);

    const handleRef = useCallback(
      (node: HTMLDivElement | null) => {
        elementRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    useEffect(() => {
      const cleanups: (() => void)[] = [];

      // Intersection Observer trigger
      if (intersectionObserver && elementRef.current) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            setShouldHydrate(true);
            observer.disconnect();
          }
        }, intersectionObserver);
        observer.observe(elementRef.current);
        cleanups.push(() => observer.disconnect());
      }

      // Idle Callback trigger
      if (idleCallback) {
        if ('requestIdleCallback' in window) {
          const idleId = window.requestIdleCallback(() => setShouldHydrate(true), {
            timeout: idleCallback.timeout,
          });
          cleanups.push(() => window.cancelIdleCallback(idleId));
        } else {
          // Fallback for browsers that don't support requestIdleCallback
          const timeoutId = setTimeout(() => setShouldHydrate(true), idleCallback.timeout || 0);
          cleanups.push(() => clearTimeout(timeoutId));
        }
      }

      // Event triggers
      if (events.length > 0) {
        const handleEvent = () => setShouldHydrate(true);
        events.forEach((event) => {
          window.addEventListener(event, handleEvent, { once: true });
        });
        cleanups.push(() => {
          events.forEach((event) => {
            window.removeEventListener(event, handleEvent);
          });
        });
      }

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }, [intersectionObserver, idleCallback, events]);

    if (isServer || shouldHydrate || isHydrated.current) {
      if (!isHydrated.current) isHydrated.current = true;

      return (
        <div ref={handleRef} style={WRAPPER_STYLE} id={id} suppressHydrationWarning>
          {children}
        </div>
      );
    }

    if (htmlRef.current === null) {
      htmlRef.current = document.getElementById(id)?.innerHTML || '';
    }

    if (htmlRef.current === '') {
      return (
        <div ref={handleRef} style={WRAPPER_STYLE} id={id} suppressHydrationWarning>
          {fallback}
        </div>
      );
    }

    return (
      <div
        ref={handleRef}
        style={WRAPPER_STYLE}
        id={id}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: htmlRef.current }}
      />
    );
  }
);
