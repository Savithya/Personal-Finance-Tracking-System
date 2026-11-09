"use client";

import React, { useState } from "react";
import {
  Target,
  Plus,
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  History,
  TrendingUp,
  ShieldCheck,
  Laptop,
  Car,
  GraduationCap,
  Plane,
  HeartHandshake,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { SavingsGoal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const GOAL_ICONS: { [key: string]: any } = {
  target: Target,
  laptop: Laptop,
  car: Car,
  education: GraduationCap,
  travel: Plane,
  savings: Coins,
  emergency: ShieldCheck,
};

const GOAL_COLORS = [
  "#10B981", "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1",
  "#8B5CF6", "#EC4899", "#F59E0B",
];

export default function SavingGoalsPage() {
  const {
    savingGoals,
    savingContributions,
    savingAccounts,
    wallets,
    addSavingGoal,
    updateSavingGoal,
    deleteSavingGoal,
    contributeToGoal,
  } = useFinance();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributeGoalItem, setContributeGoalItem] = useState<SavingsGoal | null>(null);
  const [viewHistoryGoal, setViewHistoryGoal] = useState<SavingsGoal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [startingDate, setStartingDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [icon, setIcon] = useState("target");

  // Contribution Form Fields
  const [contribAmount, setContribAmount] = useState("");
  const [contribSourceKey, setContribSourceKey] = useState("");
  const [contribDate, setContribDate] = useState(new Date().toISOString().split("T")[0]);
  const [contribNotes, setContribNotes] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified funding sources
  const allSources = [
    ...savingAccounts.map((a) => ({
      key: `saving_account:${a.id}`,
      name: `Account: ${a.name} (${formatCurrency(a.current_balance)})`,
    })),
    ...wallets.map((w) => ({
      key: `wallet:${w.id}`,
      name: `Wallet: ${w.name} (${formatCurrency(w.current_balance)})`,
    })),
  ];

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setStartingDate(new Date().toISOString().split("T")[0]);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setTargetDate(d.toISOString().split("T")[0]);
    setDescription("");
    setColor(GOAL_COLORS[0]);
    setIcon("target");
    setFormError("");
    setFormSuccess("");
    setEditingGoal(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(String(g.target_amount));
    setCurrentAmount(String(g.current_amount));
    setStartingDate(g.starting_date);
    setTargetDate(g.target_date);
    setDescription(g.description || "");
    setColor(g.color || GOAL_COLORS[0]);
    setIcon(g.icon || "target");
    setFormError("");
    setIsAddOpen(true);
  };

  const handleOpenContribute = (g: SavingsGoal) => {
    setContributeGoalItem(g);
    setContribAmount("");
    if (allSources.length > 0) setContribSourceKey(allSources[0].key);
    setContribDate(new Date().toISOString().split("T")[0]);
    setContribNotes("");
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Goal name is required.");
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setFormError("Target amount must be greater than Rs. 0.00");
      return;
    }

    const current = parseFloat(currentAmount) || 0;
    if (current < 0) {
      setFormError("Current amount cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingGoal) {
        const res = await updateSavingGoal(editingGoal.id, {
          name: name.trim(),
          target_amount: target,
          current_amount: current,
          starting_date: startingDate,
          target_date: targetDate,
          description: description.trim(),
          color,
          icon,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to update saving goal");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Goal updated successfully!");
        setTimeout(() => {
          setIsAddOpen(false);
          resetForm();
        }, 600);
      } else {
        const res = await addSavingGoal({
          name: name.trim(),
          target_amount: target,
          current_amount: current,
          starting_date: startingDate,
          target_date: targetDate,
          description: description.trim(),
          color,
          icon,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to create saving goal");
          setIsSubmitting(false);
          return;
        }

        setFormSuccess("Saving goal created successfully!");
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

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalItem) return;

    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Contribution amount must be greater than Rs. 0.00");
      return;
    }

    setIsSubmitting(true);

    let srcAccId: string | undefined = undefined;
    let srcAccType: "saving_account" | "wallet" | undefined = undefined;

    if (contribSourceKey) {
      const [type, id] = contribSourceKey.split(":");
      srcAccType = type as "saving_account" | "wallet";
      srcAccId = id;
    }

    try {
      const res = await contributeToGoal({
        goalId: contributeGoalItem.id,
        amount: amt,
        sourceAccountId: srcAccId,
        sourceAccountType: srcAccType,
        date: contribDate,
        notes: contribNotes.trim(),
      });

      if (!res.success) {
        setFormError(res.error || "Contribution failed");
        setIsSubmitting(false);
        return;
      }

      setFormSuccess("Contribution added successfully!");
      setTimeout(() => {
        setContributeGoalItem(null);
        setContribAmount("");
      }, 600);
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavingGoal(id);
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  // KPI calculations
  const totalTarget = savingGoals.reduce((sum, g) => sum + (Number(g.target_amount) || 0), 0);
  const totalSaved = savingGoals.reduce((sum, g) => sum + (Number(g.current_amount) || 0), 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Contributions for viewing goal
  const goalContributions = viewHistoryGoal
    ? savingContributions.filter((sc) => sc.goal_id === viewHistoryGoal.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Saving Goals</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plan, fund, and track your milestone savings goals in Sri Lankan Rupees
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Saving Goal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Goals Target</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(totalTarget)}</div>
            <p className="text-[11px] text-slate-400 mt-1">{savingGoals.length} milestone goal(s)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Saved So Far</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrency(totalSaved)}</div>
            <p className="text-[11px] text-slate-400 mt-1">Accumulated contributions</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Remaining to Target</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(totalRemaining)}</div>
            <p className="text-[11px] text-slate-400 mt-1">To reach 100% of goals</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Overall Progress</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-white">{overallProgress}%</span>
              <span className="text-xs text-slate-400">average</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, overallProgress)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {savingGoals.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No saving goals yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Create financial milestones like buying a laptop, purchasing a vehicle, emergency fund, or travel savings.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Saving Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingGoals.map((g) => {
            const current = Number(g.current_amount) || 0;
            const target = Number(g.target_amount) || 1;
            const remaining = Math.max(0, target - current);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = g.status === "completed" || current >= target;

            const IconComponent = GOAL_ICONS[g.icon] || Target;

            return (
              <div
                key={g.id}
                className="rounded-2xl bg-[#0C111D] border border-white/5 p-5 hover:border-white/10 transition-all hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{ backgroundColor: g.color || "#10B981" }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {g.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">Target: {formatDate(g.target_date, "short")}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  {/* Progress Metric Box */}
                  <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Saved Amount:</span>
                      <span className="font-black text-emerald-400 text-sm">{formatCurrency(current)}</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Target Amount:</span>
                      <span className="font-bold text-white">{formatCurrency(target)}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-baseline justify-between text-xs">
                      <span className="text-slate-400 font-medium">Remaining:</span>
                      <span className="font-bold text-slate-300">{formatCurrency(remaining)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Completion</span>
                        <span className="font-bold text-emerald-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {g.description && (
                    <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 italic">"{g.description}"</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenContribute(g)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Contribute</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewHistoryGoal(g)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="View contributions history"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(g.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete goal"
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

      {/* Add / Edit Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingGoal ? "Edit Saving Goal" : "Create Saving Goal"}
                </h2>
                <p className="text-xs text-slate-400">
                  Set target amount and milestones in Sri Lankan Rupees
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
                  Goal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Buy a Laptop, Emergency Fund, Buy a Vehicle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target Amount (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="250000.00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Initial Saved Amount (LKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Starting Date *
                  </label>
                  <input
                    type="date"
                    value={startingDate}
                    onChange={(e) => setStartingDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Color & Icon */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Color Theme
                </label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map((c) => (
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

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Goal Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Notes on timeline, specifications, or monthly contribution plans..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setContributeGoalItem(null)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-emerald-400" />
                  Add Contribution
                </h2>
                <p className="text-xs text-slate-400">
                  Fund "{contributeGoalItem.name}" without counting as an expense
                </p>
              </div>
              <button
                onClick={() => setContributeGoalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
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

            <form onSubmit={handleContributeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Contribution Amount (LKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="10000.00"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Deduct from Account / Wallet (Optional)
                </label>
                <select
                  value={contribSourceKey}
                  onChange={(e) => setContribSourceKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">External funds / Do not deduct from balances</option>
                  {allSources.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Deducts from chosen balance as savings transfer; never counted as expense.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Contribution Date *
                </label>
                <input
                  type="date"
                  value={contribDate}
                  onChange={(e) => setContribDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Monthly salary contribution, Bonus savings"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setContributeGoalItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? "Adding..." : "Confirm Contribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Contributions History Modal */}
      {viewHistoryGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewHistoryGoal(null)} />
          <div className="relative w-full max-w-lg bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">{viewHistoryGoal.name}</h3>
                <p className="text-xs text-slate-400">Contribution History & Progress</p>
              </div>
              <button
                onClick={() => setViewHistoryGoal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4">
              {goalContributions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/5">
                  No contributions recorded for this goal yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {goalContributions.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">
                          +{formatCurrency(c.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(c.date, "short")}{c.notes ? ` • ${c.notes}` : ""}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                        Funded
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setViewHistoryGoal(null)}
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
            <h3 className="text-base font-bold text-white">Delete Saving Goal?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Are you sure you want to delete this saving goal? Associated contribution logs will also be removed.
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
