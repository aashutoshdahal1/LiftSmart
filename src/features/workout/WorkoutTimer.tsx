import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface Props {
  startedAt: number; // Date.now() timestamp
}

export function WorkoutTimer({ startedAt }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const hh = Math.floor(elapsed / 3600);
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-primary">
      <Timer className="size-4" />
      {hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`}
    </div>
  );
}
