import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AiRecommendationCardProps {
  title: string;
  body: string;
  tag: string;
  className?: string;
}

export function AiRecommendationCard({ title, body, tag, className }: AiRecommendationCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "glass relative overflow-hidden rounded-3xl p-5",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:gradient-primary",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-2 bg-accent/12 text-accent">
            {tag}
          </Badge>
          <h3 className="font-display text-base font-semibold leading-snug">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
    </motion.article>
  );
}
