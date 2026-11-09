// FINORA - Pure Real Data Architecture (No Mock Data)
import { UserProfile, SavingAccount, Wallet, Category, Transaction, Budget, SavingsGoal } from "@/types";

export const DEMO_USER: UserProfile = {
  id: "user-primary",
  full_name: "Financial User",
  email: "user@finora.lk",
  username: "finora_user",
  phone: "+94 77 123 4567",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  currency: "LKR",
  currency_symbol: "Rs.",
  currencySymbol: "Rs.",
  timezone: "Asia/Colombo",
  date_format: "DD/MM/YYYY",
  theme: "dark",
  monthly_savings_target: 25000,
  created_at: "2026-01-01T00:00:00Z",
};

export const INITIAL_ACCOUNTS: SavingAccount[] = [];
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];
export const INITIAL_RECURRING: any[] = [];
export const INITIAL_NOTIFICATIONS: any[] = [];
export const INITIAL_INSIGHTS: any[] = [];
