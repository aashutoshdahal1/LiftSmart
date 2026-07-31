import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, ImageOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { DbExercise } from "@/lib/exerciseDb";
import { getImageUrl, BODY_PART_LABELS } from "@/lib/exerciseDb";
import { ExercisePicker } from "./ExercisePicker";

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  // enriched from DB when picked via the picker
  dbId?: string;
  imageUrl?: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  muscle_group?: string;
  secondary_muscles?: string[];
  instructions?: Record<string, string>;
  instruction_steps?: Record<string, string[]>;
}

export interface Routine {
  id: string;
  title: string;
  exercises: RoutineExercise[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (routine: Routine) => void;
}

function newExercise(): RoutineExercise {
  return { id: Date.now().toString() + Math.random(), name: "", sets: 3, reps: 10 };
}

function fromDb(db: DbExercise): RoutineExercise {
  return {
    id: Date.now().toString() + Math.random(),
    name: db.name,
    sets: 3,
    reps: 10,
    dbId: db.id,
    imageUrl: getImageUrl(db),
    bodyPart: db.body_part,
    equipment: db.equipment,
    target: db.target,
    muscle_group: db.muscle_group,
    secondary_muscles: db.secondary_muscles,
    instructions: db.instructions,
    instruction_steps: db.instruction_steps,
  };
}

// Single exercise row in the routine list
function ExerciseRow({
  ex,
  index,
  onRemove,
  onUpdate,
  canRemove,
}: {
  ex: RoutineExercise;
  index: number;
  onRemove: () => void;
  onUpdate: (field: "sets" | "reps", val: number) => void;
  canRemove: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="rounded-2xl bg-elevated p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
            {ex.imageUrl && !imgError ? (
              <img
                src={ex.imageUrl}
                alt={ex.name}
                className="size-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="grid size-full place-items-center text-muted-foreground">
                {imgError ? <ImageOff className="size-5" /> : <Dumbbell className="size-5" />}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold capitalize">{ex.name || `Exercise ${index + 1}`}</p>
            {(ex.bodyPart || ex.equipment) && (
              <p className="truncate text-[11px] text-muted-foreground capitalize">
                {[BODY_PART_LABELS[ex.bodyPart ?? ""] ?? ex.bodyPart, ex.equipment]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {canRemove && (
            <button
              onClick={onRemove}
              className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Remove exercise"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        {/* Sets / Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Sets</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={ex.sets}
              onChange={(e) => onUpdate("sets", Number(e.target.value))}
              className="h-10 rounded-xl bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Reps</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              value={ex.reps}
              onChange={(e) => onUpdate("reps", Number(e.target.value))}
              className="h-10 rounded-xl bg-background"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CreateRoutineSheet({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const remove = (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id));
  const update = (id: string, field: "sets" | "reps", val: number) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

  const handlePickerSelect = (picked: DbExercise[]) => {
    const next = picked.map(fromDb);
    setExercises((prev) => {
      // avoid duplicates by dbId
      const existingDbIds = new Set(prev.map((e) => e.dbId).filter(Boolean));
      return [...prev, ...next.filter((n) => !existingDbIds.has(n.dbId))];
    });
  };

  const canSave = title.trim().length > 0 && exercises.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      exercises,
    });
    setTitle("");
    setExercises([]);
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setExercises([]);
    onClose();
  };

  return (
    <>
      <Sheet open={open && !pickerOpen} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-3xl bg-card px-6 pb-8 pt-5"
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />

          <div className="mb-6">
            <SheetTitle className="font-display text-xl font-semibold">New Routine</SheetTitle>
          </div>

          <div className="space-y-6">
            {/* Routine name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Routine name</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Push Day A, Leg Day, Full Body"
                className="h-12 rounded-2xl bg-elevated text-base"
              />
            </div>

            {/* Exercise list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Exercises{exercises.length > 0 && (
                    <span className="ml-1.5 text-muted-foreground">({exercises.length})</span>
                  )}
                </Label>
              </div>

              <AnimatePresence initial={false}>
                {exercises.map((ex, i) => (
                  <ExerciseRow
                    key={ex.id}
                    ex={ex}
                    index={i}
                    canRemove={true}
                    onRemove={() => remove(ex.id)}
                    onUpdate={(field, val) => update(ex.id, field, val)}
                  />
                ))}
              </AnimatePresence>

              {/* Add exercises button — opens full-screen picker */}
              <Button
                variant="outline"
                className="h-12 w-full gap-2 rounded-2xl border-dashed"
                onClick={() => setPickerOpen(true)}
              >
                <Plus className="size-4" />
                {exercises.length === 0 ? "Add exercises" : "Add more exercises"}
              </Button>
            </div>

            <Button
              size="lg"
              className="h-14 w-full rounded-3xl text-base"
              disabled={!canSave}
              onClick={handleSave}
            >
              Save routine
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Full-screen exercise picker */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
      />
    </>
  );
}
