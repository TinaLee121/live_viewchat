import { useRef } from 'react';

export function useLongPress(callback, delay = 500) {
  const timerRef = useRef(null);
  const movedRef = useRef(false);

  const onTouchStart = (e) => {
    movedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) callback(e);
    }, delay);
  };

  const cancel = () => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const onTouchMove = () => {
    movedRef.current = true;
    cancel();
  };

  return { onTouchStart, onTouchEnd: cancel, onTouchMove };
}
