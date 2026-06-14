import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration = 1200, enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled || target === 0) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);

  return count;
}
