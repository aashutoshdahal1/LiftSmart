import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Play, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreateRoutineSheet, type Routine } from "@/features/workout/CreateRoutineSheet";
import { ExerciseCard } from "@/features/workout/ExerciseCard";
import { RestTimer } from "@/features/workout/RestTimer";
import { RoutineAiPanel } from "@/features/workout/RoutineAiPanel";
import { WorkoutCompleteDialog } from "@/features/workout/WorkoutCompleteDialog";
import { routineToExercises } from "@/lib/routineToExercises";
import { useAppDispatch, useAppSelector } from "@/store";
import { awardXp } from "@/store/gamificationSlice";
import { completeWorkout, resetWorkout, setNotes, startRoutine } from "@/store/workoutSlice";

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

// ── Routine list card ──────────────────────────────────────────────────────────
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
        <Button
          size="sm"
          className="shrink-0 gap-1.5 rounded-2xl"
          onClick={onStart}
        >
          <Play className="size-3.5 fill-current" />
          Start
        </Button>
      </div>

      {routine.exercises.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {routine.exercises.slice(0, 4).map((ex) => (
            <span
              key={ex.id}
              className="rounded-full bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground"
            >
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
  const [latestRoutine, setLatestRoutine] = useState<Routine | null>(null);

  const isActive = activeRoutineTitle !== null;

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const volume = exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((x, s) => x + (s.weight ?? 0) * (s.reps ?? 0), 0),
    0,
  );

  const handleSaveRoutine = (routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
    setLatestRoutine(routine);
    toast.success(`"${routine.title}" saved!`, {
      description: `${routine.exercises.length} exercises · tap ✨ for AI feedback`,
    });
  };

  const handleStart = (routine: Routine) => {
    const mapped = routineToExercises(routine.exercises);
    dispatch(startRoutine({ title: routine.title, exercises: mapped }));
    toast(`Starting "${routine.title}"`, { description: `${routine.exercises.length} exercises loaded` });
  };

  const handleFinish = () => {
    dispatch(completeWorkout());
    dispatch(awardXp(180));
    setDone(true);
  };

  const handleClose = () => {
    setDone(false);
    dispatch(resetWorkout());
  };

  // ── Active workout view ────────────────────────────────────────────────────
  if (isActive) {
    return (
      <AppShell
        title={activeRoutineTitle!}
        subtitle={`${doneSets} of ${totalSets} sets complete`}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {/* Back to routines */}
            <button
              onClick={() => dispatch(resetWorkout())}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to routines
            </button>

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

        <WorkoutCompleteDialog
          open={done}
          onClose={handleClose}
          stats={{ volume: volume || 9840, sets: doneSets, minutes: 62, xp: 180 }}
        />
      </AppShell>
    );
  }

  // ── Routines list view ─────────────────────────────────────────────────────
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

      {/* Create sheet */}
      <CreateRoutineSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleSaveRoutine}
      />

      {/* AI pill — shown after a routine is created */}
      <AnimatePresence>
        {latestRoutine && (
          <RoutineAiPanel
            key={latestRoutine.id}
            routine={latestRoutine}
            onDismiss={() => setLatestRoutine(null)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
