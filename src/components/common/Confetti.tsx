import { motion } from "framer-motion";
import { useMemo } from "react";

const TONES = ["var(--primary)", "var(--accent)", "var(--warning)", "var(--primary-glow)"];

/** Lightweight DOM confetti — no canvas, respects reduced motion via framer defaults. */
export function Confetti({ pieces = 42 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 220,
        rotate: Math.random() * 720 - 360,
        size: 6 + Math.random() * 8,
        color: TONES[i % TONES.length],
      })),
    [pieces],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-100 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute top-[-5%] rounded-[2px]"
          style={{ left: `${b.left}%`, width: b.size, height: b.size * 0.5, background: b.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "105vh", x: b.drift, rotate: b.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: 2.2 + Math.random(), delay: b.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
