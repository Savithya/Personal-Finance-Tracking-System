"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  X,
  TrendingDown,
  Filter,
  Calendar,
  AlertCircle,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { calculateBudgetStatus } from "@/lib/calculations";

export default function BudgetsPage() {
  const {
    budgets,
    categories,
    categoriesMap,
    transactions,
    addBudget,
    updateBudget,
    deleteBudget,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Calculate actual budget status using real transactions
  const budgetStatuses = useMemo(() => {
    return calculateBudgetStatus(budgets, transactions, categoriesMap, selectedYear, selectedMonth);
  }, [budgets, transactions, categoriesMap, selectedYear, selectedMonth]);

  // Aggregate stats
  const totalAllocated = budgetStatuses.reduce((acc, b) => acc + b.budgetAmount, 0);
  const totalSpent = budgetStatuses.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUsagePct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const overspentCount = budgetStatuses.filter((b) => b.isOverBudget).length;

  const handleOpenAdd = () => {
    setEditingBudgetId(null);
    setCategoryId(expenseCategories[0]?.id || "");
    setAmount("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingBudgetId(item.budget.id);
    setCategoryId(item.budget.category_id);
    setAmount(item.budgetAmount.toString());
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setFormError("Budget amount must be greater than Rs. 0.00");
      return;
    }

    if (!categoryId) {
      setFormError("Please select an expense category.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingBudgetId) {
        const res = await updateBudget(editingBudgetId, {
          category_id: categoryId,
          amount: parsedAmt,
        });
        if (!res.success) {
          setFormError(res.error || "Failed to update budget");
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addBudget({
          category_id: categoryId,
          amount: parsedAmt,
          month: selectedMonth,
          year: selectedYear,
        });
        if (!res.success) {
          setFormError(res.error || "Failed to create budget");
          setIsSubmitting(false);
          return;
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PieChart className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Budget Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create monthly category budgets and track actual spending in Sri Lankan Rupees
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-");
                setSelectedPeriod(parseInt(y, 10), parseInt(m, 10));
              }}
              className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="2026-11" className="bg-[#0E1424]">November 2026</option>
              <option value="2026-12" className="bg-[#0E1424]">December 2026</option>
              <option value="2027-1" className="bg-[#0E1424]">January 2027</option>
              <option value="2026-10" className="bg-[#0E1424]">October 2026</option>
              <option value="2026-9" className="bg-[#0E1424]">September 2026</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Overspending Banner */}
      {overspentCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">Overspending Alert Detected!</p>
              <p className="text-[11px] text-rose-400/80">
                You have exceeded your allocated budget limit in {overspentCount} category(s) this month.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Budget</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(totalAllocated)}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Allocated for {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Actual Spending</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-rose-400">{formatCurrency(totalSpent)}</div>
            <p className="text-[11px] text-slate-400 mt-1">From real expense records</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Remaining Budget</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-xl sm:text-2xl font-black ${
                totalRemaining >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCurrency(totalRemaining)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {totalRemaining >= 0 ? "Safe margin available" : "Deficit (Overspent)"}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Utilization Rate</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white">{overallUsagePct}%</span>
              <span className="text-xs text-slate-400">of total</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  overallUsagePct > 100
                    ? "bg-rose-500"
                    : overallUsagePct >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, overallUsagePct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budgets List */}
      {budgetStatuses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <PieChart className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No budgets created yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Create monthly category budgets to keep your living expenses, transportation, and groceries under control.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Monthly Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetStatuses.map((item) => {
            const pct = item.percentageUsed;
            const isOver = item.isOverBudget;
            const isWarn = item.isWarning;

            return (
              <div
                key={item.budget.id}
                className="rounded-2xl bg-[#0C111D] border border-white/5 p-5 hover:border-white/10 transition-all hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  {/* Category Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{ backgroundColor: item.categoryColor || "#6366F1" }}
                      >
                        <PieChart className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {item.categoryName}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {getMonthName(selectedMonth)} {selectedYear}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isOver
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : isWarn
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {isOver ? "Over Budget" : isWarn ? "Warning" : "On Track"}
                    </span>
                  </div>

                  {/* Financial Metrics */}
                  <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Budget Limit:</span>
                      <span className="font-bold text-white">{formatCurrency(item.budgetAmount)}</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Actual Spent:</span>
                      <span className={`font-bold ${isOver ? "text-rose-400" : "text-slate-200"}`}>
                        {formatCurrency(item.spentAmount)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-baseline justify-between text-xs">
                      <span className="text-slate-400 font-medium">Remaining:</span>
                      <span
                        className={`font-black ${
                          item.remainingAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {formatCurrency(item.remainingAmount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Utilization</span>
                        <span
                          className={`font-bold ${
                            isOver ? "text-rose-400" : isWarn ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isOver ? "bg-rose-500" : isWarn ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit budget"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(item.budget.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    title="Delete budget"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingBudgetId ? "Edit Monthly Budget" : "Create Monthly Budget"}
                </h2>
                <p className="text-xs text-slate-400">
                  Set expense limits for {getMonthName(selectedMonth)} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Expense Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Monthly Budget Limit (LKR - Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="30000.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? "Saving..." : editingBudgetId ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative w-full max-w-sm bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 z-10 text-center animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="h-12 w-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Budget?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Are you sure you want to delete this budget limit? Your transaction history will not be affected.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
