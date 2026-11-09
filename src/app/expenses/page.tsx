"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Calendar,
  Coins,
  X,
  AlertCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Tag,
  ArrowDownRight,
  Flame,
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
import { Transaction } from "@/types";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import { calculateCategorySpending } from "@/lib/calculations";

export default function ExpensesPage() {
  const {
    transactions,
    categories,
    savingAccounts,
    wallets,
    categoriesMap,
    accountsMap,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    selectedYear,
    selectedMonth,
  } = useFinance();
  const { isDark } = useTheme();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentKey, setPaymentKey] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Sources
  const paymentSources = useMemo(() => [
    ...savingAccounts.map((a) => ({
      key: `saving_account:${a.id}`,
      id: a.id,
      type: "saving_account" as const,
      name: `Account: ${a.name} (${formatCurrency(a.current_balance)})`,
    })),
    ...wallets.map((w) => ({
      key: `wallet:${w.id}`,
      id: w.id,
      type: "wallet" as const,
      name: `Wallet: ${w.name} (${formatCurrency(w.current_balance)})`,
    })),
  ], [savingAccounts, wallets]);

  const expenseCategories = useMemo(() => categories.filter((c) => c.type === "expense"), [categories]);

  // All expense records
  const allExpenses = useMemo(() => {
    return transactions.filter((t) => t.type === "expense");
  }, [transactions]);

  // Current month expenses
  const currentMonthExpenses = useMemo(() => {
    return allExpenses.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [allExpenses, selectedYear, selectedMonth]);

  // Category spending breakdown (computed with actual transactions)
  const categorySpending = useMemo(() => {
    return calculateCategorySpending(transactions, categoriesMap, selectedYear, selectedMonth);
  }, [transactions, categoriesMap, selectedYear, selectedMonth]);

  // Filtered expense list
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((t) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const titleMatch = (t.title || "").toLowerCase().includes(term);
        const descMatch = (t.description || "").toLowerCase().includes(term);
        const catMatch = (categoriesMap.get(t.category_id || "")?.name || "").toLowerCase().includes(term);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }
      if (selectedCategory !== "all" && t.category_id !== selectedCategory) return false;
      if (selectedMethod !== "all" && t.payment_method !== selectedMethod) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [allExpenses, searchTerm, selectedCategory, selectedMethod, dateFrom, dateTo, categoriesMap]);

  // Summary KPIs
  const totalAllTimeExpenses = allExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalMonthlyExpenses = currentMonthExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const highestCategory = categorySpending[0] || null;

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategoryId(expenseCategories[0]?.id || "");
    if (paymentSources.length > 0) setPaymentKey(paymentSources[0].key);
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("bank_transfer");
    setNotes("");
    setFormError("");
    setFormSuccess("");
    setEditingExpense(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditingExpense(t);
    setTitle(t.title);
    setAmount(String(t.amount));
    setCategoryId(t.category_id || expenseCategories[0]?.id || "");
    setPaymentKey(`${t.account_type}:${t.account_id}`);
    setDate(t.date);
    setPaymentMethod(t.payment_method || "bank_transfer");
    setNotes(t.notes || "");
    setFormError("");
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Expense description / title is required.");
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Expense amount must be greater than Rs. 0.00");
      return;
    }

    if (!paymentKey) {
      setFormError("Please select a payment wallet or account.");
      return;
    }

    const [accType, accId] = paymentKey.split(":");

    setIsSubmitting(true);

    try {
      if (editingExpense) {
        const res = await updateTransaction(editingExpense.id, {
          title: title.trim(),
          description: title.trim(),
          amount: amt,
          category_id: categoryId || null,
          account_id: accId,
          account_type: accType as "saving_account" | "wallet",
          date,
          payment_method: paymentMethod,
          notes: notes.trim(),
        });

        if (!res.success) {
          setFormError(res.error || "Failed to update expense");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Expense record updated successfully!");
        setTimeout(() => {
          setIsAddOpen(false);
          resetForm();
        }, 600);
      } else {
        const res = await addTransaction({
          title: title.trim(),
          type: "expense",
          amount: amt,
          category_id: categoryId || null,
          account_id: accId,
          account_type: accType as "saving_account" | "wallet",
          date,
          payment_method: paymentMethod,
          description: title.trim(),
          notes: notes.trim(),
        });

        if (!res.success) {
          setFormError(res.error || "Failed to record expense");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Expense recorded and balance deducted successfully!");
        setTimeout(() => {
          setIsAddOpen(false);
          resetForm();
        }, 600);
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
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
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Expense Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your daily expenses, bills, groceries, and monitor highest spending categories in LKR
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Expenses</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              {formatCurrency(totalMonthlyExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              For {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total All-Time Expenses</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatCurrency(totalAllTimeExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{allExpenses.length} total expense record(s)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Highest Spending Category</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-white truncate">
              {highestCategory ? highestCategory.categoryName : "None yet"}
            </div>
            <p className="text-[11px] text-rose-400 mt-1">
              {highestCategory ? `${formatCurrency(highestCategory.amount)} (${highestCategory.percentage}%)` : "No expense recorded"}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Per Expense</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatCurrency(allExpenses.length > 0 ? totalAllTimeExpenses / allExpenses.length : 0)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Mean expenditure ticket</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      {categorySpending.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Horizontal Bar Chart */}
          <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-rose-400" /> Spending Patterns by Category
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySpending.slice(0, 6)} layout="vertical">
                  <XAxis
                    type="number"
                    stroke="#64748B"
                    fontSize={10}
                    tickFormatter={(val) => `Rs.${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    stroke="#64748B"
                    fontSize={11}
                    width={110}
                    tickLine={false}
                  />
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
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                    {categorySpending.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Highest Spending Categories List */}
          <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Top Categories Breakdown
            </h3>
            {categorySpending.slice(0, 5).map((c) => (
              <div key={c.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.categoryName}
                  </span>
                  <span className="font-bold text-white">{formatCurrency(c.amount)}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0C111D] border border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Expense Categories</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="debit_card">Debit Card</option>
            <option value="credit_card">Credit Card</option>
            <option value="digital_wallet">Digital Wallet</option>
          </select>
        </div>
      </div>

      {/* Expense History Table */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <TrendingDown className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No expense records found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Track your living expenses, groceries, fuel, utility bills, and entertainment in Sri Lankan Rupees.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Record Your First Expense</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0C111D] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Payee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Paid From</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredExpenses.map((t) => {
                  const cat = categoriesMap.get(t.category_id || "");
                  const acc = accountsMap.get(t.account_id);

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDate(t.date, "short")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {t.title}
                        {t.notes && <p className="text-[10px] text-slate-500 font-normal">{t.notes}</p>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${cat?.color || "#EF4444"}15`,
                            color: cat?.color || "#EF4444",
                            border: `1px solid ${cat?.color || "#EF4444"}30`,
                          }}
                        >
                          {cat?.name || "Expense"}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {acc?.name || "Account"}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-400 text-sm whitespace-nowrap">
                        -{formatCurrency(t.amount)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                            title="Edit expense"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(t.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            title="Delete expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingExpense ? "Edit Expense Record" : "Add New Expense"}
                </h2>
                <p className="text-xs text-slate-400">
                  Deducts from chosen account or wallet balance in Sri Lankan Rupees
                </p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Expense Description / Payee *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Keells Super Groceries, Dialog Broadband Bill, Fuel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Amount (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="4500.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
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
                    Paid From Account / Wallet *
                  </label>
                  <select
                    value={paymentKey}
                    onChange={(e) => setPaymentKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    {paymentSources.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="bank_transfer">Bank Transfer (CEFT / SLIPS)</option>
                  <option value="cash">Cash</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Receipt number, invoice details, remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  {isSubmitting ? "Saving..." : editingExpense ? "Update Expense" : "Record Expense"}
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
            <h3 className="text-base font-bold text-white">Delete Expense Record?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Deleting this expense will automatically restore its amount to your linked account or wallet.
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
