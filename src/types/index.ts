// FINORA – Core Type Definitions

export type AccountType = 'regular' | 'high_yield' | 'fixed_term' | 'senior' | 'youth' | 'other';

export interface SavingAccount {
  id: string;
  name: string;
  bank_name: string;
  account_type: string;
  account_number?: string;
  opening_balance: number;
  current_balance: number;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  name: string;
  bank_name: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  period_months: number;
  expected_interest: number;
  expected_maturity_amount: number;
  status: 'active' | 'matured';
  notes?: string;
  source_account_id?: string;
  created_at: string;
  updated_at: string;
}

export type WalletType = 'cash' | 'bank' | 'digital' | 'personal' | 'other';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  opening_balance: number;
  current_balance: number;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// Kept for backward compatibility
export type Account = SavingAccount;

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_custom: boolean | number;
  created_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'cheque' | 'other';

export interface Transaction {
  id: string;
  user_id?: string;
  title: string;
  type: TransactionType;
  amount: number;
  category_id?: string | null;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  account_id: string;
  account_name?: string;
  account_type: 'saving_account' | 'wallet';
  to_account_id?: string | null;
  to_account_name?: string | null;
  to_account_type?: 'saving_account' | 'wallet' | null;
  date: string; // YYYY-MM-DD
  payment_method: string;
  description?: string;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  amount: number; // Allocated budget limit
  spent?: number;  // Authoritative computed spent amount
  remaining?: number;
  month: number;   // 1 - 12
  year: number;    // e.g. 2026
  created_at: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  starting_date: string; // YYYY-MM-DD
  target_date: string; // YYYY-MM-DD
  description?: string | null;
  color: string;
  icon: string;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  account_id?: string | null;
  account_type?: 'saving_account' | 'wallet' | null;
  amount: number;
  date: string;
  notes?: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone?: string;
  avatar_url?: string;
  currency: string;
  currency_symbol: string;
  currencySymbol?: string;
  timezone: string;
  date_format: string;
  theme: 'dark' | 'light' | 'system';
  monthly_savings_target: number;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalSavingAccountsBalance: number;
  totalWalletsBalance: number;
  totalDepositsBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number; // percentage
  currencySymbol: string;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}
