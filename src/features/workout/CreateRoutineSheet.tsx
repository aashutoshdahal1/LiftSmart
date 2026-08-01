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
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronsUpDown, Dumbbell, GripVertical, ImageOff, Plus, Trash2 } from "lucide-react";
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

// ── Sortable row (drag handle always visible; up/down buttons shown in reorder mode) ──
function SortableExerciseRow({
  ex,
  index,
  total,
  reorderMode,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
}: {
  ex: RoutineExercise;
  index: number;
  total: number;
  reorderMode: boolean;
  onRemove: () => void;
  onUpdate: (field: "sets" | "reps", val: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ex.id });

  const [imgError, setImgError] = useState(false);

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
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isDragging ? 0.8 : 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.18 }}
        className={`overflow-hidden rounded-2xl bg-elevated transition-shadow ${isDragging ? "shadow-2xl ring-2 ring-primary/40" : ""}`}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">

            {/* Drag handle (always present; in reorder mode it gets a highlight) */}
            <button
              {...attributes}
              {...listeners}
              className={`shrink-0 touch-none cursor-grab active:cursor-grabbing transition-colors p-1 -ml-1 rounded-lg ${
                reorderMode
                  ? "text-primary hover:text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Drag to reorder"
              tabIndex={-1}
            >
              <GripVertical className="size-4" />
            </button>

            {/* Up / Down arrows — only in reorder mode */}
            <AnimatePresence initial={false}>
              {reorderMode && (
                <motion.div
                  key="arrows"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex shrink-0 flex-col gap-0.5 overflow-hidden"
                >
                  <button
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className="grid size-6 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <button
                    onClick={onMoveDown}
                    disabled={index === total - 1}
                    className="grid size-6 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thumbnail */}
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted">
              {ex.imageUrl && !imgError ? (
                <img
                  src={ex.imageUrl}
                  alt={ex.name}
                  className="size-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="grid size-full place-items-center text-muted-foreground">
                  {imgError ? <ImageOff className="size-4" /> : <Dumbbell className="size-4" />}
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

            {!reorderMode && (
              <button
                onClick={onRemove}
                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remove exercise"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          {/* Sets / Reps — hidden in reorder mode so the list is compact */}
          <AnimatePresence initial={false}>
            {!reorderMode && (
              <motion.div
                key="inputs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Sheet ─────────────────────────────────────────────────────────────────────
export function CreateRoutineSheet({ open, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const remove = (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id));
  const update = (id: string, field: "sets" | "reps", val: number) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

  const moveUp = (idx: number) =>
    setExercises((prev) => (idx === 0 ? prev : arrayMove(prev, idx, idx - 1)));
  const moveDown = (idx: number) =>
    setExercises((prev) => (idx === prev.length - 1 ? prev : arrayMove(prev, idx, idx + 1)));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((prev) => {
        const oldIdx = prev.findIndex((e) => e.id === active.id);
        const newIdx = prev.findIndex((e) => e.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handlePickerSelect = (picked: DbExercise[]) => {
    const next = picked.map(fromDb);
    setExercises((prev) => {
      const existingDbIds = new Set(prev.map((e) => e.dbId).filter(Boolean));
      return [...prev, ...next.filter((n) => !existingDbIds.has(n.dbId))];
    });
  };

  const canSave = title.trim().length > 0 && exercises.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ id: Date.now().toString(), title: title.trim(), exercises });
    setTitle("");
    setExercises([]);
    setReorderMode(false);
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setExercises([]);
    setReorderMode(false);
    onClose();
  };

  return (
    <>
      <Sheet open={open && !pickerOpen} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent
          side="bottom"
          className="max-h-[92vh] overflow-y-auto rounded-t-3xl bg-card px-6 pb-[max(7rem,calc(env(safe-area-inset-bottom)+7rem))] pt-5"
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

                {exercises.length > 1 && (
                  <Button
                    size="sm"
                    variant={reorderMode ? "default" : "outline"}
                    className="h-8 gap-1.5 rounded-xl px-3 text-xs"
                    onClick={() => setReorderMode((v) => !v)}
                  >
                    {reorderMode ? (
                      <><Check className="size-3" /> Done</>
                    ) : (
                      <><ChevronsUpDown className="size-3" /> Reorder</>
                    )}
                  </Button>
                )}
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {exercises.map((ex, i) => (
                        <SortableExerciseRow
                          key={ex.id}
                          ex={ex}
                          index={i}
                          total={exercises.length}
                          reorderMode={reorderMode}
                          onRemove={() => remove(ex.id)}
                          onUpdate={(field, val) => update(ex.id, field, val)}
                          onMoveUp={() => moveUp(i)}
                          onMoveDown={() => moveDown(i)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </DndContext>

              {!reorderMode && (
                <Button
                  variant="outline"
                  className="h-12 w-full gap-2 rounded-2xl border-dashed"
                  onClick={() => setPickerOpen(true)}
                >
                  <Plus className="size-4" />
                  {exercises.length === 0 ? "Add exercises" : "Add more exercises"}
                </Button>
              )}
            </div>

            {!reorderMode && (
              <Button
                size="lg"
                className="h-14 w-full rounded-3xl text-base"
                disabled={!canSave}
                onClick={handleSave}
              >
                Save routine
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
      />
    </>
  );
}
