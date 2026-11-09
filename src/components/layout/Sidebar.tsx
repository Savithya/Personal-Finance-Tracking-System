"use client";

import React, { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { savingAccounts, deposits, savingGoals } = useFinance();

  const mainNavItems: NavItem[] = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    {
      name: "Saving Accounts",
      href: "/saving-accounts",
      icon: Landmark,
      badge: savingAccounts.length > 0 ? savingAccounts.length : undefined,
    },
    {
      name: "Deposits",
      href: "/deposits",
      icon: Building2,
      badge: deposits.length > 0 ? deposits.length : undefined,
    },
    { name: "Budget Management", href: "/budgets", icon: PieChart },
    { name: "Category Management", href: "/categories", icon: Tags },
    { name: "Wallets", href: "/wallets", icon: Wallet },
    {
      name: "Saving Goals",
      href: "/saving-goals",
      icon: Target,
      badge: savingGoals.filter((g) => g.status === "in_progress").length || undefined,
    },
    { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    { name: "Income Inflows", href: "/income", icon: TrendingUp },
    { name: "Expense Management", href: "/expenses", icon: TrendingDown },
  ];

  const bottomNavItems: NavItem[] = [
    { name: "My Profile", href: "/profile", icon: User },
    { name: "Admin Panel", href: "/admin", icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of FINORA?")) {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/profile");
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#070B14] transition-all duration-300 z-30 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Sparkles className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                FINORA
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LKR
                </span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">
                Personal Finance System
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Navigation
          </div>
        )}

        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-white font-semibold border border-emerald-500/30 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}

              {!collapsed && item.badge !== undefined && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-white/5 space-y-1 bg-slate-50/80 dark:bg-[#05080F]">
        {!collapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Account & System
          </div>
        )}

        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-white font-semibold border border-emerald-500/30 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
