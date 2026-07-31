import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Play, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreateRoutineSheet, type Routine } from "@/features/workout/CreateRoutineSheet";
import { ExerciseCard } from "@/features/workout/ExerciseCard";
import { ExercisePicker } from "@/features/workout/ExercisePicker";
import { RestTimer } from "@/features/workout/RestTimer";
import { RoutineAiPanel } from "@/features/workout/RoutineAiPanel";
import { WorkoutCompleteDialog } from "@/features/workout/WorkoutCompleteDialog";
import { WorkoutTimer } from "@/features/workout/WorkoutTimer";
import { routineToExercises } from "@/lib/routineToExercises";
import { useAppDispatch, useAppSelector } from "@/store";
import { awardXp } from "@/store/gamificationSlice";
import { addExercises, completeWorkout, resetWorkout, setNotes, startRoutine } from "@/store/workoutSlice";

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

// ── Routine list card ─────────────────────────────────────────────────────────
function RoutineCard({ routine, onStart }: { routine: Routine; onStart: () => void }) {
  const totalSets = routine.exercises.reduce((a, e) => a + e.sets, 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card rounded-3xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold">{routine.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {routine.exercises.length} exercise{routine.exercises.length !== 1 ? "s" : ""} · {totalSets} sets
            </p>
          </div>
        </div>
        <Button size="sm" className="shrink-0 gap-1.5 rounded-2xl" onClick={onStart}>
          <Play className="size-3.5 fill-current" />
          Start
        </Button>
      </div>
      {routine.exercises.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {routine.exercises.slice(0, 4).map((ex) => (
            <span key={ex.id} className="rounded-full bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
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

  const [restKey, setRestKey] = useState(0);
  const [done, setDone] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

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
    toast(`Starting "${routine.title}"`, { description: `${routine.exercises.length} exercises loaded` });
  };

  const handleFinish = () => {
    dispatch(completeWorkout());
    dispatch(awardXp(180));
    setDone(true);
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
                  setRestKey((k) => k + 1);
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

          <aside className="space-y-4 lg:order-first">
            <RestTimer autoStartKey={restKey} />
          </aside>
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
                <RoutineCard key={r.id} routine={r} onStart={() => handleStart(r)} />
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
