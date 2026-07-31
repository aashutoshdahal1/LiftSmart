import { motion } from "framer-motion";
import { ProgressRing } from "@/components/common/ProgressRing";
import { scores } from "@/lib/mock-data";

export function ScoreGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {scores.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.5 }}
          className="surface-card flex flex-col items-center gap-3 rounded-3xl p-4"
        >
          <ProgressRing
            value={s.value}
            size={96}
            thickness={8}
            tone={s.tone}
            label={`${s.value}`}
          />
          <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
