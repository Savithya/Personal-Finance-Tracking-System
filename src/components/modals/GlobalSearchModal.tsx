"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeftRight, Landmark, Wallet, PieChart, Building2 } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency } from "@/lib/utils";

export function GlobalSearchModal() {
  const router = useRouter();
  const {
    isSearchOpen,
    closeSearch,
    openSearch,
    transactions,
    savingAccounts,
    wallets,
    deposits,
    budgets,
    categoriesMap,
  } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, openSearch, closeSearch]);

  if (!isSearchOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const matchingTransactions = term
    ? transactions
        .filter(
          (t) =>
            t.title?.toLowerCase().includes(term) ||
            t.description?.toLowerCase().includes(term) ||
            t.notes?.toLowerCase().includes(term)
        )
        .slice(0, 5)
    : [];

  const matchingAccounts = term
    ? savingAccounts
        .filter(
          (a) =>
            a.name.toLowerCase().includes(term) ||
            a.bank_name.toLowerCase().includes(term)
        )
        .slice(0, 3)
    : [];

  const matchingWallets = term
    ? wallets
        .filter(
          (w) =>
            w.name.toLowerCase().includes(term) ||
            w.type.toLowerCase().includes(term)
        )
        .slice(0, 3)
    : [];

  const matchingDeposits = term
    ? deposits
        .filter(
          (d) =>
            d.name.toLowerCase().includes(term) ||
            d.bank_name.toLowerCase().includes(term)
        )
        .slice(0, 3)
    : [];

  const handleNavigate = (path: string) => {
    closeSearch();
    setSearchTerm("");
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4">
        {/* Search Input */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search transactions, accounts, wallets, deposits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium"
          />
          <button
            onClick={closeSearch}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="py-3 max-h-96 overflow-y-auto space-y-4 touch-scroll">
          {!term && (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              Type keywords to find transactions, savings accounts, wallets, or fixed deposits.
            </div>
          )}

          {term &&
            matchingTransactions.length === 0 &&
            matchingAccounts.length === 0 &&
            matchingWallets.length === 0 &&
            matchingDeposits.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                No matching records found for "{searchTerm}".
              </div>
            )}

          {/* Transactions */}
          {matchingTransactions.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <ArrowLeftRight className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> Transactions
              </h5>
              <div className="space-y-1">
                {matchingTransactions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleNavigate("/transactions")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.date}</p>
                    </div>
                    <span
                      className={`font-bold ${
                        t.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : t.type === "expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : t.type === "expense" ? "-" : "⇄"}{" "}
                      {formatCurrency(t.amount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saving Accounts */}
          {matchingAccounts.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Landmark className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> Saving Accounts
              </h5>
              <div className="space-y-1">
                {matchingAccounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleNavigate("/saving-accounts")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{a.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{a.bank_name}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(a.current_balance)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallets */}
          {matchingWallets.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Wallet className="h-3 w-3 text-indigo-500 dark:text-indigo-400" /> Wallets
              </h5>
              <div className="space-y-1">
                {matchingWallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleNavigate("/wallets")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{w.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{w.type} wallet</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(w.current_balance)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deposits */}
          {matchingDeposits.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-cyan-500 dark:text-cyan-400" /> Deposits
              </h5>
              <div className="space-y-1">
                {matchingDeposits.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleNavigate("/deposits")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{d.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.bank_name}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(d.amount)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
