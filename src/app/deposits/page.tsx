"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Percent,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Coins,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { Deposit } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const SRI_LANKAN_INSTITUTIONS = [
  "Commercial Bank of Ceylon",
  "Bank of Ceylon (BOC)",
  "Sampath Bank",
  "Hatton National Bank (HNB)",
  "National Development Bank (NDB)",
  "Seylan Bank",
  "Nations Trust Bank (NTB)",
  "People's Bank",
  "National Savings Bank (NSB)",
  "DFCC Bank",
  "LB Finance",
  "Central Finance",
  "Singer Finance",
  "Citizens Development Business (CDB)",
  "Vallibel Finance",
  "Other Institution",
];

export default function DepositsPage() {
  const { deposits, savingAccounts, wallets, addDeposit, updateDeposit, deleteDeposit } = useFinance();

  const [activeTab, setActiveTab] = useState<"all" | "active" | "matured">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [viewingDeposit, setViewingDeposit] = useState<Deposit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState(SRI_LANKAN_INSTITUTIONS[0]);
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("10.5");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [periodMonths, setPeriodMonths] = useState("12");
  const [maturityDate, setMaturityDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [status, setStatus] = useState<"active" | "matured">("active");
  const [notes, setNotes] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate maturity date when start date or period months change
  const handlePeriodChange = (monthsStr: string) => {
    setPeriodMonths(monthsStr);
    const m = parseInt(monthsStr, 10);
    if (!isNaN(m) && m > 0 && startDate) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + m);
      setMaturityDate(d.toISOString().split("T")[0]);
    }
  };

  const handleStartDateChange = (dateStr: string) => {
    setStartDate(dateStr);
    const m = parseInt(periodMonths, 10);
    if (!isNaN(m) && m > 0 && dateStr) {
      const d = new Date(dateStr);
      d.setMonth(d.getMonth() + m);
      setMaturityDate(d.toISOString().split("T")[0]);
    }
  };

  // Live calculation of interest and maturity amount
  const liveCalculation = useMemo(() => {
    const p = parseFloat(amount) || 0;
    const r = parseFloat(interestRate) || 0;
    const m = parseInt(periodMonths, 10) || 12;

    const expectedInterest = Math.round((p * (r / 100) * (m / 12)) * 100) / 100;
    const expectedMaturityAmount = Math.round((p + expectedInterest) * 100) / 100;

    return { expectedInterest, expectedMaturityAmount };
  }, [amount, interestRate, periodMonths]);

  // Combined sources
  const fundingSources = [
    ...savingAccounts.map((a) => ({ id: a.id, type: "saving_account" as const, name: `Account: ${a.name}` })),
    ...wallets.map((w) => ({ id: w.id, type: "wallet" as const, name: `Wallet: ${w.name}` })),
  ];

  const resetForm = () => {
    setName("");
    setBankName(SRI_LANKAN_INSTITUTIONS[0]);
    setAmount("");
    setInterestRate("10.5");
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setPeriodMonths("12");
    const mat = new Date();
    mat.setFullYear(mat.getFullYear() + 1);
    setMaturityDate(mat.toISOString().split("T")[0]);
    setStatus("active");
    setNotes("");
    setSourceAccountId("");
    setFormError("");
    setFormSuccess("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (dep: Deposit) => {
    setEditingDeposit(dep);
    setName(dep.name);
    setBankName(dep.bank_name);
    setAmount(String(dep.amount));
    setInterestRate(String(dep.interest_rate));
    setStartDate(dep.start_date);
    setPeriodMonths(String(dep.period_months));
    setMaturityDate(dep.maturity_date);
    setStatus(dep.status);
    setNotes(dep.notes || "");
    setFormError("");
  };

  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Deposit name is required.");
      return;
    }

    const p = parseFloat(amount);
    if (isNaN(p) || p <= 0) {
      setFormError("Deposit principal amount must be greater than Rs. 0.00");
      return;
    }

    const r = parseFloat(interestRate);
    if (isNaN(r) || r < 0) {
      setFormError("Interest rate must be 0% or higher.");
      return;
    }

    const m = parseInt(periodMonths, 10);
    if (isNaN(m) || m <= 0) {
      setFormError("Deposit period in months must be at least 1 month.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingDeposit) {
        const res = await updateDeposit(editingDeposit.id, {
          name: name.trim(),
          bank_name: bankName,
          amount: p,
          interest_rate: r,
          start_date: startDate,
          maturity_date: maturityDate,
          period_months: m,
          status,
          notes: notes.trim(),
        });

        if (!res.success) {
          setFormError(res.error || "Failed to update deposit");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Deposit updated successfully!");
        setTimeout(() => {
          setEditingDeposit(null);
          resetForm();
        }, 600);
      } else {
        const selectedSource = fundingSources.find((s) => s.id === sourceAccountId);

        const res = await addDeposit({
          name: name.trim(),
          bank_name: bankName,
          amount: p,
          interest_rate: r,
          start_date: startDate,
          maturity_date: maturityDate,
          period_months: m,
          status,
          notes: notes.trim(),
          source_account_id: sourceAccountId || undefined,
          source_account_type: selectedSource?.type,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to save deposit");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Deposit saved successfully!");
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
      await deleteDeposit(id);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalPrincipal = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const activeDeposits = deposits.filter((d) => d.status === "active");
    const activePrincipal = activeDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const totalExpectedInterest = deposits.reduce((sum, d) => sum + (Number(d.expected_interest) || 0), 0);
    const totalMaturityValue = deposits.reduce((sum, d) => sum + (Number(d.expected_maturity_amount) || 0), 0);

    return {
      totalPrincipal,
      activePrincipal,
      totalExpectedInterest,
      totalMaturityValue,
      activeCount: activeDeposits.length,
      maturedCount: deposits.filter((d) => d.status === "matured").length,
    };
  }, [deposits]);

  const filteredDeposits = deposits.filter((d) => {
    if (activeTab === "active") return d.status === "active";
    if (activeTab === "matured") return d.status === "matured";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Deposits Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your real Sri Lankan fixed deposits, expected interest and maturity schedules
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Deposit</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active Principal</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatCurrency(stats.activePrincipal)}
            </div>
            <p className="text-[11px] text-cyan-400/90 mt-1">{stats.activeCount} active deposit(s)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Expected Total Interest</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              +{formatCurrency(stats.totalExpectedInterest)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Calculated interest yield</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Maturity Value</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatCurrency(stats.totalMaturityValue)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Principal + Expected Interest</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Status Summary</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <span className="text-lg font-bold text-cyan-400">{stats.activeCount}</span>
              <p className="text-[10px] text-slate-400 uppercase">Active</p>
            </div>
            <span className="text-slate-600 font-bold">•</span>
            <div>
              <span className="text-lg font-bold text-slate-300">{stats.maturedCount}</span>
              <p className="text-[10px] text-slate-400 uppercase">Matured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "all"
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          All Deposits ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "active"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Active ({stats.activeCount})
        </button>
        <button
          onClick={() => setActiveTab("matured")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "matured"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Matured ({stats.maturedCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredDeposits.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No deposits found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Record your actual fixed deposits or special deposit accounts in Sri Lankan banks and institutions to track your maturity returns.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-cyan-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Deposit</span>
          </button>
        </div>
      ) : (
        /* Deposits Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDeposits.map((dep) => {
            const isMatured = dep.status === "matured";

            return (
              <div
                key={dep.id}
                className="rounded-2xl bg-[#0C111D] border border-white/5 p-5 hover:border-white/10 transition-all hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-md">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {dep.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{dep.bank_name}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isMatured
                          ? "bg-slate-500/20 text-slate-300"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {dep.status}
                    </span>
                  </div>

                  {/* Financial Stats */}
                  <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Principal Amount:</span>
                      <span className="text-base font-black text-white">{formatCurrency(dep.amount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Interest Rate:</span>
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        <Percent className="h-3 w-3" /> {dep.interest_rate}% p.a.
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Period:</span>
                      <span className="font-medium text-slate-300">{dep.period_months} Months</span>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-baseline justify-between">
                      <span className="text-xs text-emerald-400/90 font-medium">Expected Interest:</span>
                      <span className="text-xs font-bold text-emerald-400">
                        +{formatCurrency(dep.expected_interest)}
                      </span>
                    </div>

                    <div className="pt-1.5 flex items-baseline justify-between">
                      <span className="text-xs text-slate-300 font-bold">Maturity Value:</span>
                      <span className="text-sm font-black text-white">
                        {formatCurrency(dep.expected_maturity_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/[0.01] border border-white/5">
                      <span className="text-slate-500 block text-[9px] uppercase">Start Date</span>
                      <span className="font-semibold text-slate-300">{formatDate(dep.start_date, "short")}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.01] border border-white/5">
                      <span className="text-slate-500 block text-[9px] uppercase">Maturity Date</span>
                      <span className="font-semibold text-cyan-300">{formatDate(dep.maturity_date, "short")}</span>
                    </div>
                  </div>

                  {dep.notes && (
                    <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 italic">"{dep.notes}"</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Added {formatDate(dep.created_at, "short")}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingDeposit(dep)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(dep)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit deposit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(dep.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete deposit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddOpen || editingDeposit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => {
              setIsAddOpen(false);
              setEditingDeposit(null);
            }}
          />

          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingDeposit ? "Edit Deposit Record" : "Add Fixed Deposit"}
                </h2>
                <p className="text-xs text-slate-400">
                  Auto-calculates expected interest and maturity amount in Sri Lankan Rupees
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingDeposit(null);
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
              <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Deposit Name / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Commercial Bank 1-Year FD, BOC Special Deposit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Bank / Financial Institution *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {SRI_LANKAN_INSTITUTIONS.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Principal Amount (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="100000.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Interest Rate (% per annum) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="10.50"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      required
                      className="w-full pr-8 pl-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Period (Months) *
                  </label>
                  <select
                    value={periodMonths}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                    <option value="60">60 Months (5 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Maturity Date *
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Automatic Calculation Preview Box */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  Automatic Calculation Preview
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expected Interest:</span>
                    <span className="font-bold text-emerald-400">
                      +{formatCurrency(liveCalculation.expectedInterest)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Maturity Amount:</span>
                    <span className="font-black text-white">
                      {formatCurrency(liveCalculation.expectedMaturityAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {!editingDeposit && fundingSources.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Deduct Principal From Account/Wallet (Optional)
                  </label>
                  <select
                    value={sourceAccountId}
                    onChange={(e) => setSourceAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">None (Already deposited / external funding)</option>
                    {fundingSources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Deposit Status
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("active")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      status === "active"
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm"
                        : "border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("matured")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      status === "matured"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                        : "border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    Matured
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="FD certificate number, rollover instructions, branch details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingDeposit(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-cyan-600/20"
                >
                  {isSubmitting ? "Saving..." : editingDeposit ? "Update Deposit" : "Save Deposit"}
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
            <h3 className="text-base font-bold text-white">Delete Deposit?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Are you sure you want to delete this deposit record? This will remove all associated maturity calculation records.
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

      {/* View Deposit Details Modal */}
      {viewingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewingDeposit(null)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">{viewingDeposit.name}</h3>
                <p className="text-xs text-slate-400">{viewingDeposit.bank_name}</p>
              </div>
              <button
                onClick={() => setViewingDeposit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 my-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400">Principal Amount:</span>
                <span className="text-base font-black text-white">{formatCurrency(viewingDeposit.amount)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400">Interest Rate:</span>
                <span className="text-sm font-bold text-cyan-400">{viewingDeposit.interest_rate}% p.a.</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400">Expected Interest:</span>
                <span className="text-sm font-bold text-emerald-400">
                  +{formatCurrency(viewingDeposit.expected_interest)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400">Maturity Value:</span>
                <span className="text-base font-black text-white">
                  {formatCurrency(viewingDeposit.expected_maturity_amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-500 block text-[10px] uppercase">Start Date</span>
                  <span className="font-semibold text-slate-300">{formatDate(viewingDeposit.start_date)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-500 block text-[10px] uppercase">Maturity Date</span>
                  <span className="font-semibold text-cyan-300">{formatDate(viewingDeposit.maturity_date)}</span>
                </div>
              </div>

              {viewingDeposit.notes && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Notes</span>
                  {viewingDeposit.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setViewingDeposit(null)}
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
