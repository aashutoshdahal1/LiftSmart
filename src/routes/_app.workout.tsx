import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, ChevronsUpDown, Dumbbell, GripVertical, Play, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreateRoutineSheet, type Routine } from "@/features/workout/CreateRoutineSheet";
import { ExerciseCard } from "@/features/workout/ExerciseCard";
import { ExercisePicker } from "@/features/workout/ExercisePicker";
import { RoutineAiPanel } from "@/features/workout/RoutineAiPanel";
import { WorkoutCompleteDialog } from "@/features/workout/WorkoutCompleteDialog";
import { WorkoutTimer } from "@/features/workout/WorkoutTimer";
import { routineToExercises, buildLastSessionMap } from "@/lib/routineToExercises";
import { useAppDispatch, useAppSelector } from "@/store";
import { awardXp, setGamification } from "@/store/gamificationSlice";
import { addExercises, completeWorkout, resetWorkout, setNotes, startRoutine } from "@/store/workoutSlice";
import { workoutsApi, routinesApi } from "@/lib/api";

export const Route = createFileRoute("/_app/workout")({
  head: () => ({
    meta: [
      { title: "Today's Workout — LiftSmart" },
      {
        name: "description",
        content:
          "Log sets, reps, weight and RPE with a built-in rest timer, previous-session comparison and AI overload suggestions.",
      },
      { property: "og:title", content: "Today's Workout — LiftSmart" },
      { property: "og:description", content: "Adaptive sets, rest timer and progressive overload cues." },
    ],
  }),
  component: WorkoutPage,
});

// ── Routine detail sheet ──────────────────────────────────────────────────────
function RoutineDetailSheet({
  routine,
  onClose,
  onStart,
  onReorder,
}: {
  routine: Routine;
  onClose: () => void;
  onStart: () => void;
  onReorder: (exercises: Routine["exercises"]) => void;
}) {
  const totalSets = routine.exercises.reduce((a, e) => a + e.sets, 0);
  const [reorderMode, setReorderMode] = useState(false);
  const [localExercises, setLocalExercises] = useState(routine.exercises);

  // Sync if routine changes externally
  const prevId = useRef(routine.id);
  if (prevId.current !== routine.id) {
    prevId.current = routine.id;
    setLocalExercises(routine.exercises);
    setReorderMode(false);
  }

  const move = (from: number, to: number) => {
    const next = [...localExercises];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setLocalExercises(next);
  };

  const handleDoneReorder = () => {
    setReorderMode(false);
    onReorder(localExercises);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={reorderMode ? undefined : onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card pb-[max(6rem,calc(env(safe-area-inset-bottom)+6rem))]"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-muted" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-semibold">{routine.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {localExercises.length} exercise{localExercises.length !== 1 ? "s" : ""} · {totalSets} total sets
            </p>
          </div>
          <div className="flex items-center gap-2">
            {localExercises.length > 1 && (
              <Button
                size="sm"
                variant={reorderMode ? "default" : "outline"}
                className="h-8 gap-1.5 rounded-xl px-3 text-xs"
                onClick={reorderMode ? handleDoneReorder : () => setReorderMode(true)}
              >
                {reorderMode ? (
                  <><Check className="size-3" /> Done</>
                ) : (
                  <><ChevronsUpDown className="size-3" /> Reorder</>
                )}
              </Button>
            )}
            {!reorderMode && (
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>

        {/* Exercise list */}
        <div className="space-y-2 px-6 pb-4">
          {localExercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reorderMode ? 0 : i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl bg-elevated p-3"
            >
              {/* Up / Down arrows in reorder mode */}
              {reorderMode && (
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="grid size-6 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={() => move(i, i + 1)}
                    disabled={i === localExercises.length - 1}
                    className="grid size-6 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="size-3" />
                  </button>
                </div>
              )}

              {/* Thumbnail */}
              <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                {ex.imageUrl ? (
                  <img src={ex.imageUrl} alt={ex.name} className="size-full object-cover" loading="lazy"
                    onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                ) : (
                  <span className="grid size-full place-items-center">
                    <Dumbbell className="size-4 text-muted-foreground" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold capitalize">{ex.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">
                  {[ex.bodyPart, ex.equipment].filter(Boolean).join(" · ") || "Exercise"}
                </p>
              </div>

              <span className="shrink-0 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {ex.sets} × {ex.reps}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Start button — hidden while reordering */}
        {!reorderMode && (
          <div className="px-6 pt-2">
            <Button
              size="lg"
              className="h-12 w-full gap-2 rounded-3xl text-sm"
              onClick={() => { onClose(); onStart(); }}
            >
              <Play className="size-4 fill-current" />
              Start Workout
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Routine list card (sortable) ──────────────────────────────────────────────
function RoutineCard({
  routine,
  reorderMode,
  index,
  total,
  onStart,
  onView,
  onMoveUp,
  onMoveDown,
}: {
  routine: Routine;
  reorderMode: boolean;
  index: number;
  total: number;
  onStart: () => void;
  onView: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: routine.id });

  const totalSets = routine.exercises.reduce((a, e) => a + e.sets, 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: isDragging ? 0.8 : 1, y: 0 }}
        className={`surface-card rounded-3xl p-5 transition-shadow ${isDragging ? "shadow-2xl ring-2 ring-primary/30" : ""}`}
      >
        <div className="flex items-start gap-2">

          {/* Reorder controls — left side, only in reorder mode */}
          {reorderMode && (
            <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
              {/* Drag handle */}
              <button
                {...attributes}
                {...listeners}
                className="touch-none cursor-grab active:cursor-grabbing text-primary hover:text-primary/80 transition-colors p-1 rounded-lg"
                aria-label="Drag to reorder"
                tabIndex={-1}
              >
                <GripVertical className="size-4" />
              </button>
              {/* Up / Down */}
              <button
                onClick={onMoveUp}
                disabled={index === 0}
                className="grid size-6 place-items-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Move up"
              >
                <ArrowUp className="size-3" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={index === total - 1}
                className="grid size-6 place-items-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Move down"
              >
                <ArrowDown className="size-3" />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              {/* Tapping the left side opens the detail view — disabled in reorder mode */}
              <button
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                onClick={reorderMode ? undefined : onView}
                style={reorderMode ? { pointerEvents: "none" } : undefined}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                  <Dumbbell className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">{routine.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {routine.exercises.length} exercise{routine.exercises.length !== 1 ? "s" : ""} · {totalSets} sets
                  </p>
                </div>
                {!reorderMode && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
              </button>

              {!reorderMode && (
                <Button size="sm" className="shrink-0 gap-1.5 rounded-2xl" onClick={onStart}>
                  <Play className="size-3.5 fill-current" />
                  Start
                </Button>
              )}
            </div>

            {!reorderMode && routine.exercises.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {routine.exercises.slice(0, 4).map((ex) => (
                  <span key={ex.id} className="rounded-full bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground capitalize">
                    {ex.name}
                  </span>
                ))}
                {routine.exercises.length > 4 && (
                  <span className="rounded-full bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
                    +{routine.exercises.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Discard confirmation dialog ───────────────────────────────────────────────
function DiscardConfirmDialog({ open, onKeep, onDiscard }: { open: boolean; onKeep: () => void; onDiscard: () => void }) {
  if (!open) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onKeep}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-3xl bg-card p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-96 sm:-translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">Discard workout?</h3>
            <p className="mt-1 text-sm text-muted-foreground">All your sets and progress will be lost. This can't be undone.</p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button variant="destructive" className="h-11 w-full rounded-2xl" onClick={onDiscard}>
              Discard workout
            </Button>
            <Button variant="outline" className="h-11 w-full rounded-2xl" onClick={onKeep}>
              Keep going
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function WorkoutPage() {
  const dispatch = useAppDispatch();
  const exercises = useAppSelector((s) => s.workout.exercises);
  const activeRoutineTitle = useAppSelector((s) => s.workout.activeRoutineTitle);
  const notes = useAppSelector((s) => s.workout.notes);
  // Read startedAt from Redux — persisted to localStorage, survives page refresh
  const startedAt = useAppSelector((s) => s.workout.startedAt);
  const workoutHistory = useAppSelector((s) => s.workout.history);
  const lastSessionMap = useMemo(() => buildLastSessionMap(workoutHistory), [workoutHistory]);

  const [done, setDone] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routinesLoading, setRoutinesLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewRoutine, setViewRoutine] = useState<Routine | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [reorderRoutines, setReorderRoutines] = useState(false);

  const routineSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const ROUTINES_ORDER_KEY = "ls_routines_order";

  const applyRoutineOrder = (next: Routine[]) => {
    setRoutines(next);
    // Persist order immediately to localStorage
    try {
      localStorage.setItem(ROUTINES_ORDER_KEY, JSON.stringify(next.map((r) => r.id)));
    } catch { /* ignore */ }
  };

  const handleRoutineDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRoutines((prev) => {
        const oldIdx = prev.findIndex((r) => r.id === active.id);
        const newIdx = prev.findIndex((r) => r.id === over.id);
        const next = arrayMove(prev, oldIdx, newIdx);
        try {
          localStorage.setItem(ROUTINES_ORDER_KEY, JSON.stringify(next.map((r) => r.id)));
        } catch { /* ignore */ }
        return next;
      });
    }
  };

  const handleReorderDone = () => {
    setReorderRoutines(false);
    // Persist to MongoDB
    routinesApi.reorder(routines.map((r) => r.id)).catch(() => {});
  };

  // AI Review: keyed to exercise count so it re-shows when exercises are added
  const [aiRoutine, setAiRoutine] = useState<Routine | null>(null);
  const prevExCountRef = useRef(0);

  // Add exercise picker during active workout
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  // Load routines from backend on mount, honouring saved sort order
  useEffect(() => {
    routinesApi.list().then(({ routines: loaded }) => {
      const mapped: Routine[] = loaded.map((r) => ({
        id: r._id,
        title: r.title,
        exercises: r.exercises.map((e, i) => ({
          id: e.id ?? `re-${i}`,
          name: e.name,
          sets: e.sets ?? 3,
          reps: e.reps ?? 10,
          ...(e.equipment ? { equipment: e.equipment } : {}),
        })),
      }));

      // Apply localStorage order as fast-restore (backend sortOrder is the source of truth
      // but may lag behind on first load if the reorder PUT hasn't settled yet)
      try {
        const savedOrder = JSON.parse(localStorage.getItem("ls_routines_order") ?? "null") as string[] | null;
        if (Array.isArray(savedOrder) && savedOrder.length > 0) {
          const byId = new Map(mapped.map((r) => [r.id, r]));
          const ordered = savedOrder.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
          // Append any routines not in saved order (newly created)
          const seen = new Set(savedOrder);
          mapped.forEach((r) => { if (!seen.has(r.id)) ordered.push(r); });
          setRoutines(ordered);
          return;
        }
      } catch { /* ignore */ }

      setRoutines(mapped);
    }).catch(() => {}).finally(() => setRoutinesLoading(false));
  }, []);

  const isActive = activeRoutineTitle !== null;
  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const volume = exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((x, s) => x + (s.weight ?? 0) * (s.reps ?? 0), 0),
    0,
  );

  const handleSaveRoutine = async (routine: Routine) => {
    try {
      const { routine: saved } = await routinesApi.create(routine.title, routine.exercises);
      const mapped: Routine = {
        id: saved._id,
        title: saved.title,
        exercises: saved.exercises.map((e, i) => ({
          id: e.id ?? `re-${i}`,
          name: e.name,
          sets: e.sets ?? 3,
          reps: e.reps ?? 10,
          ...(e.equipment ? { equipment: e.equipment } : {}),
        })),
      };
      setRoutines((prev) => [mapped, ...prev]);
      setAiRoutine(mapped);
      prevExCountRef.current = mapped.exercises.length;
    } catch {
      // Backend unavailable — keep local
      setRoutines((prev) => [routine, ...prev]);
      setAiRoutine(routine);
      prevExCountRef.current = routine.exercises.length;
    }
    toast.success(`"${routine.title}" saved!`, {
      description: `${routine.exercises.length} exercises · tap ✨ for AI feedback`,
    });
  };

  const handleStart = (routine: Routine) => {
    const mapped = routineToExercises(routine.exercises, lastSessionMap);
    // startedAt is set inside startRoutine action (Redux → localStorage)
    dispatch(startRoutine({ title: routine.title, exercises: mapped }));
  };

  const handleFinish = async () => {
    dispatch(completeWorkout());
    dispatch(awardXp(180));
    setDone(true);
    // Save to backend — fire and forget, don't block UI
    try {
      const durationMin = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0;
      const vol = exercises.reduce((sum, ex) =>
        sum + ex.sets.filter((s) => s.done).reduce((s2, s) => s2 + (s.weight ?? 0) * (s.reps ?? 0), 0), 0);
      const sets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
      const result = await workoutsApi.save({
        title: activeRoutineTitle ?? "Workout",
        durationMin,
        exercises: exercises as never[],
        notes,
        volume: vol,
        totalSets: sets,
      });
      // Sync XP + streak back from server
      if (result.user) {
        dispatch(setGamification({ xp: result.user.xp, xpToNext: result.user.xpToNext, level: result.user.level, streak: result.user.streak }));
      }
    } catch {
      // Backend unavailable — local Redux state still updated
    }
  };

  const handleClose = () => {
    setDone(false);
    dispatch(resetWorkout()); // also clears localStorage via store subscriber
  };

  const handleDiscard = () => {
    setDiscardOpen(false);
    dispatch(resetWorkout());
  };

  // Re-show AI pill whenever exercises are added during routine creation
  const handleAiDismiss = () => setAiRoutine(null);

  // ── Active workout view ───────────────────────────────────────────────────
  if (isActive) {
    return (
      <AppShell
        title={activeRoutineTitle!}
        subtitle={`${doneSets} of ${totalSets} sets complete`}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">

            {/* Header bar: back + timer */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setDiscardOpen(true)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              {startedAt && <WorkoutTimer startedAt={startedAt} />}
            </div>

            {exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                index={i}
                onSetComplete={() => {
                  dispatch(awardXp(15));
                }}
              />
            ))}

            {/* + Add Exercise — Hevy style */}
            <Button
              variant="outline"
              className="h-12 w-full gap-2 rounded-2xl border-dashed"
              onClick={() => setAddPickerOpen(true)}
            >
              <Plus className="size-4" />
              Add Exercise
            </Button>

            <div className="surface-card rounded-3xl p-5">
              <SectionHeader title="Workout notes" subtitle="Your coach reads these tonight" />
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => dispatch(setNotes(e.target.value))}
                placeholder="Left shoulder felt tight on set 3…"
                className="rounded-2xl bg-elevated"
              />
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="h-14 flex-1 rounded-3xl text-base"
                onClick={handleFinish}
              >
                Finish workout
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-3xl border-destructive/40 px-5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDiscardOpen(true)}
              >
                Discard
              </Button>
            </div>
          </div>

        </div>

        {/* Exercise picker for adding mid-workout */}
        <ExercisePicker
          open={addPickerOpen}
          onClose={() => setAddPickerOpen(false)}
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
              })),
              lastSessionMap,
            );
            dispatch(addExercises(mapped));
            toast.success(`${picked.length} exercise${picked.length !== 1 ? "s" : ""} added`);
          }}
        />

        <WorkoutCompleteDialog
          open={done}
          onClose={handleClose}
          stats={{ volume: volume || 9840, sets: doneSets, minutes: startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0, xp: 180 }}
        />

        <AnimatePresence>
          {discardOpen && (
            <DiscardConfirmDialog
              open={discardOpen}
              onKeep={() => setDiscardOpen(false)}
              onDiscard={handleDiscard}
            />
          )}
        </AnimatePresence>
      </AppShell>
    );
  }

  // ── Routines list view ────────────────────────────────────────────────────
  return (
    <AppShell title="Workout" subtitle="Your routines">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="My Routines"
            subtitle={routinesLoading ? "Loading…" : routines.length === 0 ? "Build and save your workouts" : `${routines.length} saved`}
          />
          <div className="flex items-center gap-2">
            {routines.length > 1 && (
              <Button
                size="sm"
                variant={reorderRoutines ? "default" : "outline"}
                className="h-8 gap-1.5 rounded-xl px-3 text-xs"
                onClick={reorderRoutines ? handleReorderDone : () => setReorderRoutines(true)}
              >
                {reorderRoutines ? (
                  <><Check className="size-3" /> Done</>
                ) : (
                  <><ChevronsUpDown className="size-3" /> Reorder</>
                )}
              </Button>
            )}
            {!reorderRoutines && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-2xl"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-3.5" />
                Create
              </Button>
            )}
          </div>
        </div>

        {routines.length === 0 ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCreateOpen(true)}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/60 py-16 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <span className="grid size-14 place-items-center rounded-2xl gradient-primary text-primary-foreground">
              <Dumbbell className="size-6" />
            </span>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">No routines yet</p>
              <p className="mt-1 text-xs">Tap to create your first routine</p>
            </div>
          </motion.button>
        ) : (
          <DndContext
            sensors={routineSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleRoutineDragEnd}
          >
            <SortableContext items={routines.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {routines.map((r, i) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    reorderMode={reorderRoutines}
                    index={i}
                    total={routines.length}
                    onStart={() => handleStart(r)}
                    onView={() => setViewRoutine(r)}
                    onMoveUp={() => applyRoutineOrder(arrayMove(routines, i, i - 1))}
                    onMoveDown={() => applyRoutineOrder(arrayMove(routines, i, i + 1))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <CreateRoutineSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleSaveRoutine}
      />

      {/* Routine detail sheet */}
      {viewRoutine && (
        <RoutineDetailSheet
          routine={viewRoutine}
          onClose={() => setViewRoutine(null)}
          onStart={() => { setViewRoutine(null); handleStart(viewRoutine); }}
          onReorder={(reordered) => {
            setRoutines((prev) =>
              prev.map((r) => r.id === viewRoutine.id ? { ...r, exercises: reordered } : r)
            );
            setViewRoutine((prev) => prev ? { ...prev, exercises: reordered } : prev);
            // Persist new order to backend
            routinesApi.update(viewRoutine.id, { exercises: reordered }).catch(() => {});
          }}
        />
      )}

      {/* AI pill — dismisses on X, re-shows when a new routine is saved */}
      <AnimatePresence>
        {aiRoutine && (
          <RoutineAiPanel
            key={aiRoutine.id}
            routine={aiRoutine}
            onDismiss={handleAiDismiss}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
