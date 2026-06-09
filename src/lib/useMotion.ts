"use client";
import { useState, useEffect } from "react";

/**
 * Returns a progress value 0→1 over `duration` ms with ease-out-quart.
 * Used to drive all probability visualization animations.
 */
export function useMotion(duration = 700): number {
  const [p, setP] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      setP(1 - Math.pow(1 - t, 4)); // ease-out quart
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return p;
}
