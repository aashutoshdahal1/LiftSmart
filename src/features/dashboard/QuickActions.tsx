import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Apple, Dumbbell, MessageSquare, Scale } from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Start workout",
      icon: Dumbbell,
      tone: "bg-primary/12 text-primary",
      onClick: () => navigate({ to: "/workout" }),
    },
    {
      label: "Log meal",
      icon: Apple,
      tone: "bg-accent/15 text-accent",
      onClick: () => navigate({ to: "/food" }),
    },
    {
      label: "Log weight",
      icon: Scale,
      tone: "bg-warning/15 text-warning",
      onClick: () => navigate({ to: "/progress", search: { tab: "body" } }),
    },
    {
      label: "Ask coach",
      icon: MessageSquare,
      tone: "bg-success/15 text-success",
      onClick: () => navigate({ to: "/coach" }),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ label, icon: Icon, tone, onClick }) => (
        <motion.button
          key={label}
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -3 }}
          onClick={onClick}
          className="surface-card flex h-full flex-col items-start gap-3 rounded-3xl p-4 text-left transition-colors hover:border-primary/30"
        >
          <span className={`grid size-10 place-items-center rounded-2xl ${tone}`}>
            <Icon className="size-5" />
          </span>
          <span className="text-sm font-medium leading-tight">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
