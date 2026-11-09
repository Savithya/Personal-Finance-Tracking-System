"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  SavingAccount,
  Wallet,
  Deposit,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  SavingsContribution,
  UserProfile,
  FinancialSummary,
} from "@/types";
import { calculateFinancialSummary } from "@/lib/calculations";

interface FinanceContextType {
  user: UserProfile;
  savingAccounts: SavingAccount[];
  wallets: Wallet[];
  deposits: Deposit[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals: SavingsGoal[];
  savingContributions: SavingsContribution[];
  summary: FinancialSummary;
  categoriesMap: Map<string, { name: string; color: string; icon: string }>;
  accountsMap: Map<string, { name: string; type: "saving_account" | "wallet"; balance: number }>;

  selectedYear: number;
  selectedMonth: number;
  setSelectedPeriod: (year: number, month: number) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Actions
  addTransaction: (tx: any) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>;

  addSavingAccount: (account: any) => Promise<{ success: boolean; error?: string }>;
  updateSavingAccount: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteSavingAccount: (id: string) => Promise<{ success: boolean; error?: string }>;

  addWallet: (wallet: any) => Promise<{ success: boolean; error?: string }>;
  updateWallet: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteWallet: (id: string) => Promise<{ success: boolean; error?: string }>;

  transferFunds: (params: {
    fromAccountId: string;
    fromAccountType: "saving_account" | "wallet";
    toAccountId: string;
    toAccountType: "saving_account" | "wallet";
    amount: number;
    title: string;
    date: string;
    paymentMethod?: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  addDeposit: (deposit: any) => Promise<{ success: boolean; error?: string }>;
  updateDeposit: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteDeposit: (id: string) => Promise<{ success: boolean; error?: string }>;

  addBudget: (budget: any) => Promise<{ success: boolean; error?: string }>;
  updateBudget: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteBudget: (id: string) => Promise<{ success: boolean; error?: string }>;

  addSavingGoal: (goal: any) => Promise<{ success: boolean; error?: string }>;
  updateSavingGoal: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteSavingGoal: (id: string) => Promise<{ success: boolean; error?: string }>;
  contributeToGoal: (params: {
    goalId: string;
    amount: number;
    sourceAccountId?: string;
    sourceAccountType?: "saving_account" | "wallet";
    date: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  addCategory: (category: any) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string, replacementCategoryId?: string) => Promise<{ success: boolean; error?: string }>;

  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;

  // Modals state
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  quickAddDefaultType: "income" | "expense" | "transfer";
  setQuickAddDefaultType: (type: "income" | "expense" | "transfer") => void;

  // Backwards compatibility aliases
  accounts: SavingAccount[];
  addAccount: (acc: any) => any;
  updateAccount: (id: string, updates: any) => any;
  deleteAccount: (id: string) => any;
  notifications: any[];
  markAllNotificationsRead: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  isSearchOpen: boolean;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const DEFAULT_USER: UserProfile = {
  id: "user-primary",
  full_name: "Financial User",
  email: "user@finora.lk",
  username: "finora_user",
  phone: "+94 77 123 4567",
  currency: "LKR",
  currency_symbol: "Rs.",
  timezone: "Asia/Colombo",
  date_format: "DD/MM/YYYY",
  theme: "dark",
  monthly_savings_target: 25000,
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [savingAccounts, setSavingAccounts] = useState<SavingAccount[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingsGoal[]>([]);
  const [savingContributions, setSavingContributions] = useState<SavingsContribution[]>([]);

  // Current view period (Colombo timezone)
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<"income" | "expense" | "transfer">("expense");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const applyServerData = useCallback((data: any) => {
    if (!data) return;
    if (data.user) setUser(data.user);
    if (Array.isArray(data.savingAccounts)) setSavingAccounts(data.savingAccounts);
    if (Array.isArray(data.wallets)) setWallets(data.wallets);
    if (Array.isArray(data.deposits)) setDeposits(data.deposits);
    if (Array.isArray(data.categories)) setCategories(data.categories);
    if (Array.isArray(data.transactions)) setTransactions(data.transactions);
    if (Array.isArray(data.budgets)) setBudgets(data.budgets);
    if (Array.isArray(data.savingGoals)) setSavingGoals(data.savingGoals);
    if (Array.isArray(data.savingContributions)) setSavingContributions(data.savingContributions);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/finance");
      const json = await res.json();
      if (json.success && json.data) {
        applyServerData(json.data);
      }
    } catch (err) {
      console.error("Failed to load financial data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [applyServerData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Central dispatch for database mutations
  const executeMutation = async (action: string, payload: any) => {
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data) {
          applyServerData(json.data);
        }
        return { success: true };
      } else {
        return { success: false, error: json.error || "Operation failed" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network request failed" };
    }
  };

  // Transactions
  const addTransaction = async (tx: any) => executeMutation("create_transaction", tx);
  const updateTransaction = async (id: string, updates: any) =>
    executeMutation("update_transaction", { id, updates });
  const deleteTransaction = async (id: string) => executeMutation("delete_transaction", { id });

  // Saving Accounts
  const addSavingAccount = async (account: any) => executeMutation("create_saving_account", account);
  const updateSavingAccount = async (id: string, updates: any) =>
    executeMutation("update_saving_account", { id, updates });
  const deleteSavingAccount = async (id: string) => executeMutation("delete_saving_account", { id });

  // Wallets
  const addWallet = async (wallet: any) => executeMutation("create_wallet", wallet);
  const updateWallet = async (id: string, updates: any) => executeMutation("update_wallet", { id, updates });
  const deleteWallet = async (id: string) => executeMutation("delete_wallet", { id });

  // Transfers between wallets and accounts
  const transferFunds = async (params: {
    fromAccountId: string;
    fromAccountType: "saving_account" | "wallet";
    toAccountId: string;
    toAccountType: "saving_account" | "wallet";
    amount: number;
    title: string;
    date: string;
    paymentMethod?: string;
    notes?: string;
  }) => {
    return executeMutation("create_transaction", {
      title: params.title || "Fund Transfer",
      type: "transfer",
      amount: params.amount,
      account_id: params.fromAccountId,
      account_type: params.fromAccountType,
      to_account_id: params.toAccountId,
      to_account_type: params.toAccountType,
      date: params.date,
      payment_method: params.paymentMethod || "bank_transfer",
      description: `Transfer from ${params.fromAccountType} to ${params.toAccountType}`,
      notes: params.notes || "",
    });
  };

  // Deposits
  const addDeposit = async (deposit: any) => executeMutation("create_deposit", deposit);
  const updateDeposit = async (id: string, updates: any) =>
    executeMutation("update_deposit", { id, updates });
  const deleteDeposit = async (id: string) => executeMutation("delete_deposit", { id });

  // Budgets
  const addBudget = async (budget: any) => executeMutation("create_budget", budget);
  const updateBudget = async (id: string, updates: any) => executeMutation("update_budget", { id, updates });
  const deleteBudget = async (id: string) => executeMutation("delete_budget", { id });

  // Saving Goals
  const addSavingGoal = async (goal: any) => executeMutation("create_goal", goal);
  const updateSavingGoal = async (id: string, updates: any) => executeMutation("update_goal", { id, updates });
  const deleteSavingGoal = async (id: string) => executeMutation("delete_goal", { id });
  const contributeToGoal = async (params: {
    goalId: string;
    amount: number;
    sourceAccountId?: string;
    sourceAccountType?: "saving_account" | "wallet";
    date: string;
    notes?: string;
  }) => {
    return executeMutation("add_goal_contribution", {
      goal_id: params.goalId,
      amount: params.amount,
      account_id: params.sourceAccountId || null,
      account_type: params.sourceAccountType || null,
      date: params.date,
      notes: params.notes || "",
    });
  };

  // Categories
  const addCategory = async (category: any) => executeMutation("create_category", category);
  const updateCategory = async (id: string, updates: any) =>
    executeMutation("update_category", { id, updates });
  const deleteCategory = async (id: string, replacementCategoryId?: string) =>
    executeMutation("delete_category", { id, replacementCategoryId });

  // Profile
  const updateUserProfile = async (updates: Partial<UserProfile>) =>
    executeMutation("update_profile", updates);

  // Cached lookup maps for instant lookups
  const categoriesMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string; icon: string }>();
    for (const c of categories) {
      map.set(c.id, { name: c.name, color: c.color, icon: c.icon });
    }
    return map;
  }, [categories]);

  const accountsMap = useMemo(() => {
    const map = new Map<string, { name: string; type: "saving_account" | "wallet"; balance: number }>();
    for (const sa of savingAccounts) {
      map.set(sa.id, { name: sa.name, type: "saving_account", balance: Number(sa.current_balance) || 0 });
    }
    for (const w of wallets) {
      map.set(w.id, { name: w.name, type: "wallet", balance: Number(w.current_balance) || 0 });
    }
    return map;
  }, [savingAccounts, wallets]);

  // Authoritative financial summary calculation
  const summary = useMemo(() => {
    return calculateFinancialSummary(
      savingAccounts,
      wallets,
      deposits,
      transactions,
      selectedYear,
      selectedMonth,
      user.currency_symbol || "Rs."
    );
  }, [savingAccounts, wallets, deposits, transactions, selectedYear, selectedMonth, user.currency_symbol]);

  const setSelectedPeriod = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        savingAccounts,
        wallets,
        deposits,
        categories,
        transactions,
        budgets,
        savingGoals,
        savingContributions,
        summary,
        categoriesMap,
        accountsMap,

        selectedYear,
        selectedMonth,
        setSelectedPeriod,
        isLoading,
        refreshData,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addSavingAccount,
        updateSavingAccount,
        deleteSavingAccount,

        addWallet,
        updateWallet,
        deleteWallet,
        transferFunds,

        addDeposit,
        updateDeposit,
        deleteDeposit,

        addBudget,
        updateBudget,
        deleteBudget,

        addSavingGoal,
        updateSavingGoal,
        deleteSavingGoal,
        contributeToGoal,

        addCategory,
        updateCategory,
        deleteCategory,

        updateUserProfile,

        isQuickAddOpen,
        openQuickAdd: () => setIsQuickAddOpen(true),
        closeQuickAdd: () => setIsQuickAddOpen(false),
        quickAddDefaultType,
        setQuickAddDefaultType,

        accounts: savingAccounts,
        addAccount: addSavingAccount,
        updateAccount: updateSavingAccount,
        deleteAccount: deleteSavingAccount,
        notifications: [],
        markAllNotificationsRead: () => {},
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        isSearchOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
