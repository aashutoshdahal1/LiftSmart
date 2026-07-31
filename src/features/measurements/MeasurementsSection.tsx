import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, LineChart, Plus, RotateCcw, Scale, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { addRecord, logMeasurement, removeRecord } from "@/store/measurementSlice";
import { logWeight } from "@/store/weightSlice";

function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// colour palette — one gradient per card index, cycling
const CHART_COLORS = [
  { stroke: "#6366f1", gradFrom: "#6366f1", gradTo: "#a78bfa" }, // indigo → violet
  { stroke: "#f59e0b", gradFrom: "#f59e0b", gradTo: "#fbbf24" }, // amber
  { stroke: "#10b981", gradFrom: "#10b981", gradTo: "#34d399" }, // emerald
  { stroke: "#ef4444", gradFrom: "#ef4444", gradTo: "#f87171" }, // red
  { stroke: "#3b82f6", gradFrom: "#3b82f6", gradTo: "#60a5fa" }, // blue
  { stroke: "#ec4899", gradFrom: "#ec4899", gradTo: "#f472b6" }, // pink
];

function getColor(idx: number) {
  return CHART_COLORS[idx % CHART_COLORS.length]!;
}

type Range = "W" | "M";

function filterByRange(entries: { date: string; value: number }[], range: Range) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - (range === "W" ? 7 : 30));
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return entries.filter((e) => e.date >= cutoffStr);
}

// ── Mini area chart shown on card back ────────────────────────────────────────
function MiniChart({
  entries,
  unit,
  colorIdx,
  range,
}: {
  entries: { date: string; value: number }[];
  unit: string;
  colorIdx: number;
  range: Range;
}) {
  const c = getColor(colorIdx);
  const filtered = filterByRange(entries, range);

  if (filtered.length < 2) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
        <LineChart className="size-4 opacity-40" />
        No data for this period
      </div>
    );
  }

  const gradId = `grad-${colorIdx}-${range}`;
  const data = filtered.map((e) => ({ label: formatShortDate(e.date), value: e.value }));
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.3 || 2;

  return (
    // extra padding wrapper so dots never touch the container edge
    <div className="h-full w-full px-1 pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 16, left: -16 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.gradFrom} stopOpacity={0.4} />
              <stop offset="100%" stopColor={c.gradTo} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.25)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: `1px solid ${c.stroke}55`,
              borderRadius: "0.75rem",
              fontSize: 11,
              padding: "6px 10px",
              boxShadow: `0 4px 20px ${c.stroke}25`,
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: 600, marginBottom: 2 }}
            formatter={(v: number) => [
              <span key="v" style={{ color: c.stroke, fontWeight: 700 }}>{v} {unit}</span>,
              "",
            ]}
            cursor={{ stroke: c.stroke, strokeWidth: 1, strokeDasharray: "4 3", opacity: 0.6 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={c.stroke}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={{ r: 3, fill: c.stroke, stroke: "hsl(var(--card))", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: c.stroke, stroke: "hsl(var(--card))", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Reusable log + history block ──────────────────────────────────────────────
function LogHistory({
  entries,
  unit,
  onLog,
}: {
  entries: { date: string; value: number }[];
  unit: string;
  onLog: (date: string, value: number) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find((e) => e.date === today);
  const [logOpen, setLogOpen] = useState(false);
  const [draft, setDraft] = useState(String(todayEntry?.value ?? ""));
  const [historyOpen, setHistoryOpen] = useState(false);

  function submit() {
    const val = parseFloat(draft);
    if (isNaN(val)) return;
    onLog(today, val);
    setLogOpen(false);
  }

  return (
    <div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => { setDraft(String(todayEntry?.value ?? "")); setLogOpen((v) => !v); }}
          className="flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="size-3" />
          {todayEntry ? "Update today" : "Log today"}
        </button>
        {todayEntry && (
          <span className="text-xs font-semibold text-primary">{todayEntry.value} {unit}</span>
        )}
      </div>

      <AnimatePresence>
        {logOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center gap-2">
              <Input
                autoFocus
                type="number"
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`e.g. ${entries[entries.length - 1]?.value ?? 0}`}
                className="flex-1 h-8 rounded-xl bg-elevated text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <span className="text-xs text-muted-foreground">{unit}</span>
              <button onClick={submit} className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </button>
              <button onClick={() => setLogOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length > 0 && (
        <button
          onClick={() => setHistoryOpen((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {historyOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          {historyOpen ? "Hide" : "Show"} history ({entries.length})
        </button>
      )}

      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1 border-t border-border/50 pt-2">
              {[...entries].reverse().map((e) => {
                const isToday = e.date === today;
                return (
                  <div key={e.date} className={`flex items-center justify-between rounded-xl px-2 py-1.5 text-xs ${isToday ? "bg-primary/8" : ""}`}>
                    <span className={isToday ? "font-semibold text-primary" : "text-muted-foreground"}>{formatDateLabel(e.date)}</span>
                    <span className={`font-semibold tabular-nums ${isToday ? "text-primary" : ""}`}>{e.value} {unit}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Weight card ───────────────────────────────────────────────────────────────
function WeightCard() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((s) => s.weight.entries);
  const [flipped, setFlipped] = useState(false);
  const [range, setRange] = useState<Range>("W");
  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find((e) => e.date === today);
  const latest = entries[entries.length - 1];
  const current = todayEntry ?? latest;
  const prev = entries[entries.length - (todayEntry ? 2 : 1)];
  const diff = current && prev ? current.kg - prev.kg : null;
  const chartEntries = entries.map((e) => ({ date: e.date, value: e.kg }));

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        style={{ transformStyle: "preserve-3d", display: "grid" }}
      >
        {/* Front */}
        <div className="surface-card rounded-3xl p-5 [grid-area:1/1]" style={{ backfaceVisibility: "hidden" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Scale className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight</p>
                <p className="font-display text-3xl font-bold tabular-nums">
                  {current ? current.kg.toFixed(1) : "—"} <span className="text-lg font-semibold text-muted-foreground">kg</span>
                </p>
                {diff !== null && (
                  <p className={`flex items-center gap-1 text-xs font-medium ${diff <= 0 ? "text-accent" : "text-primary"}`}>
                    {diff <= 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg vs yesterday
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setFlipped(true)}
              className="grid size-8 shrink-0 place-items-center rounded-2xl bg-elevated text-muted-foreground transition-colors hover:bg-primary/12 hover:text-primary"
              title="Analyze trend"
            >
              <LineChart className="size-4" />
            </button>
          </div>
          <LogHistory
            entries={chartEntries}
            unit="kg"
            onLog={(date, value) => dispatch(logWeight({ date, kg: value }))}
          />
        </div>

        {/* Back */}
        <div
          className="surface-card rounded-3xl p-4 [grid-area:1/1]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight</p>
              <p className="font-display text-sm font-bold" style={{ color: getColor(0).stroke }}>Trend</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["W", "M"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`grid h-6 w-7 place-items-center rounded-lg text-[10px] font-bold transition-colors ${range === r ? "text-white" : "bg-elevated text-muted-foreground hover:text-foreground"}`}
                  style={range === r ? { background: getColor(0).stroke } : {}}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={() => setFlipped(false)}
                className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground transition-colors hover:text-foreground ml-1"
              >
                <RotateCcw className="size-3" />
              </button>
            </div>
          </div>
          {flipped && (
            <div className="h-[220px] w-full">
              <MiniChart entries={chartEntries} unit="kg" colorIdx={0} range={range} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Measurement card ──────────────────────────────────────────────────────────
function MeasurementCard({ id, colorIdx }: { id: string; colorIdx: number }) {
  const dispatch = useAppDispatch();
  const record = useAppSelector((s) => s.measurement.records.find((r) => r.id === id));
  const [flipped, setFlipped] = useState(false);
  const [range, setRange] = useState<Range>("W");

  if (!record) return null;

  const c = getColor(colorIdx);
  const latest = record.entries[record.entries.length - 1];
  const prev = record.entries[record.entries.length - 2];
  const diff = latest && prev ? latest.value - prev.value : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        style={{ transformStyle: "preserve-3d", display: "grid" }}
      >
        {/* Front */}
        <div className="surface-card rounded-3xl p-5 [grid-area:1/1]" style={{ backfaceVisibility: "hidden" }}>
          <div className="flex items-start justify-between">
            <p className="text-sm text-muted-foreground">{record.label}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFlipped(true)}
                className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground transition-colors hover:text-primary"
                style={{ "--hover-bg": c.stroke + "22" } as React.CSSProperties}
                title="Analyze trend"
              >
                <LineChart className="size-3.5" />
              </button>
              <button onClick={() => dispatch(removeRecord(id))} className="grid size-7 place-items-center rounded-xl text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          <p className="mt-1 font-display text-2xl font-semibold">
            {latest ? latest.value : "—"} <span className="text-base font-semibold text-muted-foreground">{record.unit}</span>
          </p>
          {diff !== null && (
            <p className={`flex items-center gap-1 text-xs font-medium ${diff <= 0 ? "text-accent" : "text-primary"}`}>
              {diff <= 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
              {diff > 0 ? "+" : ""}{diff.toFixed(1)} {record.unit}
            </p>
          )}

          <LogHistory
            entries={record.entries}
            unit={record.unit}
            onLog={(date, value) => dispatch(logMeasurement({ id, date, value }))}
          />
        </div>

        {/* Back */}
        <div
          className="surface-card rounded-3xl p-4 [grid-area:1/1]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{record.label}</p>
              <p className="font-display text-sm font-bold" style={{ color: c.stroke }}>Trend</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["W", "M"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`grid h-6 w-7 place-items-center rounded-lg text-[10px] font-bold transition-colors ${range === r ? "text-white" : "bg-elevated text-muted-foreground hover:text-foreground"}`}
                  style={range === r ? { background: c.stroke } : {}}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={() => setFlipped(false)}
                className="grid size-7 place-items-center rounded-xl bg-elevated text-muted-foreground transition-colors hover:text-foreground ml-1"
              >
                <RotateCcw className="size-3" />
              </button>
            </div>
          </div>
          {flipped && (
            <div className="h-[220px] w-full">
              <MiniChart entries={record.entries} unit={record.unit} colorIdx={colorIdx} range={range} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function MeasurementsSection() {
  const dispatch = useAppDispatch();
  const records = useAppSelector((s) => s.measurement.records);
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUnit, setNewUnit] = useState("cm");

  function add() {
    if (!newLabel.trim()) return;
    dispatch(addRecord({ label: newLabel.trim(), unit: newUnit.trim() || "cm" }));
    setNewLabel(""); setNewUnit("cm");
    setAddOpen(false);
  }

  return (
    <div className="space-y-4">
      <WeightCard />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-base font-semibold">Measurements</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Since you started · 6 weeks ago</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 rounded-2xl" onClick={() => setAddOpen(true)}>
          <Plus className="size-3.5" /> Add
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {records.map((r, i) => <MeasurementCard key={r.id} id={r.id} colorIdx={i + 1} />)}
        </AnimatePresence>

        <motion.button layout onClick={() => setAddOpen(true)} className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
          <Plus className="size-5" />
          <span className="text-xs font-medium">Add measurement</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card p-6 pb-[max(2rem,env(safe-area-inset-bottom))]"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-semibold">Add measurement</h3>
                <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Label</p>
                  <Input autoFocus value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Chest, Neck, Hip…" className="rounded-2xl bg-elevated focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                <div className="w-32">
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Unit</p>
                  <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="cm" className="rounded-2xl bg-elevated focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                <Button size="lg" className="mt-2 w-full rounded-3xl" onClick={add} disabled={!newLabel.trim()}>
                  Add measurement
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
