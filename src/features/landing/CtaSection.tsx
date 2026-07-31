import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass relative mx-auto max-w-6xl overflow-hidden rounded-4xl px-6 py-16 text-center sm:px-16"
      >
        <div className="pointer-events-none absolute inset-0 gradient-hero" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your best training block starts tomorrow morning.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Two minutes to set up. Seven days free. Then $12 a month for a coach that never sleeps.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-2xl px-6 text-base">
              <Link to="/onboarding">
                Build my plan
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-2xl px-6 text-base"
            >
              <Link to="/auth/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl gradient-primary text-primary-foreground">
            <Activity className="size-4" />
          </span>
          <span className="font-display text-sm font-semibold">LiftSmart</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} LiftSmart Labs. Train smart.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <Link to="/settings" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/settings" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/coach" className="hover:text-foreground">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
