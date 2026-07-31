import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, stagger } from "@/components/common/PageTransition";
import { Button } from "@/components/ui/button";
import { pricing } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Pricing</p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Cheaper than one session with a trainer.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cancel anytime. Your data is always exportable.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          {pricing.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className={cn(
                "relative flex flex-col rounded-4xl p-7",
                p.highlighted
                  ? "glass border-primary/40 shadow-glow"
                  : "surface-card",
              )}
            >
              {p.highlighted ? (
                <span className="absolute -top-3 left-7 rounded-full gradient-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-7 h-11 rounded-2xl"
                variant={p.highlighted ? "default" : "secondary"}
              >
                <Link to="/auth/signup">{p.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
