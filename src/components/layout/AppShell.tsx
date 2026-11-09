"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { BottomNav } from "./BottomNav";
import { QuickTransactionModal } from "@/components/modals/QuickTransactionModal";
import { GlobalSearchModal } from "@/components/modals/GlobalSearchModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <Sidebar />

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto touch-scroll p-3 sm:p-5 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenMobileNav={() => setMobileNavOpen(true)} />

      {/* Global Modals */}
      <QuickTransactionModal />
      <GlobalSearchModal />
    </div>
  );
}
