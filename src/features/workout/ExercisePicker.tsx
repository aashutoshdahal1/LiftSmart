import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BODY_PART_LABELS,
  BODY_PARTS,
  type DbExercise,
  fetchExercises,
  getGifUrl,
  getImageUrl,
} from "@/lib/exerciseDb";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (exercises: DbExercise[]) => void;
  singleSelect?: boolean;
}

// ── Skeleton placeholder ──────────────────────────────────────────────────────
function ExerciseSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-elevated p-3 animate-pulse">
      <div className="size-14 shrink-0 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

// ── Single exercise row ───────────────────────────────────────────────────────
function ExerciseRow({
  ex,
  selected,
  onToggle,
  onDetail,
}: {
  ex: DbExercise;
  selected: boolean;
  onToggle: () => void;
  onDetail: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(ex));

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
        selected ? "bg-primary/12 ring-1 ring-primary/40" : "bg-elevated hover:bg-elevated/80"
      }`}
    >
      {/* Thumbnail */}
      <button
        onClick={onDetail}
        className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted"
        aria-label={`View ${ex.name} details`}
      >
        <img
          src={imgSrc}
          alt={ex.name}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setImgSrc(`https://placehold.co/180x180/1a1d23/6b7280?text=${encodeURIComponent(ex.name.slice(0, 2).toUpperCase())}`)}
        />
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1" onClick={onToggle} role="button" tabIndex={0}>
        <p className="truncate text-sm font-semibold capitalize leading-tight">{ex.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground capitalize">
          {BODY_PART_LABELS[ex.body_part] ?? ex.body_part} · {ex.equipment}
        </p>
        {ex.target && (
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
            {ex.target}
          </span>
        )}
      </div>

      {/* Detail chevron */}
      <button
        onClick={onDetail}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="View details"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Select toggle */}
      <button
        onClick={onToggle}
        aria-label={selected ? "Deselect" : "Select"}
        className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent"
        }`}
      >
        {selected && <Check className="size-3.5" />}
      </button>
    </motion.div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function ExerciseDetail({
  ex,
  onClose,
  onSelect,
  selected,
}: {
  ex: DbExercise;
  onClose: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  const [showGif, setShowGif] = useState(true);
  const steps = ex.instruction_steps?.en ?? [];

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="absolute inset-0 z-10 flex flex-col bg-card overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/50 bg-card/95 px-4 py-3 backdrop-blur-sm">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </button>
        <h2 className="flex-1 truncate font-display text-base font-semibold capitalize">{ex.name}</h2>
        <Button
          size="sm"
          variant={selected ? "outline" : "default"}
          className="rounded-2xl gap-1.5"
          onClick={onSelect}
        >
          {selected ? <><X className="size-3.5" /> Remove</> : <><Check className="size-3.5" /> Add</>}
        </Button>
      </div>

      {/* Image / GIF toggle */}
      <div className="relative bg-muted/30 flex items-center justify-center py-6">
        <img
          src={showGif ? getGifUrl(ex) : getImageUrl(ex)}
          alt={ex.name}
          className="h-48 w-auto rounded-2xl object-contain"
          onError={(e) => {
            if (showGif) { setShowGif(false); }
            else { (e.target as HTMLImageElement).src = `https://placehold.co/300x200/1a1d23/6b7280?text=${encodeURIComponent(ex.name.slice(0,4))}`; }
          }}
        />
        <button
          onClick={() => setShowGif((v) => !v)}
          className="absolute bottom-3 right-3 rounded-xl bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm"
        >
          {showGif ? "Still" : "Animate"}
        </button>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 px-4 py-4">
        {[
          { label: BODY_PART_LABELS[ex.body_part] ?? ex.body_part },
          { label: ex.equipment },
          { label: ex.target },
          { label: ex.muscle_group },
        ].filter((c) => c.label).map((c) => (
          <span
            key={c.label}
            className="rounded-full bg-elevated px-3 py-1 text-xs font-medium capitalize text-muted-foreground"
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Secondary muscles */}
      {ex.secondary_muscles?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Secondary muscles
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ex.secondary_muscles.map((m) => (
              <span key={m} className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] capitalize text-accent">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {steps.length > 0 && (
        <div className="px-4 pb-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            How to perform
          </p>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Attribution */}
      {ex.attribution && (
        <p className="px-4 pb-6 text-[10px] text-muted-foreground/50">{ex.attribution}</p>
      )}
    </motion.div>
  );
}

// ── Main picker ───────────────────────────────────────────────────────────────
export function ExercisePicker({ open, onClose, onSelect, singleSelect = false }: Props) {
  const [exercises, setExercises] = useState<DbExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeBodyPart, setActiveBodyPart] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<DbExercise | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (exercises.length > 0) return;
    setLoading(true);
    setError(null);
    fetchExercises()
      .then((data) => { setExercises(data); setLoading(false); })
      .catch(() => { setError("Failed to load exercises. Check your connection."); setLoading(false); });
  }, [open]);

  useEffect(() => {
    if (open) { setQuery(""); setSelected(new Set()); setActiveBodyPart("all"); setDetail(null); }
  }, [open]);

  const filtered = useMemo(() => {
    let list = exercises;
    if (activeBodyPart !== "all") list = list.filter((e) => e.body_part === activeBodyPart);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.target?.toLowerCase().includes(q) ||
          e.muscle_group?.toLowerCase().includes(q) ||
          e.equipment?.toLowerCase().includes(q),
      );
    }
    return list.slice(0, 80);
  }, [exercises, query, activeBodyPart]);

  const toggle = (id: string) => {
    if (singleSelect) {
      setSelected(new Set([id]));
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const picks = exercises.filter((e) => selected.has(e.id));
    onSelect(picks);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="size-5" />
        </button>
        <h2 className="font-display text-lg font-semibold">Add Exercises</h2>
        {selected.size > 0 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-auto">
            <Button size="sm" className="rounded-2xl gap-1.5" onClick={handleConfirm}>
              <Check className="size-3.5" />
              Add {selected.size}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises, muscles, equipment…"
            className="h-11 rounded-2xl bg-elevated pl-9"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body part filter chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
        {["all", ...BODY_PARTS].map((bp) => (
          <button
            key={bp}
            onClick={() => setActiveBodyPart(bp)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              activeBodyPart === bp
                ? "bg-primary text-primary-foreground"
                : "bg-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            {bp === "all" ? "All" : BODY_PART_LABELS[bp] ?? bp}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && exercises.length > 0 && (
        <p className="px-4 pb-2 text-[11px] text-muted-foreground">
          {filtered.length}{filtered.length === 80 ? "+" : ""} exercise{filtered.length !== 1 ? "s" : ""}
          {activeBodyPart !== "all" ? ` · ${BODY_PART_LABELS[activeBodyPart]}` : ""}
        </p>
      )}

      {/* List */}
      <div className="relative flex-1 overflow-y-auto px-4 pb-6">
        {loading && (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 8 }).map((_, i) => <ExerciseSkeleton key={i} />)}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchExercises()
                  .then((d) => { setExercises(d); setLoading(false); })
                  .catch(() => { setError("Still failing. Try again."); setLoading(false); });
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 pt-16 text-center">
            <p className="text-sm font-medium">No exercises found</p>
            <p className="text-xs text-muted-foreground">Try a different search or filter</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {filtered.map((ex) => (
              <ExerciseRow
                key={ex.id}
                ex={ex}
                selected={selected.has(ex.id)}
                onToggle={() => toggle(ex.id)}
                onDetail={() => setDetail(ex)}
              />
            ))}
          </div>
        )}

        {/* Detail panel — slides over the list */}
        <AnimatePresence>
          {detail && (
            <ExerciseDetail
              ex={detail}
              onClose={() => setDetail(null)}
              selected={selected.has(detail.id)}
              onSelect={() => {
                toggle(detail.id);
                setDetail(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Sticky confirm bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="border-t border-border/50 bg-card px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <Button size="lg" className="h-14 w-full rounded-3xl gap-2 text-base" onClick={handleConfirm}>
              <Check className="size-5" />
              Add {selected.size} exercise{selected.size !== 1 ? "s" : ""}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator (re-fetch) */}
      {loading && exercises.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading 1,300+ exercises…</p>
          </div>
        </div>
      )}
    </div>
  );
}
