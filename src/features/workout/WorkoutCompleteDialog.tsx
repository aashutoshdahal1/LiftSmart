import { motion } from "framer-motion";
import { Check, Flame, TrendingUp, Zap } from "lucide-react";
import { Confetti } from "@/components/common/Confetti";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface WorkoutCompleteDialogProps {
  open: boolean;
  onClose: () => void;
  stats: { volume: number; sets: number; minutes: number; xp: number };
}

export function WorkoutCompleteDialog({ open, onClose, stats }: WorkoutCompleteDialogProps) {
  return (
    <>
      {open ? <Confetti /> : null}
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md rounded-4xl border-border bg-card p-8 text-center">
          <DialogTitle className="sr-only">Workout complete</DialogTitle>
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="mx-auto grid size-20 place-items-center rounded-full gradient-primary text-primary-foreground"
          >
            <Check className="size-9" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 font-display text-2xl font-semibold"
          >
            Workout complete
          </motion.h2>
          <p className="mt-2 text-sm text-muted-foreground">
            That's your 5th session this week — your best block yet.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Volume", value: `${(stats.volume / 1000).toFixed(1)}k kg`, icon: TrendingUp },
              { label: "Sets", value: `${stats.sets}`, icon: Zap },
              { label: "Minutes", value: `${stats.minutes}`, icon: Flame },
            ].map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="rounded-2xl bg-elevated p-3"
              >
                <Icon className="mx-auto size-4 text-primary" />
                <p className="mt-2 font-display text-base font-semibold">{value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-5 text-sm font-semibold text-primary"
          >
            +{stats.xp} XP earned
          </motion.p>

          <Button className="mt-6 w-full" size="lg" onClick={onClose}>
            Nice work
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
