"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Menu,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const { user, openQuickAdd, openSearch } = useFinance();
  const [colomboTime, setColomboTime] = useState<string>("");
  const [shortDate, setShortDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-LK", {
        timeZone: "Asia/Colombo",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(now);

      const formattedShort = new Intl.DateTimeFormat("en-LK", {
        timeZone: "Asia/Colombo",
        month: "short",
        day: "numeric",
      }).format(now);

      setColomboTime(formatted);
      setShortDate(formattedShort);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/85 dark:bg-[#070B14]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Mobile Toggle & Date Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Open menu"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
          <CalendarIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 hidden sm:inline truncate max-w-[150px] md:max-w-none">
            {colomboTime || "Colombo, Sri Lanka"}
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300 hidden min-[360px]:inline sm:hidden">
            {shortDate || "Colombo"}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shrink-0">
            LKR
          </span>
        </div>
      </div>

      {/* Center: Global Search Input / Trigger */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4 flex justify-center">
        {/* Full search button on sm and larger */}
        <button
          onClick={openSearch}
          className="hidden sm:flex items-center gap-2.5 w-full max-w-xs md:max-w-sm px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.07] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all text-xs group"
          aria-label="Search transactions and accounts"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
          <span className="truncate flex-1 text-left">Search transactions, accounts...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Compact search icon button on extra small screens (< sm) */}
        <button
          onClick={openSearch}
          className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
          title="Search"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Theme Toggle Button */}
        <ThemeToggle variant="button" />

        {/* Quick Add Transaction Button */}
        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] shrink-0"
          title="Add Transaction"
          aria-label="Add Transaction"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/5 transition-all text-slate-700 dark:text-slate-300"
          title="My Profile"
          aria-label="My Profile"
        >
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.full_name ? user.full_name[0].toUpperCase() : "U"}
          </div>
          <span className="hidden xl:inline text-xs font-medium max-w-[100px] truncate">
            {user.full_name || "Profile"}
          </span>
        </Link>
      </div>
    </header>
  );
}
