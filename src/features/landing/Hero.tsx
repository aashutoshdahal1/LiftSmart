import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Sparkles, Star } from "lucide-react";
import heroImage from "@/assets/hero-app.jpg";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/components/common/PageTransition";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 gradient-hero" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            Adaptive coaching engine · v3
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl"
          >
            An elite coach that <span className="text-gradient">rewrites your plan</span> every
            single day.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            LiftSmart reads every set, meal and weigh-in, then adjusts your loads, calories and recovery
            overnight. No spreadsheets. No guessing. Just the next right session.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-2xl px-6 text-base">
              <Link to="/onboarding">
                Build my plan
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-2xl px-6 text-base">
              <Link to="/dashboard">See the app</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="flex text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </span>
              4.9 · 12,400 reviews
            </span>
            <span className="flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              1.2M workouts adapted
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-4xl bg-primary/10 blur-3xl" aria-hidden />
          <img
            src={heroImage}
            width={1408}
            height={1104}
            alt="LiftSmart AI fitness coach app screens showing progress rings, strength charts and daily training plan"
            className="relative w-full rounded-4xl border border-border shadow-float"
          />
        </motion.div>
      </div>
    </section>
  );
}
