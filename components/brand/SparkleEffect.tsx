"use client";
import { useReducedMotion } from "framer-motion";

/**
 * Realistic light-reflection glints for gemstones (spec §34).
 * Sparse (3), small, slow, deterministic per seed — never cartoon glitter.
 * Fully removed under prefers-reduced-motion.
 */
export function SparkleEffect({ seed = 1 }: { seed?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const positions = [
    { top: "18%", left: "26%", delay: 0.4 },
    { top: "38%", left: "68%", delay: 1.6 },
    { top: "64%", left: "40%", delay: 2.7 },
  ];
  const shift = (seed * 7) % 3;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {positions.map((p, i) => {
        const pos = positions[(i + shift) % positions.length]!;
        return (
          <span
            key={i}
            className="glint"
            style={{ top: p.top, left: p.left, animationDelay: `${pos.delay + seed * 0.13}s`, width: 10 + ((seed + i) % 3) * 3, height: 10 + ((seed + i) % 3) * 3 }}
          />
        );
      })}
    </span>
  );
}
