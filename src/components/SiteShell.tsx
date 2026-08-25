import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { PwaInstallBanner } from "./PwaInstallBanner";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-warm-gradient">
      <SiteHeader />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <MobileBottomNav />
      <PwaInstallBanner />
      <SiteFooter />
    </div>
  );
}
