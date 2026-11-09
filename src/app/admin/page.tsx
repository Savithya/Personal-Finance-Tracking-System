"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  Landmark,
  Wallet,
  Building2,
  ArrowLeftRight,
  PieChart,
  Target,
  Server,
  Layers,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminPanelPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>("admin");

  // Admin stats
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Full data for browsing
  const [fullData, setFullData] = useState<any>(null);
  const [activeBrowseTab, setActiveBrowseTab] = useState<
    "savingAccounts" | "wallets" | "deposits" | "transactions" | "budgets" | "savingGoals"
  >("transactions");

  // Reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check server-side authentication
  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.user || "admin");
          loadAdminStats();
          loadFullData();
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  const loadAdminStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (json.success && json.stats) {
        setStats(json.stats);
      }
    } catch (e) {
      console.error("Failed to load admin stats", e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadFullData = async () => {
    try {
      const res = await fetch("/api/admin/data?action=export");
      const json = await res.json();
      if (json.success && json.data) {
        setFullData(json.data);
      }
    } catch (e) {
      console.error("Failed to load full data", e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  // Export JSON Backup
  const handleExportJSON = async () => {
    try {
      const res = await fetch("/api/admin/data?action=export");
      const json = await res.json();
      if (!json.success) throw new Error("Export failed");

      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FINORA_Backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setActionMessage("Database backup exported successfully!");
      setTimeout(() => setActionMessage(""), 4000);
    } catch (e: any) {
      setActionError(e.message || "Failed to export backup");
    }
  };

  // Import JSON Backup
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Importing this backup will overwrite existing records. Proceed?")) {
      e.target.value = "";
      return;
    }

    setIsProcessing(true);
    setActionError("");

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", data: parsedData }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Import failed");

      setActionMessage("Database successfully restored from backup!");
      loadAdminStats();
      loadFullData();
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err: any) {
      setActionError(err.message || "Invalid JSON backup file");
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  // Safe Database Reset
  const handleConfirmReset = async () => {
    if (resetConfirmInput !== "CONFIRM RESET") {
      setActionError("Please type 'CONFIRM RESET' exactly to confirm.");
      return;
    }

    setIsProcessing(true);
    setActionError("");

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Reset failed");

      setActionMessage("All user transactions and records wiped. Categories and profile preserved.");
      setIsResetOpen(false);
      setResetConfirmInput("");
      loadAdminStats();
      loadFullData();
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err: any) {
      setActionError(err.message || "Reset failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  const rawRecords = fullData ? fullData[activeBrowseTab] || [] : [];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authenticated administrator controls, persistent SQLite database inspection, and data backup
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            Authenticated: {adminUser}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Admin Logout</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* System & Storage Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Database Engine</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-white">SQLite Persistent DB</div>
            <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              {stats?.dbFile || "data/finora.db"}
            </p>
            <p className="text-[10px] text-emerald-400 mt-0.5">
              Size: {stats?.dbSize ? `${(stats.dbSize / 1024).toFixed(1)} KB` : "Active"}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Transactions Stored</span>
            <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{stats?.txCount ?? "—"}</div>
            <p className="text-[11px] text-slate-400 mt-1">Manual real entries</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C111D] border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Accounts & Wallets</span>
            <Server className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {(stats?.accountsCount ?? 0) + (stats?.walletsCount ?? 0)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats?.accountsCount ?? 0} Savings Accounts • {stats?.walletsCount ?? 0} Wallets
            </p>
          </div>
        </div>
      </div>

      {/* Data Management & Backup Actions */}
      <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" /> Data Management & Backup Options
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex flex-col items-start gap-2 transition-all group text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Export Full JSON Backup</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download all accounts, deposits, transactions, and categories as portable JSON.
              </p>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex flex-col items-start gap-2 transition-all group text-left cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Restore from Backup</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload and restore a previous JSON backup file into the database.
              </p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={isProcessing}
              className="hidden"
            />
          </label>

          {/* Reset / Purge */}
          <button
            onClick={() => {
              setResetConfirmInput("");
              setIsResetOpen(true);
            }}
            className="p-4 rounded-2xl bg-rose-500/[0.03] hover:bg-rose-500/[0.07] border border-rose-500/10 flex flex-col items-start gap-2 transition-all group text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-400">Database Wipe / Reset</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Safely wipe transactions and start with clean empty states (protected).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Raw Stored Records Browser */}
      <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" /> Stored Database Records Browser
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inspect actual persistent records stored in the SQLite database
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
            {[
              { id: "transactions", label: "Transactions", count: stats?.txCount },
              { id: "savingAccounts", label: "Saving Accounts", count: stats?.accountsCount },
              { id: "wallets", label: "Wallets", count: stats?.walletsCount },
              { id: "deposits", label: "Deposits", count: stats?.depositsCount },
              { id: "budgets", label: "Budgets", count: stats?.budgetsCount },
              { id: "savingGoals", label: "Saving Goals", count: stats?.goalsCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveBrowseTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeBrowseTab === tab.id
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label} ({tab.count ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Records Display Table */}
        {rawRecords.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 bg-white/[0.01] rounded-2xl border border-white/5">
            No records in this table currently.
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 overflow-x-auto touch-scroll max-h-96">
            <table className="w-full text-left text-xs font-mono min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-semibold">
                  {Object.keys(rawRecords[0] || {}).map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-[11px]">
                {rawRecords.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    {Object.keys(rawRecords[0] || {}).map((col) => (
                      <td key={col} className="py-2 px-3 whitespace-nowrap max-w-xs truncate">
                        {typeof row[col] === "number" && (col.includes("amount") || col.includes("balance") || col.includes("interest"))
                          ? formatCurrency(row[col])
                          : String(row[col] ?? "null")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wipe / Reset Modal Confirmation */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsResetOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-rose-500/30 rounded-3xl shadow-2xl p-4 sm:p-6 z-10 text-center animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Confirm Full Database Reset</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
              This action will completely wipe all transactions, accounts, wallets, deposits, budgets, and goals from the SQLite database.
            </p>

            <div className="mb-4 text-left">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Type <span className="font-mono text-rose-400 font-bold">CONFIRM RESET</span> to authorize:
              </label>
              <input
                type="text"
                placeholder="CONFIRM RESET"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-rose-500/30 text-white font-mono text-xs focus:outline-none focus:border-rose-500 text-center uppercase"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsResetOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmInput !== "CONFIRM RESET" || isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                {isProcessing ? "Wiping..." : "Execute Wipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
