import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AiRecommendationCard } from "@/features/ai/AiRecommendationCard";
import { ChatWindow } from "@/features/coach/ChatWindow";
import { aiApi, type AiSuggestion } from "@/lib/api";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/_app/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — LiftSmart" },
      {
        name: "description",
        content:
          "Chat with your AI coach for workout reviews, nutrition tweaks, recovery and sleep advice based on your logged data.",
      },
      { property: "og:title", content: "AI Coach — LiftSmart" },
      { property: "og:description", content: "A coach that has read every set you've ever logged." },
    ],
  }),
  component: CoachPage,
});

function CoachPage() {
  const token = useAppSelector((s) => s.auth.token);
  const [insights, setInsights] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    aiApi.suggestions("workout")
      .then(({ suggestions }) => setInsights(suggestions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AppShell title="AI Coach" subtitle="Knows every set, meal and weigh-in you've logged">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ChatWindow />
        <aside className="space-y-4">
          <SectionHeader title="This week's insights" subtitle="Live from Groq AI" />
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="surface-card h-24 animate-pulse rounded-3xl" />
              ))}
            </div>
          )}
          {!loading && insights.length === 0 && (
            <p className="text-sm text-muted-foreground">Log workouts and meals to get personalised insights.</p>
          )}
          {insights.map((ins, i) => (
            <AiRecommendationCard key={i} title={ins.title} body={ins.body} tag={ins.tag} />
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
