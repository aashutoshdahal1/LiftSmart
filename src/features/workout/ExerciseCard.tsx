import { AnimatePresence, motion } from "framer-motion";
import { Check, History, Sparkles, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Exercise } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { toggleSet, updateSet } from "@/store/workoutSlice";


const REST_PRESETS = [30, 60, 90, 120, 180];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function RestBar({ triggerKey }: { triggerKey: number }) {
  const [restSecs, setRestSecs] = useState(90);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (triggerKey === 0) return;
    start();
  }, [triggerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  function start() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(restSecs);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null || r <= 1) { clearInterval(intervalRef.current!); intervalRef.current = null; return null; }
        return r - 1;
      });
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRemaining(null);
  }

  const isRunning = remaining !== null;
  const display = remaining ?? restSecs;
  const pct = isRunning ? ((restSecs - remaining!) / restSecs) * 100 : 0;

  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Timer className={cn("size-3.5 shrink-0", isRunning ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-sm font-semibold tabular-nums", isRunning ? "text-primary" : "text-muted-foreground")}>
            {pad2(Math.floor(display / 60))}:{pad2(display % 60)}
          </span>
          {isRunning ? (
            <button onClick={stop} className="text-[11px] text-muted-foreground hover:text-foreground">stop</button>
          ) : (
            <button onClick={start} className="text-[11px] text-primary hover:text-primary/70">start</button>
          )}
        </div>
        <button
          onClick={() => setShowPresets((v) => !v)}
          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Rest {showPresets ? "▲" : "▼"}
        </button>
      </div>

      {isRunning && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full gradient-primary"
            animate={{ width: `${pct}%` }}
            transition={{ ease: "linear", duration: 0.5 }}
          />
        </div>
      )}

      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-1.5">
              {REST_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setRestSecs(s); stop(); setShowPresets(false); }}
                  className={cn(
                    "flex-1 rounded-xl py-1.5 text-xs font-semibold transition-colors",
                    restSecs === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary",
                  )}
                >
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise & { imageUrl?: string };
  index: number;
  onSetComplete: () => void;
}

export function ExerciseCard({ exercise, index, onSetComplete }: ExerciseCardProps) {
  const dispatch = useAppDispatch();
  const [showHistory, setShowHistory] = useState(false);
  const [restTrigger, setRestTrigger] = useState(0);
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
        {exercise.imageUrl && (
          <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="size-full object-cover"
              loading="lazy"
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-base font-semibold capitalize">{exercise.name}</h3>
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
          <p className="mt-1 text-xs text-muted-foreground capitalize">
            {exercise.muscle} · {exercise.equipment} · {doneCount}/{exercise.sets.length} sets
          </p>
          <RestBar triggerKey={restTrigger} />
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
                dispatch(updateSet({ exerciseId: exercise.id, setId: set.id, field: "weight", value: Number(e.target.value) }))
              }
              aria-label={`Set ${i + 1} weight`}
            />
            <Input
              type="number"
              inputMode="numeric"
              className="h-10 rounded-xl bg-elevated text-sm"
              defaultValue={set.targetReps}
              onChange={(e) =>
                dispatch(updateSet({ exerciseId: exercise.id, setId: set.id, field: "reps", value: Number(e.target.value) }))
              }
              aria-label={`Set ${i + 1} reps`}
            />
            <Input
              type="number"
              inputMode="numeric"
              placeholder="—"
              className="h-10 rounded-xl bg-elevated text-center text-sm"
              onChange={(e) =>
                dispatch(updateSet({ exerciseId: exercise.id, setId: set.id, field: "rpe", value: Number(e.target.value) }))
              }
              aria-label={`Set ${i + 1} RPE`}
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              aria-label={set.done ? `Undo set ${i + 1}` : `Complete set ${i + 1}`}
              onClick={() => {
                dispatch(toggleSet({
                  exerciseId: exercise.id,
                  setId: set.id,
                  reps: set.reps ?? set.targetReps,
                  weight: set.weight ?? set.targetWeight,
                }));
                if (!set.done) { onSetComplete(); setRestTrigger((k) => k + 1); }
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
