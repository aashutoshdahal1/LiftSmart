import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Clock, Dumbbell, Edit2, Flame, Plus, Trash2, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExercisePicker } from "@/features/workout/ExercisePicker";
import { routineToExercises } from "@/lib/routineToExercises";
import { useAppDispatch, useAppSelector } from "@/store";
import type { CompletedWorkout } from "@/store/workoutSlice";
import { updateHistory } from "@/store/workoutSlice";
import type { Exercise, SetEntry } from "@/lib/mock-data";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatPill({ icon: Icon, value }: { icon: React.ElementType; value: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Icon className="size-3 shrink-0" />
      {value}
    </span>
  );
}

// ── Editable set row ──────────────────────────────────────────────────────────
function EditSetRow({
  set,
  index,
  onChange,
  onDelete,
}: {
  set: SetEntry;
  index: number;
  onChange: (field: "weight" | "reps", val: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr_1fr_32px] items-center gap-2 rounded-xl bg-card px-2 py-1.5">
      <span className="text-[11px] font-semibold text-muted-foreground">{index + 1}</span>
      <Input
        type="number"
        inputMode="decimal"
        defaultValue={set.weight ?? 0}
        onChange={(e) => onChange("weight", Number(e.target.value))}
        className="h-8 rounded-lg bg-elevated text-xs"
        aria-label="weight"
      />
      <Input
        type="number"
        inputMode="numeric"
        defaultValue={set.reps ?? 0}
        onChange={(e) => onChange("reps", Number(e.target.value))}
        className="h-8 rounded-lg bg-elevated text-xs"
        aria-label="reps"
      />
      <button onClick={onDelete} className="grid place-items-center text-muted-foreground hover:text-red-500 transition-colors">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

// ── Detail / edit sheet ───────────────────────────────────────────────────────
function WorkoutDetailSheet({ workout, onClose }: { workout: CompletedWorkout; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CompletedWorkout>(workout);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function save() {
    // Recalculate volume + sets from draft
    const volume = draft.exercises.reduce(
      (a, e) => a + e.sets.reduce((x, s) => x + (s.weight ?? 0) * (s.reps ?? 0), 0), 0
    );
    const totalSets = draft.exercises.reduce((a, e) => a + e.sets.length, 0);
    const saved = { ...draft, volume, totalSets };
    dispatch(updateHistory(saved));
    setDraft(saved);
    setEditing(false);
  }

  function updateSetField(exIdx: number, setIdx: number, field: "weight" | "reps", val: number) {
    setDraft((d) => {
      const exes = d.exercises.map((e, ei) => {
        if (ei !== exIdx) return e;
        return {
          ...e,
          sets: e.sets.map((s, si) => si === setIdx ? { ...s, [field]: val, done: true } : s),
        };
      });
      return { ...d, exercises: exes };
    });
  }

  function deleteSet(exIdx: number, setIdx: number) {
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((e, ei) =>
        ei !== exIdx ? e : { ...e, sets: e.sets.filter((_, si) => si !== setIdx) }
      ),
    }));
  }

  function addSet(exIdx: number) {
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((e, ei) => {
        if (ei !== exIdx) return e;
        const last = e.sets[e.sets.length - 1];
        const newSet: SetEntry = {
          id: `new-${Date.now()}-${Math.random()}`,
          targetReps: last?.targetReps ?? 10,
          targetWeight: last?.targetWeight ?? 0,
          weight: last?.weight ?? 0,
          reps: last?.reps ?? 10,
          done: true,
        };
        return { ...e, sets: [...e.sets, newSet] };
      }),
    }));
  }

  function removeExercise(exIdx: number) {
    setDraft((d) => ({ ...d, exercises: d.exercises.filter((_, i) => i !== exIdx) }));
  }

  function addExercises(picked: Exercise[]) {
    setDraft((d) => ({ ...d, exercises: [...d.exercises, ...picked] }));
    setPickerOpen(false);
  }

  const displayed = editing ? draft : workout;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => { if (!pickerOpen) onClose(); }}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-card pb-[max(6rem,calc(env(safe-area-inset-bottom)+6rem))]"
      >
        {/* Sticky header */}
        <div className="shrink-0 rounded-t-3xl bg-card">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-muted" />
          <div className="flex items-start justify-between px-6 py-4">
            <div className="min-w-0 flex-1 pr-3">
              {editing ? (
                <input
                  className="w-full rounded-xl bg-elevated px-3 py-1.5 font-display text-xl font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              ) : (
                <h3 className="font-display text-xl font-semibold">{displayed.title}</h3>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(displayed.date)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {editing ? (
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    <input
                      type="number"
                      value={draft.durationMin}
                      onChange={(e) => setDraft((d) => ({ ...d, durationMin: Number(e.target.value) }))}
                      className="w-14 rounded-lg bg-elevated px-2 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span>min</span>
                  </label>
                ) : (
                  <>
                    <StatPill icon={Clock} value={`${displayed.durationMin} min`} />
                    <StatPill icon={TrendingUp} value={`${(displayed.volume / 1000).toFixed(1)}k kg`} />
                    <StatPill icon={Flame} value={`${displayed.totalSets} sets`} />
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editing ? (
                <>
                  <Button size="sm" className="gap-1.5 rounded-2xl text-xs" onClick={save}>
                    <Check className="size-3.5" /> Save
                  </Button>
                  <button onClick={() => { setDraft(workout); setEditing(false); }} className="text-muted-foreground hover:text-foreground">
                    <X className="size-5" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary transition-colors">
                    <Edit2 className="size-4" />
                  </button>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="size-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="h-px bg-border/50 mx-6" />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 px-6 py-4">
            {displayed.exercises.map((ex, exIdx) => (
              <div key={ex.id} className="rounded-2xl bg-elevated p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                      <Dumbbell className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold capitalize">{ex.name}</p>
                      <p className="text-[10px] capitalize text-muted-foreground">{ex.muscle} · {ex.equipment}</p>
                    </div>
                  </div>
                  {editing && (
                    <button onClick={() => removeExercise(exIdx)} className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-[20px_1fr_1fr_32px] gap-2 px-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>#</span><span>Weight kg</span><span>Reps</span><span />
                    </div>
                    {draft.exercises[exIdx]?.sets.map((set, setIdx) => (
                      <EditSetRow
                        key={set.id}
                        set={set}
                        index={setIdx}
                        onChange={(f, v) => updateSetField(exIdx, setIdx, f, v)}
                        onDelete={() => deleteSet(exIdx, setIdx)}
                      />
                    ))}
                    <button
                      onClick={() => addSet(exIdx)}
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <Plus className="size-3" /> Add set
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-4 gap-2 px-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Set</span><span>Weight</span><span>Reps</span><span>Vol</span>
                    </div>
                    {ex.sets.filter((s) => s.done).map((set, i) => (
                      <div key={set.id} className="grid grid-cols-4 gap-2 rounded-xl bg-card px-1 py-1.5 text-xs">
                        <span className="font-semibold text-muted-foreground">{i + 1}</span>
                        <span>{set.weight ?? 0} kg</span>
                        <span>{set.reps ?? 0}</span>
                        <span className="text-muted-foreground">{((set.weight ?? 0) * (set.reps ?? 0)).toFixed(0)} kg</span>
                      </div>
                    ))}
                    {ex.sets.filter((s) => s.done).length === 0 && (
                      <p className="text-xs text-muted-foreground px-1">No sets logged</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {editing && (
              <button
                onClick={() => setPickerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="size-4" /> Add exercise
              </button>
            )}

            {displayed.notes ? (
              <div className="rounded-2xl bg-elevated p-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground">{displayed.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Exercise picker */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(picked) => {
          const mapped = routineToExercises(
            picked.map((db) => ({
              id: db.id + Date.now(),
              name: db.name,
              sets: 3,
              reps: 10,
              dbId: db.id,
              imageUrl: `https://raw.githubusercontent.com/aashutoshdahal1/exercises-dataset/main/${db.image}`,
              bodyPart: db.body_part,
              equipment: db.equipment,
              target: db.target,
              muscle_group: db.muscle_group,
              secondary_muscles: db.secondary_muscles,
              instructions: db.instructions,
              instruction_steps: db.instruction_steps,
            }))
          );
          addExercises(mapped);
        }}
      />
    </>
  );
}

// ── Compact workout row card ──────────────────────────────────────────────────
function WorkoutRow({ workout, index, onClick }: { workout: CompletedWorkout; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="w-full rounded-2xl bg-elevated p-4 text-left transition-colors hover:bg-primary/8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{workout.title}</p>
            <p className="text-[11px] text-muted-foreground">{formatDate(workout.date)}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <StatPill icon={TrendingUp} value={`${(workout.volume / 1000).toFixed(1)}k kg`} />
            <StatPill icon={Clock} value={`${workout.durationMin} min`} />
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-2 flex gap-3 sm:hidden">
        <StatPill icon={TrendingUp} value={`${(workout.volume / 1000).toFixed(1)}k kg`} />
        <StatPill icon={Clock} value={`${workout.durationMin} min`} />
        <StatPill icon={Flame} value={`${workout.totalSets} sets`} />
      </div>
    </motion.button>
  );
}

// ── All workouts sheet ────────────────────────────────────────────────────────
function AllWorkoutsSheet({
  history,
  onClose,
  onSelect,
}: {
  history: CompletedWorkout[];
  onClose: () => void;
  onSelect: (w: CompletedWorkout) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-card pb-[max(6rem,calc(env(safe-area-inset-bottom)+6rem))]"
      >
        <div className="shrink-0">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-muted" />
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h3 className="font-display text-xl font-semibold">All workouts</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{history.length} sessions logged</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="h-px bg-border/50 mx-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {history.map((w, i) => (
              <WorkoutRow key={w.id} workout={w} index={i} onClick={() => { onClose(); onSelect(w); }} />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function WorkoutHistory() {
  const history = useAppSelector((s) => s.workout.history);
  const [showAllSheet, setShowAllSheet] = useState(false);
  const [detail, setDetail] = useState<CompletedWorkout | null>(null);

  if (history.length === 0) {
    return (
      <section className="surface-card rounded-3xl p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold">Workout history</h3>
        <p className="mt-2 text-sm text-muted-foreground">No workouts logged yet. Finish a routine to see it here.</p>
      </section>
    );
  }

  return (
    <>
      <section className="surface-card rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">Workout history</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{history.length} workout{history.length !== 1 ? "s" : ""} logged</p>
          </div>
          {history.length > 3 && (
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setShowAllSheet(true)}>
              View all {history.length}
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {history.slice(0, 3).map((w, i) => (
            <WorkoutRow key={w.id} workout={w} index={i} onClick={() => setDetail(w)} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {showAllSheet && (
          <AllWorkoutsSheet history={history} onClose={() => setShowAllSheet(false)} onSelect={(w) => setDetail(w)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detail && (
          <WorkoutDetailSheet workout={detail} onClose={() => setDetail(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
