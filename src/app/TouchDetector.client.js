"use client";

import { useEffect } from 'react';

export default function TouchDetector() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Be conservative: only enable touch-mode when the environment
    // strongly indicates a touch-capable device. This avoids false-
    // positives on desktop where touchstart/event shims or hybrid
    // input might trigger hover-related bugs.
    const hasTouchPoints = (navigator.maxTouchPoints || 0) > 0 || (navigator.msMaxTouchPoints || 0) > 0;
    const supportsTouchEvent = 'ontouchstart' in window;
    const prefersNoHover = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!hasTouchPoints && !supportsTouchEvent && !prefersNoHover) {
      // Likely not a touch device — don't install touchstart listener.
      return;
    }

    function onFirstTouch() {
      try {
        document.documentElement.classList.add('is-touch');
      } catch (e) {
        // ignore
      }
      window.removeEventListener('touchstart', onFirstTouch, { passive: true });
    }

    window.addEventListener('touchstart', onFirstTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onFirstTouch, { passive: true });
    };
  }, []);

  return null;
}
