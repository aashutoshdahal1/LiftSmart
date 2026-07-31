import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiRecommendationCard } from "@/features/ai/AiRecommendationCard";
import { ExerciseCard } from "@/features/workout/ExerciseCard";
import { RestTimer } from "@/features/workout/RestTimer";
import { WorkoutCompleteDialog } from "@/features/workout/WorkoutCompleteDialog";
import { aiInsights, todayWorkout } from "@/lib/mock-data";
import { useAppDispatch, useAppSelector } from "@/store";
import { awardXp } from "@/store/gamificationSlice";
import { completeWorkout, setNotes } from "@/store/workoutSlice";

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

function WorkoutPage() {
  const dispatch = useAppDispatch();
  const exercises = useAppSelector((s) => s.workout.exercises);
  const notes = useAppSelector((s) => s.workout.notes);
  const [restKey, setRestKey] = useState(0);
  const [done, setDone] = useState(false);

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const volume = exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((x, s) => x + (s.weight ?? 0) * (s.reps ?? 0), 0),
    0,
  );

  return (
    <AppShell title={todayWorkout.title} subtitle={`${doneSets} of ${totalSets} sets complete`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
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
            onClick={() => {
              dispatch(completeWorkout());
              dispatch(awardXp(180));
              setDone(true);
              toast.success("New PR on bench press!", { description: "85 kg × 8 · +2.5 kg" });
            }}
          >
            Finish workout
          </Button>
        </div>

        <aside className="space-y-4 lg:order-first">
          <RestTimer autoStartKey={restKey} />
          {aiInsights.slice(0, 2).map((i) => (
            <AiRecommendationCard key={i.id} title={i.title} body={i.body} tag={i.tag} />
          ))}
        </aside>
      </div>

      <WorkoutCompleteDialog
        open={done}
        onClose={() => setDone(false)}
        stats={{ volume: volume || todayWorkout.volumeKg, sets: doneSets, minutes: 62, xp: 180 }}
      />
    </AppShell>
  );
}
