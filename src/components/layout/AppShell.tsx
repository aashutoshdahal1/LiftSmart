import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PageTransition } from "@/components/common/PageTransition";

interface AppShellProps {
  title: string;
  subtitle?: string | undefined;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 gradient-hero opacity-70" aria-hidden />
      <Sidebar />
      <div className="relative lg:pl-[268px]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6 lg:pb-12">
          <TopBar title={title} subtitle={subtitle} />
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
      <MobileNav />
      <InstallPrompt />
    </div>
  );
}
