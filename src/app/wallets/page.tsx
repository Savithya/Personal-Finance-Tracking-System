"use client";

import React, { useState } from "react";
import {
  Wallet as WalletIcon,
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Eye,
  History,
  Coins,
  Smartphone,
  Landmark,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { Wallet, WalletType, Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const WALLET_TYPES: { type: WalletType; label: string; icon: any }[] = [
  { type: "cash", label: "Cash Wallet", icon: Coins },
  { type: "bank", label: "Bank Wallet", icon: Landmark },
  { type: "digital", label: "Digital Wallet (FriMi / Genie / etc.)", icon: Smartphone },
  { type: "personal", label: "Personal Wallet", icon: User },
  { type: "other", label: "Other Wallet", icon: WalletIcon },
];

const WALLET_COLORS = [
  "#6366F1", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6",
  "#F59E0B", "#EC4899", "#64748B",
];

export default function WalletsPage() {
  const {
    wallets,
    savingAccounts,
    transactions,
    addWallet,
    updateWallet,
    deleteWallet,
    transferFunds,
    summary,
  } = useFinance();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [viewingWallet, setViewingWallet] = useState<Wallet | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
  const [color, setColor] = useState(WALLET_COLORS[0]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer Form Fields
  const [sourceKey, setSourceKey] = useState("");
  const [destKey, setDestKey] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTitle, setTransferTitle] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [transferNotes, setTransferNotes] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Unified accounts list for transfers
  const allFundingSources = [
    ...wallets.map((w) => ({
      key: `wallet:${w.id}`,
      id: w.id,
      type: "wallet" as const,
      name: `${w.name} (${w.type} wallet)`,
      balance: w.current_balance,
    })),
    ...savingAccounts.map((a) => ({
      key: `saving_account:${a.id}`,
      id: a.id,
      type: "saving_account" as const,
      name: `${a.name} (${a.bank_name})`,
      balance: a.current_balance,
    })),
  ];

  const resetForm = () => {
    setName("");
    setType("cash");
    setOpeningBalance("");
    setColor(WALLET_COLORS[0]);
    setFormError("");
    setFormSuccess("");
    setEditingWallet(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setOpeningBalance(String(w.opening_balance));
    setColor(w.color || WALLET_COLORS[0]);
    setFormError("");
    setIsAddOpen(true);
  };

  const handleOpenTransfer = () => {
    setTransferError("");
    setTransferSuccess(false);
    setTransferAmount("");
    setTransferTitle("Balance Transfer");
    setTransferNotes("");
    if (allFundingSources.length > 0) setSourceKey(allFundingSources[0].key);
    if (allFundingSources.length > 1) setDestKey(allFundingSources[1].key);
    setIsTransferOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Wallet name is required.");
      return;
    }

    const openBal = parseFloat(openingBalance);
    if (isNaN(openBal) || openBal < 0) {
      setFormError("Opening balance must be 0 or a positive amount in LKR.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingWallet) {
        const res = await updateWallet(editingWallet.id, {
          name: name.trim(),
          type,
          color,
          icon: "wallet",
        });
        if (!res.success) {
          setFormError(res.error || "Failed to update wallet");
          setIsSubmitting(false);
          return;
        }
        setFormSuccess("Wallet updated successfully!");
        setTimeout(() => {
          setIsAddOpen(false);
          resetForm();
        }, 600);
      } else {
        const res = await addWallet({
          name: name.trim(),
          type,
          opening_balance: openBal,
          color,
          icon: "wallet",
        });
        if (!res.success) {
          setFormError(res.error || "Failed to create wallet");
          setIsSubmitting(false);
          return;
        }
        setFormSuccess("Wallet created successfully!");
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

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferError("Transfer amount must be greater than Rs. 0.00");
      return;
    }

    if (!sourceKey || !destKey || sourceKey === destKey) {
      setTransferError("Please choose two different sources/destinations for transfer.");
      return;
    }

    const [srcType, srcId] = sourceKey.split(":");
    const [dstType, dstId] = destKey.split(":");

    setIsSubmitting(true);

    try {
      const res = await transferFunds({
        fromAccountId: srcId,
        fromAccountType: srcType as "saving_account" | "wallet",
        toAccountId: dstId,
        toAccountType: dstType as "saving_account" | "wallet",
        amount: amt,
        title: transferTitle.trim() || "Wallet Transfer",
        date: transferDate,
        notes: transferNotes.trim(),
      });

      if (!res.success) {
        setTransferError(res.error || "Transfer failed");
        setIsSubmitting(false);
        return;
      }

      setTransferSuccess(true);
      setTimeout(() => {
        setIsTransferOpen(false);
        setTransferSuccess(false);
      }, 700);
    } catch (err: any) {
      setTransferError(err.message || "Transfer error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteWallet(id);
      if (!res.success) {
        alert(res.error || "Cannot delete wallet");
      }
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  // Transactions relating to viewing wallet
  const walletTransactions = viewingWallet
    ? transactions.filter(
        (t) =>
          (t.account_id === viewingWallet.id && t.account_type === "wallet") ||
          (t.to_account_id === viewingWallet.id && t.to_account_type === "wallet")
      )
    : [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <WalletIcon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Wallets Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Cash, Digital, Bank and Personal wallets in Sri Lankan Rupees
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={handleOpenTransfer}
            disabled={allFundingSources.length < 2}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
            title={allFundingSources.length < 2 ? "Need at least 2 accounts/wallets to transfer" : "Transfer funds"}
          >
            <ArrowLeftRight className="h-4 w-4 text-emerald-400" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Wallet</span>
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Wallets Balance</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <WalletIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{formatCurrency(summary.totalWalletsBalance)}</div>
            <p className="text-[11px] text-indigo-400 mt-1">Across all active wallets</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Wallets</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{wallets.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Cash, digital & personal</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Overall Total Liquidity</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalSavingAccountsBalance + summary.totalWalletsBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Savings Accounts + Wallets combined</p>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <WalletIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No wallets created yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Create your Cash Wallet, Digital Wallet (FriMi, Genie), or Personal Wallet to track everyday balances and transfers.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Wallet</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl bg-[#0C111D] border border-white/5 p-5 hover:border-white/10 transition-all hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: w.color || "#6366F1" }}
                    >
                      <WalletIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {w.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 capitalize">{w.type} wallet</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-slate-300">
                    {w.type}
                  </span>
                </div>

                {/* Balance Box */}
                <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Opening Balance:</span>
                    <span>{formatCurrency(w.opening_balance)}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Current Balance:</span>
                    <span className="text-lg font-black text-white">{formatCurrency(w.current_balance)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Added {formatDate(w.created_at, "short")}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingWallet(w)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="View wallet history"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(w)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit wallet"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(w.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    title="Delete wallet"
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
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingWallet ? "Edit Wallet" : "Create New Wallet"}
                </h2>
                <p className="text-xs text-slate-400">
                  Manage personal balances in Sri Lankan Rupees
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Wallet Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Physical Cash Wallet, FriMi Digital, Personal Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Wallet Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as WalletType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  {WALLET_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Opening Balance (LKR - Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    disabled={!!editingWallet}
                    required
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                {editingWallet && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Opening balance is set at creation and updated through transactions.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Color Accent
                </label>
                <div className="flex gap-2">
                  {WALLET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-lg transition-transform ${
                        color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0C111D]" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? "Saving..." : editingWallet ? "Update Wallet" : "Create Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsTransferOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-emerald-400" />
                  Transfer Funds
                </h2>
                <p className="text-xs text-slate-400">
                  Move money between wallets and savings accounts without counting as an expense
                </p>
              </div>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {transferError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {transferSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Transfer recorded successfully!</span>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    From Account / Wallet *
                  </label>
                  <select
                    value={sourceKey}
                    onChange={(e) => setSourceKey(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {allFundingSources.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name} ({formatCurrency(s.balance)})
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
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {allFundingSources.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name} ({formatCurrency(s.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Transfer Amount (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="5000.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Transfer Date *
                  </label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Description / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Transfer to Petty Cash, ATM Withdrawal"
                  value={transferTitle}
                  onChange={(e) => setTransferTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Slip number, reference, or reason..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? "Processing..." : "Complete Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Wallet Details & Transaction History Modal */}
      {viewingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewingWallet(null)} />
          <div className="relative w-full max-w-2xl bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: viewingWallet.color || "#6366F1" }}
                >
                  <WalletIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewingWallet.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{viewingWallet.type} wallet</p>
                </div>
              </div>
              <button
                onClick={() => setViewingWallet(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400">Current Balance</span>
                <p className="text-base font-black text-white mt-0.5">
                  {formatCurrency(viewingWallet.current_balance)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400">Opening Balance</span>
                <p className="text-sm font-semibold text-slate-300 mt-0.5">
                  {formatCurrency(viewingWallet.opening_balance)}
                </p>
              </div>
            </div>

            {/* Wallet History */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-indigo-400" /> Wallet Transactions History
              </h4>

              {walletTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/5">
                  No transactions recorded for this wallet yet.
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
                      {walletTransactions.map((t) => (
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
                onClick={() => setViewingWallet(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
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
            <h3 className="text-base font-bold text-white">Delete Wallet?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Are you sure you want to delete this wallet?
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
