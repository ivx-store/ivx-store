import { useEffect, useRef, useState, useCallback } from 'react';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // Default true to prevent flash

  useEffect(() => {
    // Check for touch device inside useEffect (not during render)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use direct DOM manipulation instead of React state for mouse position
    // This avoids re-renders on every mouse move
    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hovering = !!(
        target.closest('a') || 
        target.closest('button') || 
        target.closest('input') || 
        target.closest('textarea') ||
        target.closest('.hover-trigger')
      );
      setIsHovering(hovering);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isTouchDevice, isVisible]);

  // Don't render anything on touch devices
  if (isTouchDevice) return null;

  // Unified Sharp Arrow Path
  const arrowPath = "M 2 2 L 26 10 L 20 12 L 14 14 L 12 20 L 10 26 Z";

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[99999] pointer-events-none will-change-transform"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
    >
      <svg 
        width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" 
        className="absolute drop-shadow-xl"
        style={{ 
          left: -2, 
          top: -2,
          transform: isHovering ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s ease-out',
          transformOrigin: '3px 3px',
        }}
      >
        <defs>
          <linearGradient id="ivxGradientArrow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#888888" />
          </linearGradient>
        </defs>
        <path
          d={arrowPath}
          fill="url(#ivxGradientArrow)"
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
