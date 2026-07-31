import { createFileRoute } from "@tanstack/react-router";
import { Activity, Percent, Scale, Target } from "lucide-react";
import { useState } from "react";
import { WeightCalendarCard, WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { MetricCard } from "@/components/common/MetricCard";
import { AppShell } from "@/components/layout/AppShell";
import { AiRecommendationCard } from "@/features/ai/AiRecommendationCard";
import { WeightLogForm } from "@/features/weight/WeightLogForm";
import { user } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/weight")({
  head: () => ({
    meta: [
      { title: "Weight Tracker — LiftSmart" },
      {
        name: "description",
        content:
          "Log daily weight and see trend, weekly and monthly averages, BMI, body fat estimate and a goal prediction.",
      },
      { property: "og:title", content: "Weight Tracker — LiftSmart" },
      { property: "og:description", content: "Trend-based weight tracking with goal prediction." },
    ],
  }),
  component: WeightPage,
});

function WeightPage() {
  const [weight, setWeight] = useState(user.weightKg);
  const bmi = weight / Math.pow(user.heightCm / 100, 2);

  return (
    <AppShell title="Weight" subtitle="Trend matters more than any single day">
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Current" value={weight} decimals={1} unit="kg" icon={Scale} tone="primary" delta="-0.4 kg vs last week" deltaTone="down" />
          <MetricCard label="Weekly avg" value={78.5} decimals={1} unit="kg" icon={Activity} tone="accent" />
          <MetricCard label="BMI" value={bmi} decimals={1} icon={Percent} tone="success" delta="Healthy range" deltaTone="flat" />
          <MetricCard label="Body fat est." value={14.2} decimals={1} unit="%" icon={Target} tone="warning" delta="-0.8% in 6 weeks" deltaTone="down" />
        </section>

        <WeightCalendarCard />

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <WeightTrendChart height={300} />
          <div className="space-y-4">
            <WeightLogForm onLogged={setWeight} />
            <AiRecommendationCard
              title="Goal prediction: 81 kg by Sept 28"
              body="At your current +0.18 kg weekly trend with waist holding steady, you'll hit your lean-bulk target in 8 weeks without adding fat."
              tag="Goal Prediction"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
