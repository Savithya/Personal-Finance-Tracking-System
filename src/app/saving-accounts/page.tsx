"use client";

import React, { useState } from "react";
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CreditCard,
  Building,
  TrendingUp,
  History,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
  Calendar,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { SavingAccount, Transaction } from "@/types";
import { formatCurrency, formatDate, maskAccountNumber } from "@/lib/utils";

const SRI_LANKAN_BANKS = [
  "Commercial Bank of Ceylon",
  "Bank of Ceylon (BOC)",
  "Sampath Bank",
  "Hatton National Bank (HNB)",
  "National Development Bank (NDB)",
  "Seylan Bank",
  "Nations Trust Bank (NTB)",
  "People's Bank",
  "DFCC Bank",
  "Pan Asia Bank",
  "Union Bank of Colombo",
  "Amana Bank",
  "Other Bank / Financial Institution",
];

const ACCOUNT_TYPES = [
  "Regular Savings Account",
  "High Yield Savings",
  "Fixed Term Savings",
  "Senior Citizens Savings",
  "Youth / Teen Savings",
  "Salary Savings Account",
  "Special Deposit Account (SDA)",
  "Other Savings",
];

const ACC_COLORS = [
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Amber", value: "#F59E0B" },
];

export default function SavingAccountsPage() {
  const { savingAccounts, transactions, addSavingAccount, updateSavingAccount, deleteSavingAccount, summary } =
    useFinance();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingAccount | null>(null);
  const [viewingAccount, setViewingAccount] = useState<SavingAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState(SRI_LANKAN_BANKS[0]);
  const [accountType, setAccountType] = useState(ACCOUNT_TYPES[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(ACC_COLORS[0].value);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setBankName(SRI_LANKAN_BANKS[0]);
    setAccountType(ACCOUNT_TYPES[0]);
    setAccountNumber("");
    setOpeningBalance("");
    setDescription("");
    setColor(ACC_COLORS[0].value);
    setFormError("");
    setFormSuccess("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (acc: SavingAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setBankName(acc.bank_name);
    setAccountType(acc.account_type);
    setAccountNumber(acc.account_number || "");
    setOpeningBalance(String(acc.opening_balance));
    setDescription(acc.description || "");
    setColor(acc.color || ACC_COLORS[0].value);
    setFormError("");
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Account name is required.");
      return;
    }

    const openBal = parseFloat(openingBalance);
    if (isNaN(openBal) || openBal < 0) {
      setFormError("Opening balance must be 0 or a positive amount in LKR.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAccount) {
        const res = await updateSavingAccount(editingAccount.id, {
          name: name.trim(),
          bank_name: bankName,
          account_type: accountType,
          account_number: accountNumber.trim(),
          description: description.trim(),
          color,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to update savings account");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Savings account updated successfully!");
        setTimeout(() => {
          setEditingAccount(null);
          resetForm();
        }, 600);
      } else {
        const res = await addSavingAccount({
          name: name.trim(),
          bank_name: bankName,
          account_type: accountType,
          account_number: accountNumber.trim(),
          opening_balance: openBal,
          description: description.trim(),
          color,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to add savings account");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Savings account added successfully!");
        setTimeout(() => {
          setIsAddOpen(false);
          resetForm();
        }, 600);
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSavingAccount(id);
      if (!res.success) {
        alert(res.error || "Cannot delete account");
      }
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  // Filter transactions for viewing account
  const accountTransactions: Transaction[] = viewingAccount
    ? transactions.filter(
        (t) =>
          (t.account_id === viewingAccount.id && t.account_type === "saving_account") ||
          (t.to_account_id === viewingAccount.id && t.to_account_type === "saving_account")
      )
    : [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Landmark className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Saving Accounts</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Sri Lankan bank savings accounts and track balances in LKR
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Savings Account</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Savings Balance</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalSavingAccountsBalance)}
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-1">Stored in real database records</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Accounts</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{savingAccounts.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Active savings accounts</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Account Balance</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatCurrency(
                savingAccounts.length > 0
                  ? summary.totalSavingAccountsBalance / savingAccounts.length
                  : 0
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across all savings accounts</p>
          </div>
        </div>
      </div>

      {/* Accounts List / Grid */}
      {savingAccounts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Landmark className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No savings accounts yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Add your first Sri Lankan savings account to start managing your bank balances, transactions, and cash inflows.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Savings Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingAccounts.map((acc) => (
            <div
              key={acc.id}
              className="rounded-2xl bg-[#0C111D] border border-white/5 p-5 hover:border-white/10 transition-all hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: acc.color || "#10B981" }}
                    >
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {acc.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{acc.bank_name}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-slate-300 shrink-0">
                    {acc.account_type}
                  </span>
                </div>

                {/* Account Number & Balance */}
                <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Account Number:</span>
                    <span className="font-mono text-slate-300">
                      {maskAccountNumber(acc.account_number)}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Current Balance:</span>
                    <span className="text-lg font-black text-white">
                      {formatCurrency(acc.current_balance)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Opening Balance:</span>
                    <span>{formatCurrency(acc.opening_balance)}</span>
                  </div>
                </div>

                {acc.description && (
                  <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 italic">
                    "{acc.description}"
                  </p>
                )}
              </div>

              {/* Card Footer & Actions */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Created {formatDate(acc.created_at, "short")}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingAccount(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="View details & transaction history"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit account"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(acc.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddOpen || editingAccount) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => {
              setIsAddOpen(false);
              setEditingAccount(null);
            }}
          />

          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingAccount ? "Edit Savings Account" : "Add New Savings Account"}
                </h2>
                <p className="text-xs text-slate-400">
                  {editingAccount
                    ? "Update your bank account information"
                    : "Add an actual Sri Lankan bank savings account"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingAccount(null);
                }}
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

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Commercial Bank Super Saver, BOC 14 Plus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Bank / Institution *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {SRI_LANKAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 8001234567"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Masked for privacy on display cards.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Opening Balance (LKR - Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    disabled={!!editingAccount}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                  {editingAccount && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Opening balance is locked after account creation.
                    </p>
                  )}
                </div>
              </div>

              {/* Color accent */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Card Color Theme
                </label>
                <div className="flex items-center gap-2">
                  {ACC_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`h-7 w-7 rounded-lg transition-transform ${
                        color === c.value ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0C111D]" : ""
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Account Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about interest rates, branch, debit card, or specific savings purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? "Saving..." : editingAccount ? "Update Account" : "Add Account"}
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
            <h3 className="text-base font-bold text-white">Delete Savings Account?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Are you sure you want to delete this savings account? This action cannot be undone.
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

      {/* View Details & History Modal */}
      {viewingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewingAccount(null)} />
          <div className="relative w-full max-w-2xl bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: viewingAccount.color || "#10B981" }}
                >
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewingAccount.name}</h3>
                  <p className="text-xs text-slate-400">{viewingAccount.bank_name}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Account Details Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400">Current Balance</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(viewingAccount.current_balance)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400">Opening Balance</span>
                <p className="text-sm font-bold text-slate-300 mt-0.5">
                  {formatCurrency(viewingAccount.opening_balance)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400">Account Type</span>
                <p className="text-xs font-semibold text-slate-300 mt-0.5 truncate">
                  {viewingAccount.account_type}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400">Account Number</span>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  {maskAccountNumber(viewingAccount.account_number)}
                </p>
              </div>
            </div>

            {viewingAccount.description && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 mb-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Description</span>
                {viewingAccount.description}
              </div>
            )}

            {/* Account Transaction History */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-emerald-400" /> Account Transaction History
              </h4>

              {accountTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/5">
                  No transactions recorded for this account yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Amount (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {accountTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{formatDate(t.date, "short")}</td>
                          <td className="py-2 px-3 font-medium text-white">{t.title}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                          <td className="py-2 px-3 text-right font-bold text-white">
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingAccount(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
