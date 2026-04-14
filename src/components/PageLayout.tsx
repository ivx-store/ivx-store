import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { MobileNav } from "./MobileNav";
import { useDevicePerformance } from "../lib/useDevicePerformance";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { isLowEnd } = useDevicePerformance();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30 relative" dir="rtl">
      {/* Liquid Glass Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {isLowEnd ? (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.03] via-transparent to-gray-500/[0.02]" />
        ) : (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gray-500/10 blur-[120px] mix-blend-screen" />
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-white/5 blur-[100px] mix-blend-screen" />
          </>
        )}
      </div>

      <div className="relative z-10">
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </div>
      <MobileNav />
    </div>
  );
}
