import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store";
import { aiApi } from "@/lib/api";

type MagicPage = "workout" | "food" | "progress";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

// ── Build a context summary from Redux state based on current page ────────────
function usePageContext(page: "workout" | "food" | "progress") {
  const workout = useAppSelector((s) => s.workout);
  const nutrition = useAppSelector((s) => s.nutrition);
  const weight = useAppSelector((s) => s.weight);
  const measurement = useAppSelector((s) => s.measurement);

  if (page === "workout") {
    const recent = workout.history.slice(0, 3);
    const lines = recent.map(
      (w) => `• ${w.title} — ${w.durationMin} min, ${(w.volume / 1000).toFixed(1)}k kg volume, ${w.totalSets} sets`
    );
    const active = workout.exercises.length
      ? `Active workout: ${workout.activeRoutineTitle ?? "Unnamed"} with ${workout.exercises.length} exercises.`
      : "No workout currently in progress.";
    return `${active}\nRecent history:\n${lines.join("\n")}`;
  }

  if (page === "food") {
    const { calories, protein, carbs, fat } = nutrition.consumed;
    const mealList = nutrition.meals
      .map((m) => `${m.slot}: ${m.items.map((i) => i.name).join(", ") || "empty"}`)
      .join("\n");
    return `Today's nutrition — ${calories} kcal | ${protein}g protein | ${carbs}g carbs | ${fat}g fat.\nWater: ${nutrition.water}/${nutrition.waterTarget} glasses.\nMeals:\n${mealList}`;
  }

  // progress
  const latestWeight = weight.entries[weight.entries.length - 1];
  const prevWeight = weight.entries[weight.entries.length - 2];
  const weightLine = latestWeight
    ? `Current weight: ${latestWeight.kg} kg${prevWeight ? ` (${(latestWeight.kg - prevWeight.kg) >= 0 ? "+" : ""}${(latestWeight.kg - prevWeight.kg).toFixed(1)} kg vs prev)` : ""}.`
    : "No weight logged yet.";
  const measLines = measurement.records
    .map((r) => {
      const last = r.entries[r.entries.length - 1];
      return last ? `${r.label}: ${last.value} ${r.unit}` : null;
    })
    .filter(Boolean)
    .join(", ");
  return `${weightLine}\nMeasurements: ${measLines || "none logged"}.`;
}

// ── Page-specific quick prompts ───────────────────────────────────────────────
const PROMPTS: Record<MagicPage, string[]> = {
  workout: [
    "How was my last session?",
    "What should I focus on today?",
    "Am I overtraining?",
    "Suggest a deload week",
  ],
  food: [
    "Am I hitting my protein?",
    "What should I eat for dinner?",
    "How are my macros today?",
    "Suggest a high-protein snack",
  ],
  progress: [
    "How is my weight trending?",
    "Which measurement improved most?",
    "What should I track next?",
    "Summarise my progress",
  ],
};

// Simulated replies using page context
function buildReply(userText: string, context: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("weight") || lower.includes("trend") || lower.includes("progress"))
    return `Based on your data — ${context.split("\n")[0]} — you're making steady progress. Keep logging daily for the most accurate trend.`;
  if (lower.includes("protein") || lower.includes("macro") || lower.includes("food") || lower.includes("eat"))
    return `Here's what I see: ${context.split("\n")[0]}. I'd suggest adding a protein source to your next meal to hit your daily target.`;
  if (lower.includes("workout") || lower.includes("session") || lower.includes("train"))
    return `Looking at your recent workouts — ${context.split("\n")[0]} I'd recommend progressive overload on your main lifts next session.`;
  return `I've reviewed your current data: ${context.split("\n")[0]}. Everything looks on track — keep the consistency going!`;
}

// ── Sheet component ───────────────────────────────────────────────────────────
export function MagicChatSheet({
  open,
  onClose,
  page,
}: {
  open: boolean;
  onClose: () => void;
  page: "workout" | "food" | "progress";
}) {
  const context = usePageContext(page);
  const prompts = PROMPTS[page];

  const greeting: Message = {
    id: "init",
    role: "assistant",
    text: `Hey! I'm your AI coach. I can see your ${page} data right now — ask me anything about it.`,
  };

  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setMessages([greeting]);
  }, [open, page]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  // lock background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.text,
      }));
      const { reply } = await aiApi.chat(history, page);
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: reply }]);
    } catch {
      // fallback to local reply if backend unavailable
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", text: buildReply(trimmed, context) },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[61] flex h-[82dvh] flex-col rounded-t-3xl bg-card"
          >
            {/* Handle */}
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted" />

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-5 py-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-sm">
                  <Sparkles className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-none">AI Coach</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">{page} context loaded</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-2xl bg-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                      <Bot className="size-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "gradient-accent text-accent-foreground"
                        : "bg-elevated text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </span>
                  <div className="flex gap-1.5 rounded-3xl bg-elevated px-4 py-4">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-2 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-border bg-card/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Sparkles className="size-3 text-primary" />
                    {p}
                  </button>
                ))}
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); send(input); }}
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your data…"
                  className="h-11 rounded-2xl bg-elevated focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || thinking}
                  className="size-11 shrink-0 rounded-2xl"
                >
                  <ArrowUp className="size-4.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
