import { motion } from "framer-motion";
import { Check, History, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Exercise } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { toggleSet, updateSet } from "@/store/workoutSlice";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onSetComplete: () => void;
}

export function ExerciseCard({ exercise, index, onSetComplete }: ExerciseCardProps) {
  const dispatch = useAppDispatch();
  const [showHistory, setShowHistory] = useState(false);
  const doneCount = exercise.sets.filter((s) => s.done).length;
  const allDone = doneCount === exercise.sets.length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className={cn(
        "surface-card overflow-hidden rounded-3xl transition-colors",
        allDone && "border-primary/40",
      )}
    >
      <header className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-base font-semibold">{exercise.name}</h3>
            {allDone ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"
              >
                <Check className="size-3" />
              </motion.span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {exercise.muscle} · {exercise.equipment} · {doneCount}/{exercise.sets.length} sets
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Exercise history"
          onClick={() => setShowHistory((v) => !v)}
        >
          <History className="size-4" />
        </Button>
      </header>

      {showHistory ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mx-5 mb-4 rounded-2xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground"
        >
          Previous session: <span className="text-foreground">{exercise.lastSession}</span>
        </motion.div>
      ) : null}

      <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-2xl bg-accent/10 px-4 py-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-accent">{exercise.aiTip}</p>
      </div>

      <div className="space-y-2 px-5 pb-5">
        <div className="grid grid-cols-[28px_1fr_1fr_64px_40px] items-center gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Set</span>
          <span>Weight</span>
          <span>Reps</span>
          <span>RPE</span>
          <span />
        </div>
        {exercise.sets.map((set, i) => (
          <div
            key={set.id}
            className={cn(
              "grid grid-cols-[28px_1fr_1fr_64px_40px] items-center gap-2 rounded-2xl px-1 py-1",
              set.done && "bg-primary/8",
            )}
          >
            <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>
            <Input
              type="number"
              inputMode="decimal"
              className="h-10 rounded-xl bg-elevated text-sm"
              defaultValue={set.targetWeight}
              onChange={(e) =>
                dispatch(
                  updateSet({
                    exerciseId: exercise.id,
                    setId: set.id,
                    field: "weight",
                    value: Number(e.target.value),
                  }),
                )
              }
              aria-label={`Set ${i + 1} weight`}
            />
            <Input
              type="number"
              inputMode="numeric"
              className="h-10 rounded-xl bg-elevated text-sm"
              defaultValue={set.targetReps}
              onChange={(e) =>
                dispatch(
                  updateSet({
                    exerciseId: exercise.id,
                    setId: set.id,
                    field: "reps",
                    value: Number(e.target.value),
                  }),
                )
              }
              aria-label={`Set ${i + 1} reps`}
            />
            <Input
              type="number"
              inputMode="numeric"
              placeholder="—"
              className="h-10 rounded-xl bg-elevated text-center text-sm"
              onChange={(e) =>
                dispatch(
                  updateSet({
                    exerciseId: exercise.id,
                    setId: set.id,
                    field: "rpe",
                    value: Number(e.target.value),
                  }),
                )
              }
              aria-label={`Set ${i + 1} RPE`}
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              aria-label={set.done ? `Undo set ${i + 1}` : `Complete set ${i + 1}`}
              onClick={() => {
                dispatch(
                  toggleSet({
                    exerciseId: exercise.id,
                    setId: set.id,
                    reps: set.reps ?? set.targetReps,
                    weight: set.weight ?? set.targetWeight,
                  }),
                );
                if (!set.done) onSetComplete();
              }}
              className={cn(
                "grid size-10 place-items-center rounded-xl border transition-colors",
                set.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-elevated text-muted-foreground hover:border-primary/50",
              )}
            >
              <Check className="size-4" />
            </motion.button>
          </div>
        ))}
      </div>

      {exercise.notes ? (
        <Badge variant="secondary" className="mx-5 mb-5">
          {exercise.notes}
        </Badge>
      ) : null}
    </motion.article>
  );
}
