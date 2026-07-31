import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Flame, TrendingUp, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { Confetti } from "@/components/common/Confetti";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppSelector } from "@/store";

interface WorkoutCompleteDialogProps {
  open: boolean;
  onClose: () => void;
  stats: { volume: number; sets: number; minutes: number; xp: number };
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function WorkoutCalendar({ workoutDays }: { workoutDays: Set<string> }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  function prev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-3xl border border-border/50 bg-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prev} className="grid size-7 place-items-center rounded-xl bg-card text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-3.5" />
        </button>
        <p className="text-sm font-semibold">{MONTH_NAMES[month]} {year}</p>
        <button onClick={next} className="grid size-7 place-items-center rounded-xl bg-card text-muted-foreground hover:text-foreground">
          <ChevronRight className="size-3.5" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((d) => (
          <p key={d} className="text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const key = `${year}-${month}-${day}`;
          const isWorked = workoutDays.has(key);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`flex h-7 w-full items-center justify-center rounded-full text-xs font-medium transition-colors
                ${isWorked ? "gradient-primary text-primary-foreground font-semibold" :
                  isToday ? "border border-primary text-primary" :
                  "text-muted-foreground"}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkoutCompleteDialog({ open, onClose, stats }: WorkoutCompleteDialogProps) {
  const streak = useAppSelector((s) => s.gamification.streak);
  const weekStreak = Math.max(1, Math.round(streak / 7));

  const now = new Date();
  const workoutDays = new Set<string>();
  for (let i = 0; i < streak; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    workoutDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  const [slide, setSlide] = useState(0);
  const dragStartX = useRef(0);

  function onDragStart(e: React.TouchEvent) {
    dragStartX.current = e.touches[0]?.clientX ?? 0;
  }
  function onDragEnd(e: React.TouchEvent) {
    const diff = dragStartX.current - (e.changedTouches[0]?.clientX ?? dragStartX.current);
    if (diff > 40) setSlide(1);
    else if (diff < -40) setSlide(0);
  }

  const SLIDES = [
    {
      key: "calendar",
      content: <WorkoutCalendar workoutDays={workoutDays} />,
    },
    {
      key: "stats",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Volume", value: `${(stats.volume / 1000).toFixed(1)}k kg`, icon: TrendingUp },
              { label: "Sets", value: `${stats.sets}`, icon: Zap },
              { label: "Minutes", value: `${stats.minutes}`, icon: Flame },
            ].map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl bg-elevated p-3"
              >
                <Icon className="mx-auto size-3.5 text-primary" />
                <p className="mt-1.5 font-display text-sm font-semibold">{value}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm font-semibold text-primary">+{stats.xp} XP earned</p>

          {/* This week */}
          <div className="rounded-3xl border border-border/50 bg-elevated p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">This week</p>
            <div className="flex justify-between gap-1">
              {["M","T","W","T","F","S","S"].map((d, i) => {
                const dayDate = new Date(now);
                const todayDow = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
                dayDate.setDate(now.getDate() - todayDow + i);
                const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
                const worked = workoutDays.has(key);
                const isToday = i === todayDow;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <p className="text-[9px] font-medium text-muted-foreground">{d}</p>
                    <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-semibold
                      ${worked ? "gradient-primary text-primary-foreground" :
                        isToday ? "border border-primary text-primary" :
                        "bg-muted text-muted-foreground"}`}>
                      {worked ? "✓" : dayDate.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {open ? <Confetti /> : null}
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="w-[min(360px,calc(100vw-2rem))] sm:w-[min(480px,calc(100vw-2rem))] rounded-4xl border-border bg-card p-5 text-center [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">Workout complete</DialogTitle>

          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="mx-auto grid size-14 place-items-center rounded-full gradient-primary text-primary-foreground"
          >
            <Check className="size-6" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-3 font-display text-xl font-semibold"
          >
            Workout complete
          </motion.h2>
          <p className="mt-0.5 text-base font-bold text-primary">🔥 {weekStreak}-week streak</p>

          <div
            className="relative mt-3 overflow-hidden"
            onTouchStart={onDragStart}
            onTouchEnd={onDragEnd}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={SLIDES[slide]?.key ?? slide}
                initial={{ x: slide === 0 ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slide === 0 ? 30 : -30, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {SLIDES[slide]?.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicator below content */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${slide === i ? "w-5 bg-primary" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>

          {/* Single done button */}
          <Button size="lg" className="mt-4 w-full rounded-3xl" onClick={onClose}>
            Nice work
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
