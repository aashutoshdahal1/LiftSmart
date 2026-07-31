import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles, Star, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Routine } from "./CreateRoutineSheet";

interface Props {
  routine: Routine;
  onDismiss: () => void;
}

function rateRoutine(routine: Routine): { score: number; label: string; color: string } {
  const count = routine.exercises.length;
  const avgSets =
    count > 0 ? routine.exercises.reduce((a, e) => a + e.sets, 0) / count : 0;
  let score = 5;
  if (count >= 3) score += 1;
  if (count >= 5) score += 1;
  if (avgSets >= 3) score += 1;
  if (avgSets >= 4) score += 1;
  score = Math.min(score, 10);
  const label = score >= 9 ? "Elite" : score >= 7 ? "Solid" : score >= 5 ? "Good Start" : "Needs Work";
  const color = score >= 9 ? "text-emerald-400" : score >= 7 ? "text-primary" : score >= 5 ? "text-yellow-400" : "text-orange-400";
  return { score, label, color };
}

function getSuggestions(routine: Routine): string[] {
  const names = routine.exercises.map((e) => e.name.toLowerCase());
  const tips: string[] = [];

  const hasPush = names.some((n) => n.includes("press") || n.includes("push") || n.includes("fly"));
  const hasPull = names.some((n) => n.includes("row") || n.includes("pull") || n.includes("curl"));
  const hasLegs = names.some((n) => n.includes("squat") || n.includes("deadlift") || n.includes("leg") || n.includes("hip"));
  const hasCore = names.some((n) => n.includes("plank") || n.includes("crunch") || n.includes("core"));
  const lowVolumeExercises = routine.exercises.filter((e) => e.sets < 3);

  if (routine.exercises.length < 4)
    tips.push("Add 1–2 more exercises for a complete stimulus. Aim for 4–6 movements per session.");
  if (hasPush && !hasPull)
    tips.push("You have push movements but no pull. Add a row or pull-up to balance shoulder health.");
  if (!hasPush && !hasPull && !hasLegs)
    tips.push("Your routine lacks a clear movement pattern. Structure around push, pull, or legs.");
  if (!hasCore)
    tips.push("Consider adding a core movement (plank, cable crunch) for spinal stability.");
  if (lowVolumeExercises.length > 0)
    tips.push(`${lowVolumeExercises[0].name} has fewer than 3 sets — bump to 3–4 for better hypertrophy.`);
  if (routine.exercises.some((e) => e.reps > 15))
    tips.push("Some sets are over 15 reps — great for endurance, but add a heavier set for strength too.");
  if (tips.length === 0)
    tips.push("Solid structure. Progressive overload is key — add 2.5 kg every 1–2 weeks on your main lifts.");

  return tips.slice(0, 3);
}

export function RoutineAiPanel({ routine, onDismiss }: Props) {
  const [open, setOpen] = useState(false);
  const { score, label, color } = rateRoutine(routine);
  const suggestions = getSuggestions(routine);

  return (
    <>
      {/* Floating magic pill above mobile nav */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom)+12px)] left-1/2 z-40 -translate-x-1/2 lg:hidden"
          >
            <span className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 shadow-lg shadow-primary/40 text-sm font-semibold text-primary-foreground">
              <Sparkles className="size-4" />
              AI Review
              <span className={`ml-1 font-bold ${color.replace("text-", "text-white")}`}>{score}/10</span>
            </span>
            <motion.span
              className="absolute inset-0 rounded-full border border-primary"
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-up panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />

              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">AI Coach</p>
                    <h3 className="font-display text-lg font-semibold">{routine.title}</h3>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <ChevronDown className="size-4" />
                </Button>
              </div>

              {/* Score */}
              <div className="mb-5 flex items-center justify-between rounded-2xl bg-elevated p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Routine rating</p>
                  <p className={`mt-0.5 font-display text-3xl font-bold ${color}`}>{score}<span className="text-lg text-muted-foreground">/10</span></p>
                  <p className={`text-sm font-semibold ${color}`}>{label}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className={`w-2 rounded-sm ${i < score ? "bg-primary" : "bg-muted"}`}
                      style={{ height: `${16 + i * 3}px`, transformOrigin: "bottom" }}
                    />
                  ))}
                </div>
              </div>

              {/* Stars */}
              <div className="mb-5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${i < Math.round(score / 2) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{Math.round(score / 2)} of 5 stars</span>
              </div>

              {/* Suggestions */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  AI Suggestions
                </p>
                {suggestions.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex gap-3 rounded-2xl bg-accent/10 px-4 py-3"
                  >
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                    <p className="text-sm leading-relaxed text-accent">{tip}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-5 w-full gap-2 rounded-2xl"
                onClick={() => { setOpen(false); onDismiss(); }}
              >
                <X className="size-3.5" />
                Dismiss
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
