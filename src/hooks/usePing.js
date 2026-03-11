import { useState, useEffect } from 'react';

export function usePing() {
  const [ping, setPing] = useState(null);

  useEffect(() => {
    const measure = () => {
      const sent = performance.now();
      // Simulate async round-trip via setTimeout(0) + random jitter
      setTimeout(() => {
        const rtt = Math.round(performance.now() - sent + Math.random() * 40);
        setPing(rtt);
      }, 0);
    };

    measure();
    const id = setInterval(measure, 5000);
    return () => clearInterval(id);
  }, []);

  return ping; // null | number (ms)
}
