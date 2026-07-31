import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  CalendarCheck,
  Flame,
  LineChart,
  Salad,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { fadeUp, stagger } from "@/components/common/PageTransition";

const features = [
  {
    icon: Brain,
    title: "Daily adaptive programming",
    body: "Every session is generated from your last one — loads, volume and exercise order all shift with your performance.",
  },
  {
    icon: LineChart,
    title: "Progressive overload engine",
    body: "Rep-by-rep RPE tracking finds the exact moment to add weight, and the exact moment to back off.",
  },
  {
    icon: Salad,
    title: "Nutrition that adapts weekly",
    body: "Calories and macros recalibrate against your real weight trend, not a static formula from month one.",
  },
  {
    icon: Activity,
    title: "Recovery scoring",
    body: "Sleep, soreness and session load combine into a recovery score that reshapes your week before you break.",
  },
  {
    icon: Flame,
    title: "Streaks that actually stick",
    body: "Missions, XP and levels engineered from behavioural science — designed to be opened every morning.",
  },
  {
    icon: CalendarCheck,
    title: "Plateau detection",
    body: "Three weeks without progress triggers an automatic wave, deload or exercise swap. No stalled cycles.",
  },
  {
    icon: Trophy,
    title: "Strength prediction",
    body: "See your projected 1RM and goal date, updated after every logged set.",
  },
  {
    icon: ShieldCheck,
    title: "Offline-first PWA",
    body: "Log in the basement with no signal. Everything syncs the second you're back online.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Features</p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a great coach does — running quietly in the background.
          </h2>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map(({ icon: Icon, title, body }) => (
            <motion.article
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="surface-card rounded-3xl p-6"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
