import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { MagicChatSheet } from "@/features/ai/MagicChatSheet";
import { mobileNavItems } from "./nav-items";

const MAGIC_ROUTES = ["/workout", "/food", "/progress"] as const;
type MagicPage = "workout" | "food" | "progress";

function getPage(pathname: string): MagicPage {
  if (pathname.startsWith("/food")) return "food";
  if (pathname.startsWith("/progress")) return "progress";
  return "workout";
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showMagic = MAGIC_ROUTES.some((r) => pathname.startsWith(r));
  const [chatOpen, setChatOpen] = useState(false);
  const page = getPage(pathname);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Floating magic button */}
      <AnimatePresence>
        {showMagic && (
          <motion.button
            key="magic"
            initial={{ opacity: 0, scale: 0.5, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            onClick={() => setChatOpen(true)}
            className="absolute -top-14 right-4 grid size-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-lg"
            aria-label="AI Coach"
          >
            <Sparkles className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <MagicChatSheet open={chatOpen} onClose={() => setChatOpen(false)} page={page} />

      <div className="glass mx-3 mb-3 flex items-center justify-between rounded-3xl px-2 py-2 shadow-float">
        {mobileNavItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
            activeProps={{ className: "text-primary" }}
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-primary/12"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className="relative size-5" />
                <span className="relative">{label}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
