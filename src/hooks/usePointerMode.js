import { useState, useEffect } from 'react';

// Detects whether user is using mouse or touch input
// Supports dynamic switching (e.g., iPad with external mouse)
export function usePointerMode() {
  const [mode, setMode] = useState(() => {
    // Initial detection via CSS media query
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ? 'mouse'
      : 'touch';
  });

  useEffect(() => {
    const handlePointer = (e) => {
      if (e.pointerType === 'mouse') {
        setMode('mouse');
      } else if (e.pointerType === 'touch') {
        setMode('touch');
      }
    };

    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('pointerdown', handlePointer);
    return () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerdown', handlePointer);
    };
  }, []);

  return mode;
}
