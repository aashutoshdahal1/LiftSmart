import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your plan — LiftSmart AI Fitness Coach" },
      {
        name: "description",
        content:
          "Answer a few questions about your body, goal, experience and equipment, and LiftSmart builds your adaptive plan.",
      },
      { property: "og:title", content: "Build your plan — LiftSmart" },
      { property: "og:description", content: "Two minutes to a fully personalised training and nutrition plan." },
    ],
  }),
  component: Onboarding,
});

type Answers = Record<string, string | number>;

const choiceStep = (key: string, title: string, subtitle: string, options: string[]) => ({
  kind: "choice" as const,
  key,
  title,
  subtitle,
  options,
});

const steps = [
  {
    kind: "metrics" as const,
    key: "metrics",
    title: "The basics",
    subtitle: "We use these to set your starting calories and loads.",
  },
  choiceStep("gender", "Gender", "Used for body composition estimates.", ["Male", "Female", "Other"]),
  choiceStep("goal", "What's the goal?", "This drives everything else.", [
    "Lean bulk",
    "Cut",
    "Bulk",
    "Maintenance",
  ]),
  choiceStep("activity", "Daily activity", "Outside of training.", [
    "Sedentary",
    "Lightly active",
    "Moderately active",
    "Very active",
    "Athlete",
  ]),
  choiceStep("experience", "Training experience", "So we pick the right progression speed.", [
    "Beginner",
    "Intermediate",
    "Advanced",
  ]),
  choiceStep("days", "Days per week", "Be honest — consistency beats ambition.", [
    "2",
    "3",
    "4",
    "5",
    "6",
  ]),
  choiceStep("gym", "Equipment access", "Your plan is built around this.", [
    "Full gym",
    "Home gym",
    "Bodyweight only",
  ]),
  choiceStep("food", "Food preferences", "We'll shape meal suggestions around it.", [
    "No restrictions",
    "Vegetarian",
    "Vegan",
    "High protein",
    "Dairy free",
  ]),
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ age: 28, height: 181, weight: 78.4 });
  const current = steps[step]!;
  const pct = Math.round(((step + 1) / steps.length) * 100);

  const next = () => {
    if (step === steps.length - 1) {
      toast.success("Your plan is ready");
      navigate({ to: "/dashboard" });
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <main className="relative flex min-h-screen flex-col px-4 py-8">
      <div className="pointer-events-none absolute inset-0 gradient-hero" aria-hidden />
      <div className="relative mx-auto w-full max-w-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">
            {step + 1}/{steps.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={current.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <h1 className="font-display text-3xl font-semibold tracking-tight">{current.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{current.subtitle}</p>

            {current.kind === "metrics" ? (
              <div className="mt-8 space-y-4">
                {(
                  [
                    { key: "age", label: "Age", unit: "years" },
                    { key: "height", label: "Height", unit: "cm" },
                    { key: "weight", label: "Weight", unit: "kg" },
                  ] as const
                ).map((f) => (
                  <div key={f.key} className="surface-card rounded-3xl p-4">
                    <Label htmlFor={f.key}>
                      {f.label} <span className="text-muted-foreground">({f.unit})</span>
                    </Label>
                    <Input
                      id={f.key}
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={String(answers[f.key] ?? "")}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [f.key]: Number(e.target.value) }))
                      }
                      className="mt-2 h-12 rounded-2xl bg-elevated font-display text-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 space-y-2.5">
                {current.options.map((opt) => {
                  const selected = answers[current.key] === opt;
                  return (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAnswers((a) => ({ ...a, [current.key]: opt }))}
                      className={cn(
                        "flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {opt}
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {selected ? <Check className="size-3.5" /> : null}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        <Button size="lg" className="mt-10 h-12 w-full rounded-2xl" onClick={next}>
          {step === steps.length - 1 ? "Build my plan" : "Continue"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </main>
  );
}
