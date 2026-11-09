"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, TrendingUp, TrendingDown, ArrowLeftRight, Check, AlertCircle } from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { TransactionType } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

export function QuickTransactionModal() {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    quickAddDefaultType,
    savingAccounts,
    wallets,
    categories,
    addTransaction,
    transferFunds,
    user,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(quickAddDefaultType || "expense");
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Target composite keys: "saving_account:id" or "wallet:id"
  const [sourceKey, setSourceKey] = useState<string>("");
  const [destKey, setDestKey] = useState<string>("");

  const [categoryId, setCategoryId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (quickAddDefaultType) {
      setType(quickAddDefaultType);
    }
  }, [quickAddDefaultType]);

  // Available sources (saving accounts + wallets)
  const allAccounts = [
    ...savingAccounts.map((a) => ({
      key: `saving_account:${a.id}`,
      id: a.id,
      type: "saving_account" as const,
      name: `${a.name} (${a.bank_name})`,
      balance: a.current_balance,
      category: "Saving Account",
    })),
    ...wallets.map((w) => ({
      key: `wallet:${w.id}`,
      id: w.id,
      type: "wallet" as const,
      name: `${w.name} (${w.type})`,
      balance: w.current_balance,
      category: "Wallet",
    })),
  ];

  // Auto-select first account if not set
  useEffect(() => {
    if (!sourceKey && allAccounts.length > 0) {
      setSourceKey(allAccounts[0].key);
    }
    if (!destKey && allAccounts.length > 1) {
      setDestKey(allAccounts[1].key);
    }
  }, [allAccounts, sourceKey, destKey]);

  if (!isQuickAddOpen) return null;

  const filteredCategories = categories.filter((c) =>
    type === "income" ? c.type === "income" : c.type === "expense"
  );

  const parseCompositeKey = (key: string) => {
    const [accType, id] = key.split(":");
    return { id, type: accType as "saving_account" | "wallet" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than Rs. 0.00");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a transaction title / description.");
      return;
    }

    if (allAccounts.length === 0) {
      setError("You have not created any accounts or wallets yet. Please create one first.");
      return;
    }

    if (!sourceKey) {
      setError("Please select a source account or wallet.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === "transfer") {
        if (!destKey || sourceKey === destKey) {
          setError("Please choose two different accounts/wallets for the transfer.");
          setIsSubmitting(false);
          return;
        }

        const src = parseCompositeKey(sourceKey);
        const dst = parseCompositeKey(destKey);

        const res = await transferFunds({
          fromAccountId: src.id,
          fromAccountType: src.type,
          toAccountId: dst.id,
          toAccountType: dst.type,
          amount: parsedAmount,
          title: title.trim(),
          date,
          paymentMethod,
          notes: notes.trim(),
        });

        if (!res.success) {
          setError(res.error || "Failed to complete transfer");
          setIsSubmitting(false);
          return;
        }
      } else {
        const src = parseCompositeKey(sourceKey);
        const res = await addTransaction({
          title: title.trim(),
          type,
          amount: parsedAmount,
          category_id: categoryId || (filteredCategories[0]?.id || null),
          account_id: src.id,
          account_type: src.type,
          date,
          payment_method: paymentMethod,
          description: title.trim(),
          notes: notes.trim(),
        });

        if (!res.success) {
          setError(res.error || "Failed to record transaction");
          setIsSubmitting(false);
          return;
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTitle("");
        setAmount("");
        setNotes("");
        closeQuickAdd();
      }, 700);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={closeQuickAdd} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Record Transaction</h2>
            <p className="text-xs text-slate-400">Save a financial record to database in Sri Lankan Rupees</p>
          </div>
          <button
            onClick={closeQuickAdd}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>Transaction successfully saved to database!</span>
          </div>
        )}

        {allAccounts.length === 0 ? (
          <div className="mt-6 text-center py-6 px-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-sm font-semibold text-white">No Accounts or Wallets Found</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Before recording transactions, you must add at least one Saving Account or Wallet.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/saving-accounts"
                onClick={closeQuickAdd}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Add Saving Account
              </Link>
              <Link
                href="/wallets"
                onClick={closeQuickAdd}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add Wallet
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Transaction Type Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
                  type === "expense"
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                onClick={() => setType("income")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
                  type === "income"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Income</span>
              </button>

              <button
                type="button"
                onClick={() => setType("transfer")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
                  type === "transfer"
                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Transfer</span>
              </button>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Transaction Title / Payee *
              </label>
              <input
                type="text"
                placeholder={
                  type === "expense"
                    ? "e.g., Keells Super Grocery, Dialog Bill"
                    : type === "income"
                    ? "e.g., Monthly Salary, Client Payment"
                    : "e.g., Transfer to Commercial Bank"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Amount (LKR) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Amount (LKR - Rs.) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Account / Wallet Selection */}
            {type !== "transfer" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {type === "income" ? "Deposit Into Account / Wallet *" : "Pay From Account / Wallet *"}
                  </label>
                  <select
                    value={sourceKey}
                    onChange={(e) => setSourceKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {allAccounts.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.name} ({formatCurrency(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    From Account / Wallet *
                  </label>
                  <select
                    value={sourceKey}
                    onChange={(e) => setSourceKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {allAccounts.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.name} ({formatCurrency(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    To Account / Wallet *
                  </label>
                  <select
                    value={destKey}
                    onChange={(e) => setDestKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {allAccounts.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.name} ({formatCurrency(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Date & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Transaction Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="bank_transfer">Bank Transfer (CEFT / SLIPS)</option>
                  <option value="cash">Cash</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="digital_wallet">Digital Wallet (FriMi / Genie / etc.)</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Additional details, reference number, or remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={closeQuickAdd}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
