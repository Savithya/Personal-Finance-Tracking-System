"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Landmark,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  PieChart as PieChartIcon,
  Target,
  Plus,
  ArrowRight,
  Filter,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { useTheme } from "@/context/ThemeContext";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import { calculateCategorySpending, calculateMonthlyTrends } from "@/lib/calculations";

export default function DashboardPage() {
  const {
    user,
    summary,
    savingAccounts,
    wallets,
    deposits,
    savingGoals,
    transactions,
    categoriesMap,
    accountsMap,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
    openQuickAdd,
  } = useFinance();
  const { isDark } = useTheme();

  // Calculations from actual persistent transactions
  const categorySpending = calculateCategorySpending(transactions, categoriesMap, selectedYear, selectedMonth);
  const monthlyTrends = calculateMonthlyTrends(transactions, selectedYear, selectedMonth, 6);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner / Welcome & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Financial Overview
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LKR LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-white font-semibold">{user.full_name || "Financial User"}</span>. Here is your real-time Sri Lankan Rupee financial summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-");
                setSelectedPeriod(parseInt(y, 10), parseInt(m, 10));
              }}
              className="bg-transparent border-none text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="2026-11">November 2026</option>
              <option value="2026-12">December 2026</option>
              <option value="2027-1">January 2027</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-9">September 2026</option>
            </select>
          </div>

          <button
            onClick={openQuickAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Combined Balance</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Accounts ({savingAccounts.length}) • Wallets ({wallets.length}) • FDs ({deposits.length})
            </p>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Inflow</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">
              +{formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              For {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden group hover:border-rose-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Expenses</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400">
              -{formatCurrency(summary.totalExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              From actual recorded expenses
            </p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Net Monthly Cash Flow</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black ${
                summary.netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {summary.netCashFlow >= 0 ? "+" : ""}
              {formatCurrency(summary.netCashFlow)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Savings Rate: <strong className="text-white">{summary.savingsRate}%</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trends Chart */}
        <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Income vs Expenses Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative comparison based on stored database records
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `Rs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0C111D" : "#FFFFFF",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
                    borderRadius: "12px",
                    color: isDark ? "#fff" : "#0F172A",
                    boxShadow: isDark ? "none" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: any) => [formatCurrency(val)]}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Donut */}
        <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-purple-400" /> Spending Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Category expenses for {getMonthName(selectedMonth)}
            </p>
          </div>

          {categorySpending.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No expenses recorded in {getMonthName(selectedMonth)} yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#6366F1"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#0C111D" : "#FFFFFF",
                        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
                        borderRadius: "12px",
                        color: isDark ? "#fff" : "#0F172A",
                        boxShadow: isDark ? "none" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                      formatter={(val: any) => [formatCurrency(val), "Expense"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {categorySpending.slice(0, 4).map((c) => (
                  <div key={c.categoryId} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.categoryName}
                    </span>
                    <span className="font-bold text-white">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/expenses"
            className="flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-3 border-t border-white/5 transition-colors"
          >
            <span>View All Expenses</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Saving Accounts & Wallets Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saving Accounts Widget */}
        <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-400" /> Saving Accounts
            </h3>
            <Link
              href="/saving-accounts"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {savingAccounts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-white/[0.01] rounded-2xl border border-white/5">
              No savings accounts added yet.
              <Link href="/saving-accounts" className="block text-emerald-400 font-bold mt-2">
                + Add Savings Account
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savingAccounts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: a.color || "#10B981" }}
                    >
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{a.bank_name}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white text-sm">{formatCurrency(a.current_balance)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallets Widget */}
        <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="h-4 w-4 text-indigo-400" /> Wallets
            </h3>
            <Link
              href="/wallets"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-white/[0.01] rounded-2xl border border-white/5">
              No wallets created yet.
              <Link href="/wallets" className="block text-indigo-400 font-bold mt-2">
                + Create Wallet
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {wallets.slice(0, 3).map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: w.color || "#6366F1" }}
                    >
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{w.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{w.type} wallet</p>
                    </div>
                  </div>
                  <span className="font-bold text-white text-sm">{formatCurrency(w.current_balance)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-emerald-400" /> Recent Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest actual entries stored in the database</p>
          </div>

          <Link
            href="/transactions"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 bg-white/[0.01] rounded-2xl border border-white/5">
            No transactions entered yet.
            <button onClick={openQuickAdd} className="block text-emerald-400 font-bold mt-2 mx-auto">
              + Add Transaction Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Account / Wallet</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {recentTransactions.map((t) => {
                  const cat = categoriesMap.get(t.category_id || "");
                  const acc = accountsMap.get(t.account_id);

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDate(t.date, "short")}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">{t.title}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {cat ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {acc?.name || "Account"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : t.type === "expense"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-black whitespace-nowrap ${
                          t.type === "income"
                            ? "text-emerald-400"
                            : t.type === "expense"
                            ? "text-rose-400"
                            : "text-blue-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : t.type === "expense" ? "-" : "⇄"}{" "}
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
