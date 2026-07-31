import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { mobileNavItems } from "./nav-items";

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
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
