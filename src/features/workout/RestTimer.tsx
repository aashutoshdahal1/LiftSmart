import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const PRESETS = [60, 90, 120, 180];

export function RestTimer({ autoStartKey }: { autoStartKey: number }) {
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (autoStartKey === 0) return;
    setRemaining(duration);
    setRunning(true);
  }, [autoStartKey, duration]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const pct = duration === 0 ? 0 : remaining / duration;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="glass sticky top-20 z-20 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Timer className="size-5" />
            <AnimatePresence>
              {running ? (
                <motion.span
                  className="absolute inset-0 rounded-2xl border border-primary"
                  animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              ) : null}
            </AnimatePresence>
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rest timer</p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              {mm}:{ss}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            aria-label={running ? "Pause timer" : "Start timer"}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Reset timer"
            onClick={() => {
              setRunning(false);
              setRemaining(duration);
            }}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full gradient-primary"
          animate={{ width: `${pct * 100}%` }}
          transition={{ ease: "linear", duration: 0.4 }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setDuration(p);
              setRemaining(p);
              setRunning(false);
            }}
            className={`flex-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors ${
              duration === p
                ? "bg-primary/15 text-primary"
                : "bg-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}s
          </button>
        ))}
      </div>
    </div>
  );
}
