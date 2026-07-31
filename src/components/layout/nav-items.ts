import {
  Apple,
  Bot,
  Dumbbell,
  LayoutDashboard,
  Scale,
  Settings,
  TrendingUp,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/food", label: "Food", icon: Apple },
  { to: "/weight", label: "Weight", icon: Scale },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/coach", label: "AI Coach", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const mobileNavItems = navItems.filter((n) =>
  ["/dashboard", "/workout", "/food", "/progress", "/coach"].includes(n.to),
);
