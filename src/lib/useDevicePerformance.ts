import { useState, useEffect, useMemo } from 'react';

interface DevicePerformance {
  /** True if the device is detected as low-end (mobile, few cores, low memory) */
  isLowEnd: boolean;
  /** True if user has enabled "Reduce Motion" in OS accessibility settings */
  prefersReducedMotion: boolean;
  /** True if the device is a touch-only device (phone/tablet) */
  isTouchDevice: boolean;
  /** True if screen width < 768px */
  isMobile: boolean;
}

// Singleton detection — calculated once for the app lifetime
let _cachedResult: DevicePerformance | null = null;

function detect(): DevicePerformance {
  if (_cachedResult) return _cachedResult;

  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const win = typeof window !== 'undefined' ? window : null;

  // 1. Reduced motion preference
  const prefersReducedMotion = win
    ? win.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // 2. Touch device detection
  const isTouchDevice = win
    ? win.matchMedia('(pointer: coarse)').matches
    : false;

  // 3. Mobile screen
  const isMobile = win ? win.innerWidth < 768 : false;

  // 4. Hardware heuristics
  const cores = (nav as any)?.hardwareConcurrency ?? 8;
  const memory = (nav as any)?.deviceMemory ?? 8; // GB

  // A device is "low-end" (requiring optimized animations/effects) if:
  //   - It has <= 4GB memory, OR
  //   - User prefers reduced motion, OR
  //   - It's a touch device or mobile (to ensure 60fps scrolling without heavy GPU blurs).
  const isLowEnd =
    prefersReducedMotion ||
    memory <= 4 ||
    isTouchDevice ||
    isMobile;

  _cachedResult = { isLowEnd, prefersReducedMotion, isTouchDevice, isMobile };
  return _cachedResult;
}

/**
 * React hook that returns device performance characteristics.
 * Results are cached — detection only runs once.
 * Also listens for screen resize to update `isMobile`.
 */
export function useDevicePerformance(): DevicePerformance {
  const initial = useMemo(() => detect(), []);
  const [isMobile, setIsMobile] = useState(initial.isMobile);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      // Invalidate cache so isLowEnd recalculates
      if (_cachedResult) {
        _cachedResult = { ..._cachedResult, isMobile: e.matches };
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return useMemo(
    () => {
      const isLowEnd =
        initial.prefersReducedMotion ||
        isMobile ||
        initial.isTouchDevice ||
        (typeof navigator !== 'undefined' && ((navigator as any)?.deviceMemory ?? 8) <= 4);
      return { ...initial, isMobile, isLowEnd };
    },
    [initial, isMobile]
  );
}

/**
 * Non-hook version for use outside React components (e.g., utility functions).
 * Returns cached result or detects on first call.
 */
export function getDevicePerformance(): DevicePerformance {
  return detect();
}
