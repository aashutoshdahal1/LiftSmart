import { motion } from "framer-motion";
import { ArrowUp, Bot, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatMessages, coachPrompts } from "@/lib/mock-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const CANNED_REPLY =
  "Got it. Based on your last 7 days — 4 sessions, 2,890 kcal average and a 0.2 kg weekly gain — I'd hold calories steady and push upper-body loads by 2.5%. I've updated tomorrow's session accordingly.";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text: trimmed }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: CANNED_REPLY }]);
      setThinking(false);
    }, 1400);
  };

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
            {m.role === "assistant" ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                <Bot className="size-4" />
              </span>
            ) : null}
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

        {thinking ? (
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
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border bg-card/70 p-4">
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {coachPrompts.map((p) => (
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
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything…"
            aria-label="Message your AI coach"
            className="h-12 rounded-2xl bg-elevated"
          />
          <Button type="submit" size="icon" className="size-12 shrink-0 rounded-2xl" aria-label="Send">
            <ArrowUp className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
