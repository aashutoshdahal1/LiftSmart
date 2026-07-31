import { motion } from "framer-motion";
import { Beef, Dumbbell, Flame, Lock, Sunrise, Trophy, TrendingUp } from "lucide-react";
import { achievements } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = {
  flame: Flame,
  beef: Beef,
  dumbbell: Dumbbell,
  sunrise: Sunrise,
  "trending-up": TrendingUp,
  trophy: Trophy,
} as const;

export function AchievementGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {achievements.map((a, i) => {
        const Icon = icons[a.icon as keyof typeof icons] ?? Trophy;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className={cn(
              "surface-card flex flex-col items-center gap-2 rounded-3xl p-5 text-center",
              !a.unlocked && "opacity-55",
            )}
          >
            <span
              className={cn(
                "grid size-12 place-items-center rounded-2xl",
                a.unlocked ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {a.unlocked ? <Icon className="size-5" /> : <Lock className="size-4" />}
            </span>
            <p className="text-sm font-semibold">{a.name}</p>
            <p className="text-xs text-muted-foreground">{a.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
