import { AnimatePresence, motion } from "framer-motion";
import { Timer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  startedAt: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function WorkoutTimer({ startedAt }: Props) {
  const [elapsed, setElapsed] = useState(0);
  // offset shifts the displayed time (in seconds) without touching startedAt
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);

  // Draft values while editing
  const [draftH, setDraftH] = useState("0");
  const [draftM, setDraftM] = useState("00");
  const [draftS, setDraftS] = useState("00");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayed = elapsed + offset;
  const hh = Math.floor(displayed / 3600);
  const mm = Math.floor((displayed % 3600) / 60);
  const ss = displayed % 60;
  const label = hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;

  function openEditor() {
    setDraftH(String(hh));
    setDraftM(pad(mm));
    setDraftS(pad(ss));
    setOpen(true);
  }

  function applyEdit() {
    const target = Number(draftH) * 3600 + Number(draftM) * 60 + Number(draftS);
    setOffset(target - elapsed);
    setOpen(false);
  }

  function adjust(field: "h" | "m" | "s", delta: number) {
    if (field === "h") setDraftH((v) => String(Math.max(0, Number(v) + delta)));
    if (field === "m") setDraftM((v) => pad(Math.max(0, Math.min(59, Number(v) + delta))));
    if (field === "s") setDraftS((v) => pad(Math.max(0, Math.min(59, Number(v) + delta))));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openEditor}
        className="flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1.5 text-sm font-semibold tabular-nums text-primary transition-colors hover:bg-primary/20 active:scale-95"
        aria-label="Edit timer"
      >
        <Timer className="size-4" />
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <p className="text-sm font-semibold">Edit Timer</p>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            {/* H : M : S steppers */}
            <div className="flex items-center justify-center gap-1 px-4 py-5">
              {/* Hours */}
              <Stepper
                label="HH"
                value={draftH}
                onChange={setDraftH}
                onUp={() => adjust("h", 1)}
                onDown={() => adjust("h", -1)}
              />
              <span className="mb-4 text-2xl font-bold text-muted-foreground">:</span>
              {/* Minutes */}
              <Stepper
                label="MM"
                value={draftM}
                onChange={setDraftM}
                onUp={() => adjust("m", 1)}
                onDown={() => adjust("m", -1)}
              />
              <span className="mb-4 text-2xl font-bold text-muted-foreground">:</span>
              {/* Seconds */}
              <Stepper
                label="SS"
                value={draftS}
                onChange={setDraftS}
                onUp={() => adjust("s", 1)}
                onDown={() => adjust("s", -1)}
              />
            </div>

            <div className="flex gap-2 px-4 pb-4">
              <Button variant="outline" size="sm" className="flex-1 rounded-2xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1 rounded-2xl" onClick={applyEdit}>
                Set
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  onUp,
  onDown,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onUp}
        className="grid size-7 place-items-center rounded-xl bg-elevated text-sm font-bold text-foreground hover:bg-primary/15 hover:text-primary active:scale-90 transition-all"
      >
        ▲
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-14 rounded-xl bg-elevated text-center text-2xl font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <button
        onClick={onDown}
        className="grid size-7 place-items-center rounded-xl bg-elevated text-sm font-bold text-foreground hover:bg-primary/15 hover:text-primary active:scale-90 transition-all"
      >
        ▼
      </button>
    </div>
  );
}
