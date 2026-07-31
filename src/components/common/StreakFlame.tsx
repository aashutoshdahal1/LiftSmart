import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakFlame({ days, className }: { days: number; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-warning/30 bg-warning/12 px-3 py-1.5",
        className,
      )}
    >
      <motion.span
        animate={{ scale: [1, 1.15, 1], rotate: [-2, 3, -2] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-warning"
      >
        <Flame className="size-4" />
      </motion.span>
      <span className="text-sm font-semibold text-warning">{days}</span>
      <span className="text-xs text-warning/80">day streak</span>
    </div>
  );
}
