"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Trash2,
  Edit2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Landmark,
  FileSpreadsheet,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { Transaction, TransactionType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TransactionsPage() {
  const {
    transactions,
    savingAccounts,
    wallets,
    categories,
    categoriesMap,
    accountsMap,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    openQuickAdd,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Selected Transaction for Details Modal & Edit
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editError, setEditError] = useState("");

  // Unified accounts list for filtering
  const allAccountOptions = [
    ...savingAccounts.map((a) => ({ id: a.id, name: `${a.name} (Savings)` })),
    ...wallets.map((w) => ({ id: w.id, name: `${w.name} (Wallet)` })),
  ];

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const title = (t.title || "").toLowerCase();
          const desc = (t.description || "").toLowerCase();
          const notes = (t.notes || "").toLowerCase();
          const cat = (categoriesMap.get(t.category_id || "")?.name || "").toLowerCase();
          const acc = (accountsMap.get(t.account_id)?.name || "").toLowerCase();

          if (!title.includes(term) && !desc.includes(term) && !notes.includes(term) && !cat.includes(term) && !acc.includes(term)) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== "all" && t.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "all" && t.category_id !== selectedCategory) {
          return false;
        }

        // Account filter
        if (selectedAccount !== "all" && t.account_id !== selectedAccount && t.to_account_id !== selectedAccount) {
          return false;
        }

        // Date range filter
        if (dateFrom && t.date < dateFrom) {
          return false;
        }
        if (dateTo && t.date > dateTo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "date_asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "amount_desc") {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === "amount_asc") {
          return Number(a.amount) - Number(b.amount);
        }
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    selectedType,
    selectedCategory,
    selectedAccount,
    dateFrom,
    dateTo,
    sortBy,
    categoriesMap,
    accountsMap,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenEdit = (t: Transaction) => {
    setEditingTx(t);
    setEditTitle(t.title || t.description || "");
    setEditAmount(String(t.amount));
    setEditDate(t.date);
    setEditCategory(t.category_id || "");
    setEditPaymentMethod(t.payment_method || "cash");
    setEditNotes(t.notes || "");
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) {
      setEditError("Amount must be greater than Rs. 0.00");
      return;
    }

    try {
      const res = await updateTransaction(editingTx.id, {
        title: editTitle.trim(),
        description: editTitle.trim(),
        amount: amt,
        date: editDate,
        category_id: editCategory || null,
        payment_method: editPaymentMethod,
        notes: editNotes.trim(),
      });

      if (!res.success) {
        setEditError(res.error || "Update failed");
        return;
      }

      setEditingTx(null);
    } catch (err: any) {
      setEditError(err.message || "An error occurred");
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

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const headers = ["ID", "Date", "Title", "Type", "Amount (LKR)", "Category", "Account", "Payment Method", "Notes"];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${(categoriesMap.get(t.category_id || "")?.name || "N/A").replace(/"/g, '""')}"`,
      `"${(accountsMap.get(t.account_id)?.name || "N/A").replace(/"/g, '""')}"`,
      t.payment_method,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FINORA_Transactions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Transactions Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete database of actual Income, Expense, and Transfer records in Sri Lankan Rupees (LKR)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
            title="Export transactions as CSV spreadsheet"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={openQuickAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0C111D] border border-white/5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, category, or account..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Transaction Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Types (Income, Expense, Transfer)</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
              <option value="transfer">Transfer Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="date_desc">Newest First (Date ↓)</option>
              <option value="date_asc">Oldest First (Date ↑)</option>
              <option value="amount_desc">Highest Amount (Rs. ↓)</option>
              <option value="amount_asc">Lowest Amount (Rs. ↑)</option>
            </select>
          </div>
        </div>

        {/* Secondary filters: Category, Account, Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Accounts / Wallets</option>
              {allAccountOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 shrink-0">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 shrink-0">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <ArrowLeftRight className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No transactions found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Start manually adding your real personal income, expenses, and inter-account transfers in Sri Lankan Rupees.
          </p>
          <button
            onClick={openQuickAdd}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Record Your First Transaction</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0C111D] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[680px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Title / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account / Wallet</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {paginatedTransactions.map((t) => {
                  const cat = categoriesMap.get(t.category_id || "");
                  const srcAcc = accountsMap.get(t.account_id);
                  const dstAcc = t.to_account_id ? accountsMap.get(t.to_account_id) : null;

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDate(t.date, "short")}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {t.title}
                        </div>
                        {t.notes && <div className="text-[10px] text-slate-500 line-clamp-1">{t.notes}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {cat ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                              border: `1px solid ${cat.color}30`,
                            }}
                          >
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <div className="text-slate-200 font-medium">
                          {srcAcc?.name || "Account"}
                        </div>
                        {t.type === "transfer" && dstAcc && (
                          <div className="text-[10px] text-blue-400 flex items-center gap-1">
                            → {dstAcc.name}
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            t.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : t.type === "expense"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {t.type === "income" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : t.type === "expense" ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <ArrowLeftRight className="h-3 w-3" />
                          )}
                          {t.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3 px-4 text-right font-black whitespace-nowrap text-sm ${
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

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailTx(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(t.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete transaction"
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

          {/* Pagination Controls */}
          <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-semibold text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDetailTx(null)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">Transaction Details</h3>
                <p className="text-xs text-slate-400 font-mono">{detailTx.id}</p>
              </div>
              <button onClick={() => setDetailTx(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Title / Payee:</span>
                <span className="font-bold text-white text-sm">{detailTx.title}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Amount (LKR):</span>
                <span
                  className={`font-black text-base ${
                    detailTx.type === "income"
                      ? "text-emerald-400"
                      : detailTx.type === "expense"
                      ? "text-rose-400"
                      : "text-blue-400"
                  }`}
                >
                  {formatCurrency(detailTx.amount)}
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Transaction Type:</span>
                <span className="font-bold uppercase tracking-wider text-slate-200">{detailTx.type}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-white">
                  {categoriesMap.get(detailTx.category_id || "")?.name || "None / Transfer"}
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Source Account / Wallet:</span>
                <span className="font-semibold text-white">
                  {accountsMap.get(detailTx.account_id)?.name || detailTx.account_id}
                </span>
              </div>

              {detailTx.to_account_id && (
                <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Destination Account / Wallet:</span>
                  <span className="font-semibold text-blue-400">
                    {accountsMap.get(detailTx.to_account_id)?.name || detailTx.to_account_id}
                  </span>
                </div>
              )}

              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Date:</span>
                <span className="font-mono text-slate-200">{formatDate(detailTx.date)}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400">Payment Method:</span>
                <span className="capitalize text-slate-200">{detailTx.payment_method.replace("_", " ")}</span>
              </div>

              {detailTx.notes && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Notes</span>
                  <p className="text-slate-300">{detailTx.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditingTx(null)} />
          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">Edit Transaction</h3>
                <p className="text-xs text-slate-400">Balances will be automatically recalculated</p>
              </div>
              <button onClick={() => setEditingTx(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Title / Payee *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {editingTx.type !== "transfer" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c.type === editingTx.type)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Save Changes
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
            <h3 className="text-base font-bold text-white">Delete Transaction?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Deleting this record will automatically revert its balance impact on the linked account/wallet.
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
