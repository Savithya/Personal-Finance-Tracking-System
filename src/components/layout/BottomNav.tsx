"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Plus,
  TrendingDown,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";

interface BottomNavProps {
  onOpenMobileNav: () => void;
}

export function BottomNav({ onOpenMobileNav }: BottomNavProps) {
  const pathname = usePathname();
  const { openQuickAdd } = useFinance();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-2 py-1.5 transition-colors duration-200"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Overview */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px]",
            pathname === "/"
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span>Overview</span>
        </Link>

        {/* Accounts / Wallets */}
        <Link
          href="/saving-accounts"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px]",
            pathname === "/saving-accounts" || pathname === "/wallets" || pathname === "/deposits"
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Landmark className="h-5 w-5 mb-0.5" />
          <span>Accounts</span>
        </Link>

        {/* Center Quick Action: Add Transaction */}
        <button
          type="button"
          onClick={openQuickAdd}
          className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
          title="Add Transaction"
          aria-label="Add Transaction"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 border-2 border-white dark:border-[#070B14]">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            Add
          </span>
        </button>

        {/* Expenses / Transactions */}
        <Link
          href="/expenses"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors min-w-[56px]",
            pathname === "/expenses" || pathname === "/transactions" || pathname === "/income"
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <TrendingDown className="h-5 w-5 mb-0.5" />
          <span>Expenses</span>
        </Link>

        {/* More / Menu Drawer */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors min-w-[56px]"
          title="More navigation options"
          aria-label="More navigation options"
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
