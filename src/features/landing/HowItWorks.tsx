import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/components/common/PageTransition";

const steps = [
  {
    n: "01",
    title: "Tell us where you are",
    body: "Two minutes of onboarding: metrics, goal, experience, equipment and food preferences.",
  },
  {
    n: "02",
    title: "Get today's plan",
    body: "A full session with target loads and reps, plus calorie and protein targets tuned to the day.",
  },
  {
    n: "03",
    title: "Log as you go",
    body: "Tap through sets with a built-in rest timer. Meals take seconds with favourites and recents.",
  },
  {
    n: "04",
    title: "Wake up to a smarter plan",
    body: "Overnight, LiftSmart reviews everything and rewrites tomorrow — including deloads you didn't ask for but needed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Four steps. Then it runs itself.
          </h2>
        </div>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s) => (
            <motion.li key={s.n} variants={fadeUp} className="glass rounded-3xl p-6">
              <span className="font-display text-3xl font-bold text-gradient">{s.n}</span>
              <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
