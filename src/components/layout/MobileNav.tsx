"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Building2,
  PieChart,
  Tags,
  Wallet,
  Target,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  User,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { FinoraBrand } from "./FinoraLogo";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!isOpen) return null;

  const mainNavItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Saving Accounts", href: "/saving-accounts", icon: Landmark },
    { name: "Deposits", href: "/deposits", icon: Building2 },
    { name: "Budget Management", href: "/budgets", icon: PieChart },
    { name: "Category Management", href: "/categories", icon: Tags },
    { name: "Wallets", href: "/wallets", icon: Wallet },
    { name: "Saving Goals", href: "/saving-goals", icon: Target },
    { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    { name: "Income Inflows", href: "/income", icon: TrendingUp },
    { name: "Expense Management", href: "/expenses", icon: TrendingDown },
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Admin Panel", href: "/admin", icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of FINORA?")) {
      await fetch("/api/admin/logout", { method: "POST" });
      onClose();
      router.push("/profile");
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#070B14] border-r border-slate-200 dark:border-white/10 h-full flex flex-col z-10 shadow-2xl transition-transform duration-300">
        {/* Drawer Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
          <FinoraBrand size="sm" showBadge={true} showSubtitle={true} />
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors"
            title="Close menu"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Selector Widget inside Mobile Nav */}
        <div className="p-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Interface Theme
          </div>
          <ThemeToggle variant="segmented" />
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 touch-scroll">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-[#05080F]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors min-h-[44px]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout of FINORA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
