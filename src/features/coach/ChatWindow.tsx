import { motion } from "framer-motion";
import { ArrowUp, Bot, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store";
import { aiApi } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const PROMPTS = [
  "Review my last week",
  "Adjust my calories",
  "Why is my bench stalling?",
  "Build a deload week",
  "Best post-workout meal?",
];

export function ChatWindow() {
  const token = useAppSelector((s) => s.auth.token);
  const authUser = useAppSelector((s) => s.auth.user);
  const streak = useAppSelector((s) => s.gamification.streak);
  const weightEntries = useAppSelector((s) => s.weight.entries);
  const workoutHistory = useAppSelector((s) => s.workout.history);
  const profile = useAppSelector((s) => s.profile);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Build greeting using real data on mount
  useEffect(() => {
    if (!token) return;

    const firstName = authUser?.name?.split(" ")[0] ?? "there";
    const latestWeight = weightEntries[weightEntries.length - 1];
    const prevWeight = weightEntries[weightEntries.length - 8];
    const weekDelta = latestWeight && prevWeight ? (latestWeight.kg - prevWeight.kg).toFixed(1) : null;
    const lastWorkout = workoutHistory[0];

    // Build a rich greeting prompt so Groq replies with real context
    const greetingPrompt = `Generate a short (2-3 sentence) personalised morning greeting for ${firstName}.
Facts:
- Streak: ${streak} day${streak !== 1 ? "s" : ""}
- Weight trend: ${weekDelta !== null ? `${Number(weekDelta) >= 0 ? "+" : ""}${weekDelta} kg this week` : "no weight data yet"}
- Goal: ${profile.goal}
- Last workout: ${lastWorkout ? `${lastWorkout.title} on ${lastWorkout.date}` : "none logged yet"}
Keep it motivating and specific. End with a question about what they want help with today.`;

    setThinking(true);
    aiApi.chat([{ role: "user", content: greetingPrompt }], "coach")
      .then(({ reply }) => {
        setMessages([{ id: "init", role: "assistant", text: reply }]);
      })
      .catch(() => {
        const fallback = streak > 0
          ? `Hey ${firstName}! You're on a ${streak}-day streak — solid consistency. What do you want to work on today?`
          : `Hey ${firstName}! Ready to train? Ask me anything about your workouts, nutrition, or progress.`;
        setMessages([{ id: "init", role: "assistant", text: fallback }]);
      })
      .finally(() => setThinking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

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
      const { reply } = await aiApi.chat(history, "coach");
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", text: "Sorry, I couldn't reach the AI service. Check your connection and try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="surface-card flex h-[calc(100dvh-13rem)] flex-col overflow-hidden rounded-3xl lg:h-[calc(100dvh-11rem)]">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <span className="grid size-8 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                <Bot className="size-4" />
              </span>
            )}
            <div
              className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
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
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-2xl gradient-primary text-primary-foreground">
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

      <div className="border-t border-border bg-card/70 p-4">
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Sparkles className="size-3 text-accent" />
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
            placeholder="Ask your coach anything…"
            aria-label="Message your AI coach"
            className="h-12 rounded-2xl bg-elevated"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || thinking}
            className="size-12 shrink-0 rounded-2xl"
            aria-label="Send"
          >
            <ArrowUp className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
