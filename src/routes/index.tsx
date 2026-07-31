import { createFileRoute } from "@tanstack/react-router";
import { CtaSection, LandingFooter } from "@/features/landing/CtaSection";
import { FaqSection } from "@/features/landing/FaqSection";
import { FeatureGrid } from "@/features/landing/FeatureGrid";
import { Hero } from "@/features/landing/Hero";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { LandingNav } from "@/features/landing/LandingNav";
import { Pricing } from "@/features/landing/Pricing";
import { Testimonials } from "@/features/landing/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LiftSmart — Your AI Fitness & Nutrition Coach" },
      {
        name: "description",
        content:
          "LiftSmart rewrites your training, calories and recovery every day from your real logs. Adaptive programming, plateau detection and streaks that stick.",
      },
      { property: "og:title", content: "LiftSmart — Your AI Fitness & Nutrition Coach" },
      {
        property: "og:description",
        content:
          "Adaptive AI coaching for training, nutrition and recovery. Two minutes to set up, seven days free.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNav />
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
