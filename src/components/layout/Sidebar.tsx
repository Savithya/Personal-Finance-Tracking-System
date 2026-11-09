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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "@/context/FinanceContext";
import { FinoraBrand } from "./FinoraLogo";

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
      <div
        className={cn(
          "h-16 flex items-center border-b border-slate-200 dark:border-white/5 transition-all duration-300 relative",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg",
            collapsed && "justify-center"
          )}
          title={collapsed ? "FINORA Personal Finance (Click to expand)" : "FINORA – Home"}
          onClick={collapsed ? (e) => { e.preventDefault(); setCollapsed(false); } : undefined}
        >
          <FinoraBrand collapsed={collapsed} />
        </Link>

        {!collapsed ? (
          <button
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all active:scale-95 shrink-0"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-5 h-6 w-6 rounded-full bg-white dark:bg-[#0C111D] border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-emerald-500 dark:hover:bg-emerald-600 transition-all z-40 active:scale-95"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
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
