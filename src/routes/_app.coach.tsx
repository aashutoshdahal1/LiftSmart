import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { AiRecommendationCard } from "@/features/ai/AiRecommendationCard";
import { ChatWindow } from "@/features/coach/ChatWindow";
import { aiInsights } from "@/lib/mock-data";

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
  return (
    <AppShell title="AI Coach" subtitle="Knows every set, meal and weigh-in you've logged">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ChatWindow />
        <aside className="space-y-4">
          <SectionHeader title="This week's insights" subtitle="Auto-generated Sunday night" />
          {aiInsights.map((i) => (
            <AiRecommendationCard key={i.id} title={i.title} body={i.body} tag={i.tag} />
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
