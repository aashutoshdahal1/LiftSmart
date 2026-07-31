import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Apple, Dumbbell, MessageSquare, Scale } from "lucide-react";

const actions = [
  { to: "/workout", label: "Start workout", icon: Dumbbell, tone: "bg-primary/12 text-primary" },
  { to: "/food", label: "Log meal", icon: Apple, tone: "bg-accent/15 text-accent" },
  { to: "/weight", label: "Log weight", icon: Scale, tone: "bg-warning/15 text-warning" },
  { to: "/coach", label: "Ask coach", icon: MessageSquare, tone: "bg-success/15 text-success" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ to, label, icon: Icon, tone }) => (
        <motion.div key={to} whileTap={{ scale: 0.96 }} whileHover={{ y: -3 }}>
          <Link
            to={to}
            className="surface-card flex h-full flex-col items-start gap-3 rounded-3xl p-4 transition-colors hover:border-primary/30"
          >
            <span className={`grid size-10 place-items-center rounded-2xl ${tone}`}>
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-medium leading-tight">{label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
