import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Dumbbell, Play, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { routineToExercises } from "@/lib/routineToExercises";
import { useAppDispatch, useAppSelector } from "@/store";
import { awardXp, setGamification } from "@/store/gamificationSlice";
import { addExercises, completeWorkout, resetWorkout, setNotes, startRoutine } from "@/store/workoutSlice";
import { workoutsApi } from "@/lib/api";

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
}: {
  routine: Routine;
  onClose: () => void;
  onStart: () => void;
}) {
  const totalSets = routine.exercises.reduce((a, e) => a + e.sets, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
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
              {routine.exercises.length} exercise{routine.exercises.length !== 1 ? "s" : ""} · {totalSets} total sets
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Exercise list */}
        <div className="space-y-2 px-6 pb-4">
          {routine.exercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl bg-elevated p-3"
            >
              {/* Thumbnail */}
              <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
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

        {/* Start button */}
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
      </motion.div>
    </AnimatePresence>
  );
}

// ── Routine list card ─────────────────────────────────────────────────────────
function RoutineCard({
  routine,
  onStart,
  onView,
}: {
  routine: Routine;
  onStart: () => void;
  onView: () => void;
}) {
  const totalSets = routine.exercises.reduce((a, e) => a + e.sets, 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card rounded-3xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Tapping the left side opens the detail view */}
        <button className="flex items-center gap-3 min-w-0 flex-1 text-left" onClick={onView}>
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold">{routine.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {routine.exercises.length} exercise{routine.exercises.length !== 1 ? "s" : ""} · {totalSets} sets
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>

        <Button size="sm" className="shrink-0 gap-1.5 rounded-2xl" onClick={onStart}>
          <Play className="size-3.5 fill-current" />
          Start
        </Button>
      </div>

      {routine.exercises.length > 0 && (
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
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function WorkoutPage() {
  const dispatch = useAppDispatch();
  const exercises = useAppSelector((s) => s.workout.exercises);
  const activeRoutineTitle = useAppSelector((s) => s.workout.activeRoutineTitle);
  const notes = useAppSelector((s) => s.workout.notes);

  const [done, setDone] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewRoutine, setViewRoutine] = useState<Routine | null>(null);

  // AI Review: keyed to exercise count so it re-shows when exercises are added
  const [aiRoutine, setAiRoutine] = useState<Routine | null>(null);
  const prevExCountRef = useRef(0);

  // Workout timer: timestamp when session started
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // Add exercise picker during active workout
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const isActive = activeRoutineTitle !== null;
  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const volume = exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((x, s) => x + (s.weight ?? 0) * (s.reps ?? 0), 0),
    0,
  );

  const handleSaveRoutine = (routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
    setAiRoutine(routine);
    prevExCountRef.current = routine.exercises.length;
    toast.success(`"${routine.title}" saved!`, {
      description: `${routine.exercises.length} exercises · tap ✨ for AI feedback`,
    });
  };

  const handleStart = (routine: Routine) => {
    const mapped = routineToExercises(routine.exercises);
    dispatch(startRoutine({ title: routine.title, exercises: mapped }));
    setStartedAt(Date.now());
  };

  const handleFinish = async () => {
    dispatch(completeWorkout());
    dispatch(awardXp(180));
    setDone(true);
    // Save to backend — fire and forget, don't block UI
    try {
      const durationMin = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0;
      const volume = exercises.reduce((sum, ex) =>
        sum + ex.sets.filter((s) => s.done).reduce((s2, s) => s2 + (s.weight ?? 0) * (s.reps ?? 0), 0), 0);
      const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
      const result = await workoutsApi.save({
        title: activeRoutineTitle ?? "Workout",
        durationMin,
        exercises: exercises as never[],
        notes,
        volume,
        totalSets,
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
    setStartedAt(null);
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
                onClick={() => dispatch(resetWorkout())}
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

            <Button
              size="lg"
              className="h-14 w-full rounded-3xl text-base"
              onClick={handleFinish}
            >
              Finish workout
            </Button>
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
            subtitle={routines.length === 0 ? "Build and save your workouts" : `${routines.length} saved`}
          />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-2xl"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-3.5" />
            Create
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {routines.length === 0 ? (
            <motion.button
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
            <div className="space-y-3">
              {routines.map((r) => (
                <RoutineCard key={r.id} routine={r} onStart={() => handleStart(r)} onView={() => setViewRoutine(r)} />
              ))}
            </div>
          )}
        </AnimatePresence>
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
