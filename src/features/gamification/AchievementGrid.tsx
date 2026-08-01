import { motion } from "framer-motion";
import { Beef, Dumbbell, Flame, Lock, Sunrise, Trophy, TrendingUp } from "lucide-react";
import { useAppSelector } from "@/store";
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
  const streak = useAppSelector((s) => s.gamification.streak);
  const workouts = useAppSelector((s) => s.workout.history);
  const profile = useAppSelector((s) => s.profile);

  const totalVolume = workouts.reduce((sum, w) => sum + (w.volume ?? 0), 0);
  const maxBench = workouts.flatMap((w) => w.exercises as { name?: string; sets?: { weight?: number }[] }[])
    .filter((e) => e.name?.toLowerCase().includes("bench"))
    .flatMap((e) => e.sets ?? [])
    .reduce((max, s) => Math.max(max, s.weight ?? 0), 0);

  const achievements = [
    {
      id: "a1", name: "Iron Habit", desc: "20-day streak", icon: "flame",
      unlocked: streak >= 20,
      progress: `${Math.min(streak, 20)}/20 days`,
    },
    {
      id: "a2", name: "First Workout", desc: "Complete your first workout", icon: "dumbbell",
      unlocked: workouts.length >= 1,
      progress: `${Math.min(workouts.length, 1)}/1`,
    },
    {
      id: "a3", name: "Bench Boss", desc: "Bench 1.1× bodyweight", icon: "dumbbell",
      unlocked: maxBench >= profile.weightKg * 1.1,
      progress: maxBench > 0 ? `${maxBench}kg / ${Math.round(profile.weightKg * 1.1)}kg target` : "No bench data yet",
    },
    {
      id: "a4", name: "5-Day Streak", desc: "Log weight 5 days in a row", icon: "sunrise",
      unlocked: streak >= 5,
      progress: `${Math.min(streak, 5)}/5 days`,
    },
    {
      id: "a5", name: "Volume King", desc: "60,000 kg total volume", icon: "trending-up",
      unlocked: totalVolume >= 60000,
      progress: `${Math.round(totalVolume / 1000)}k / 60k kg`,
    },
    {
      id: "a6", name: "Century", desc: "100 workouts logged", icon: "trophy",
      unlocked: workouts.length >= 100,
      progress: `${workouts.length}/100 workouts`,
    },
  ];

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">{unlocked} of {achievements.length} unlocked</p>
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
              <span className={cn(
                "grid size-12 place-items-center rounded-2xl",
                a.unlocked ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}>
                {a.unlocked ? <Icon className="size-5" /> : <Lock className="size-4" />}
              </span>
              <p className="text-sm font-semibold">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
              {!a.unlocked && <p className="text-[10px] text-muted-foreground/70">{a.progress}</p>}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
