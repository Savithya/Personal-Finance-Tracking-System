import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel ? path.join("/tmp", "data") : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "finora.db");

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (isVercel && !fs.existsSync(DB_FILE)) {
    const seedPath = path.join(process.cwd(), "data", "finora.db");
    if (fs.existsSync(seedPath)) {
      try {
        fs.copyFileSync(seedPath, DB_FILE);
      } catch (err) {
        console.warn("Could not copy seed database, initializing new:", err);
      }
    }
  }

  const db = new DatabaseSync(DB_FILE);
  dbInstance = db;

  // Initialize Schema
  initSchema(db);

  return db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      username TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      currency TEXT DEFAULT 'LKR',
      currency_symbol TEXT DEFAULT 'Rs.',
      timezone TEXT DEFAULT 'Asia/Colombo',
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      theme TEXT DEFAULT 'dark',
      monthly_savings_target REAL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saving_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      account_number TEXT,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      description TEXT,
      color TEXT DEFAULT '#10B981',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      start_date TEXT NOT NULL,
      maturity_date TEXT NOT NULL,
      period_months INTEGER NOT NULL,
      expected_interest REAL NOT NULL,
      expected_maturity_amount REAL NOT NULL,
      status TEXT DEFAULT 'active',
      notes TEXT,
      source_account_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      color TEXT DEFAULT '#6366F1',
      icon TEXT DEFAULT 'wallet',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT DEFAULT 'tag',
      color TEXT DEFAULT '#6366F1',
      is_custom INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id TEXT,
      account_id TEXT NOT NULL,
      account_type TEXT NOT NULL,
      to_account_id TEXT,
      to_account_type TEXT,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      description TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saving_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      starting_date TEXT NOT NULL,
      target_date TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#10B981',
      icon TEXT DEFAULT 'target',
      status TEXT DEFAULT 'in_progress',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saving_contributions (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      account_id TEXT,
      account_type TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  // Default Categories if empty
  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (!catCount || catCount.count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, type, icon, color, is_custom, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultIncomeCats = [
      { id: "cat-inc-1", name: "Salary", icon: "wallet", color: "#10B981" },
      { id: "cat-inc-2", name: "Freelance Income", icon: "laptop", color: "#06B6D4" },
      { id: "cat-inc-3", name: "Business Income", icon: "briefcase", color: "#3B82F6" },
      { id: "cat-inc-4", name: "Interest Income", icon: "trending-up", color: "#8B5CF6" },
      { id: "cat-inc-5", name: "Other Income", icon: "plus-circle", color: "#64748B" },
    ];

    const defaultExpenseCats = [
      { id: "cat-exp-1", name: "Food & Groceries", icon: "utensils", color: "#F59E0B" },
      { id: "cat-exp-2", name: "Transportation", icon: "car", color: "#EF4444" },
      { id: "cat-exp-3", name: "Education", icon: "graduation-cap", color: "#6366F1" },
      { id: "cat-exp-4", name: "Housing", icon: "home", color: "#8B5CF6" },
      { id: "cat-exp-5", name: "Electricity & Water", icon: "zap", color: "#F97316" },
      { id: "cat-exp-6", name: "Internet & Mobile", icon: "wifi", color: "#06B6D4" },
      { id: "cat-exp-7", name: "Healthcare", icon: "heart-pulse", color: "#EC4899" },
      { id: "cat-exp-8", name: "Shopping", icon: "shopping-bag", color: "#14B8A6" },
      { id: "cat-exp-9", name: "Entertainment", icon: "film", color: "#A855F7" },
      { id: "cat-exp-10", name: "Other Expenses", icon: "more-horizontal", color: "#64748B" },
    ];

    const now = new Date().toISOString();
    for (const c of defaultIncomeCats) {
      insertCat.run(c.id, c.name, "income", c.icon, c.color, 0, now);
    }
    for (const c of defaultExpenseCats) {
      insertCat.run(c.id, c.name, "expense", c.icon, c.color, 0, now);
    }
  }

  // Default User Profile if empty
  const profileCount = db.prepare("SELECT COUNT(*) as count FROM user_profile").get() as { count: number };
  if (!profileCount || profileCount.count === 0) {
    const insertProfile = db.prepare(`
      INSERT INTO user_profile (id, full_name, email, username, phone, currency, currency_symbol, timezone, date_format, theme, monthly_savings_target, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertProfile.run(
      "user-primary",
      "Financial User",
      "user@finora.lk",
      "finora_user",
      "+94 77 123 4567",
      "LKR",
      "Rs.",
      "Asia/Colombo",
      "DD/MM/YYYY",
      "dark",
      25000,
      new Date().toISOString()
    );
  }
}

// Data Retrieval
export function getFullFinancialState() {
  const db = getDatabase();

  const user = db.prepare("SELECT * FROM user_profile LIMIT 1").get() || {
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

  const savingAccounts = db.prepare("SELECT * FROM saving_accounts ORDER BY created_at DESC").all();
  const deposits = db.prepare("SELECT * FROM deposits ORDER BY created_at DESC").all();
  const wallets = db.prepare("SELECT * FROM wallets ORDER BY created_at DESC").all();
  const categories = db.prepare("SELECT * FROM categories ORDER BY type ASC, name ASC").all();
  const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC, created_at DESC").all();
  const budgets = db.prepare("SELECT * FROM budgets ORDER BY year DESC, month DESC").all();
  const savingGoals = db.prepare("SELECT * FROM saving_goals ORDER BY created_at DESC").all();
  const savingContributions = db.prepare("SELECT * FROM saving_contributions ORDER BY date DESC").all();

  return {
    user,
    savingAccounts,
    deposits,
    wallets,
    categories,
    transactions,
    budgets,
    savingGoals,
    savingContributions,
  };
}

// Balance Helpers
function adjustAccountOrWalletBalance(
  db: DatabaseSync,
  id: string,
  accountType: string,
  deltaAmount: number
) {
  if (accountType === "saving_account") {
    db.prepare(`
      UPDATE saving_accounts 
      SET current_balance = current_balance + ?, updated_at = ? 
      WHERE id = ?
    `).run(deltaAmount, new Date().toISOString(), id);
  } else {
    // wallet
    db.prepare(`
      UPDATE wallets 
      SET current_balance = current_balance + ?, updated_at = ? 
      WHERE id = ?
    `).run(deltaAmount, new Date().toISOString(), id);
  }
}

// Transaction Operations with strict balance calculations
export function createTransaction(data: {
  title: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category_id?: string | null;
  account_id: string;
  account_type: "saving_account" | "wallet";
  to_account_id?: string | null;
  to_account_type?: "saving_account" | "wallet" | null;
  date: string;
  payment_method: string;
  description?: string;
  notes?: string;
}) {
  const db = getDatabase();
  const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const amount = Number(data.amount);

  db.prepare(`
    INSERT INTO transactions (
      id, title, type, amount, category_id, account_id, account_type,
      to_account_id, to_account_type, date, payment_method, description, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.type,
    amount,
    data.category_id || null,
    data.account_id,
    data.account_type || "wallet",
    data.to_account_id || null,
    data.to_account_type || null,
    data.date,
    data.payment_method || "cash",
    data.description || "",
    data.notes || "",
    now,
    now
  );

  // Apply Balance Updates
  if (data.type === "income") {
    adjustAccountOrWalletBalance(db, data.account_id, data.account_type, amount);
  } else if (data.type === "expense") {
    adjustAccountOrWalletBalance(db, data.account_id, data.account_type, -amount);
  } else if (data.type === "transfer" && data.to_account_id) {
    // Deduct from source
    adjustAccountOrWalletBalance(db, data.account_id, data.account_type, -amount);
    // Add to destination
    adjustAccountOrWalletBalance(db, data.to_account_id, data.to_account_type || "wallet", amount);
  }

  return { id, ...data, created_at: now, updated_at: now };
}

export function updateTransaction(
  id: string,
  updates: {
    title?: string;
    type?: "income" | "expense" | "transfer";
    amount?: number;
    category_id?: string | null;
    account_id?: string;
    account_type?: "saving_account" | "wallet";
    to_account_id?: string | null;
    to_account_type?: "saving_account" | "wallet" | null;
    date?: string;
    payment_method?: string;
    description?: string;
    notes?: string;
  }
) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Transaction not found");

  // Revert old transaction balance impact
  const oldAmount = Number(existing.amount);
  if (existing.type === "income") {
    adjustAccountOrWalletBalance(db, existing.account_id, existing.account_type, -oldAmount);
  } else if (existing.type === "expense") {
    adjustAccountOrWalletBalance(db, existing.account_id, existing.account_type, oldAmount);
  } else if (existing.type === "transfer" && existing.to_account_id) {
    adjustAccountOrWalletBalance(db, existing.account_id, existing.account_type, oldAmount);
    adjustAccountOrWalletBalance(db, existing.to_account_id, existing.to_account_type || "wallet", -oldAmount);
  }

  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  const newAmount = Number(merged.amount);

  db.prepare(`
    UPDATE transactions SET
      title = ?, type = ?, amount = ?, category_id = ?, account_id = ?,
      account_type = ?, to_account_id = ?, to_account_type = ?, date = ?,
      payment_method = ?, description = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.title,
    merged.type,
    newAmount,
    merged.category_id || null,
    merged.account_id,
    merged.account_type,
    merged.to_account_id || null,
    merged.to_account_type || null,
    merged.date,
    merged.payment_method,
    merged.description || "",
    merged.notes || "",
    merged.updated_at,
    id
  );

  // Apply new transaction balance impact
  if (merged.type === "income") {
    adjustAccountOrWalletBalance(db, merged.account_id, merged.account_type, newAmount);
  } else if (merged.type === "expense") {
    adjustAccountOrWalletBalance(db, merged.account_id, merged.account_type, -newAmount);
  } else if (merged.type === "transfer" && merged.to_account_id) {
    adjustAccountOrWalletBalance(db, merged.account_id, merged.account_type, -newAmount);
    adjustAccountOrWalletBalance(db, merged.to_account_id, merged.to_account_type || "wallet", newAmount);
  }

  return merged;
}

export function deleteTransaction(id: string) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
  if (!existing) return;

  const amount = Number(existing.amount);
  // Revert balance impact
  if (existing.type === "income") {
    adjustAccountOrWalletBalance(db, existing.account_id, existing.account_type, -amount);
  } else if (existing.type === "expense") {
    adjustAccountOrWalletBalance(db, existing.account_id, existing.account_type, amount);
  } else if (existing.type === "transfer" && existing.to_account_id) {
    adjustAccountOrWalletBalance(db, existing.account_id, existing.account_type, amount);
    adjustAccountOrWalletBalance(db, existing.to_account_id, existing.to_account_type || "wallet", -amount);
  }

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
}

// Saving Accounts Operations
export function createSavingAccount(data: {
  name: string;
  bank_name: string;
  account_type: string;
  account_number?: string;
  opening_balance: number;
  description?: string;
  color?: string;
}) {
  const db = getDatabase();
  const id = `sa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const openingBalance = Number(data.opening_balance) || 0;

  db.prepare(`
    INSERT INTO saving_accounts (
      id, name, bank_name, account_type, account_number, opening_balance,
      current_balance, description, color, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.bank_name,
    data.account_type,
    data.account_number || "",
    openingBalance,
    openingBalance,
    data.description || "",
    data.color || "#10B981",
    now,
    now
  );

  return { id, ...data, current_balance: openingBalance, created_at: now, updated_at: now };
}

export function updateSavingAccount(id: string, updates: any) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM saving_accounts WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Saving account not found");

  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  db.prepare(`
    UPDATE saving_accounts SET
      name = ?, bank_name = ?, account_type = ?, account_number = ?,
      description = ?, color = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.bank_name,
    merged.account_type,
    merged.account_number || "",
    merged.description || "",
    merged.color,
    merged.updated_at,
    id
  );
  return merged;
}

export function deleteSavingAccount(id: string) {
  const db = getDatabase();
  // Safe check if any transactions use this
  const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE account_id = ? OR to_account_id = ?").get(id, id) as any;
  if (txCount && txCount.count > 0) {
    throw new Error(`Cannot delete account: ${txCount.count} transaction(s) are linked to it.`);
  }
  db.prepare("DELETE FROM saving_accounts WHERE id = ?").run(id);
}

// Wallets Operations
export function createWallet(data: {
  name: string;
  type: string;
  opening_balance: number;
  color?: string;
  icon?: string;
}) {
  const db = getDatabase();
  const id = `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const openingBalance = Number(data.opening_balance) || 0;

  db.prepare(`
    INSERT INTO wallets (
      id, name, type, opening_balance, current_balance, color, icon, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.type,
    openingBalance,
    openingBalance,
    data.color || "#6366F1",
    data.icon || "wallet",
    now,
    now
  );

  return { id, ...data, current_balance: openingBalance, created_at: now, updated_at: now };
}

export function updateWallet(id: string, updates: any) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM wallets WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Wallet not found");

  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  db.prepare(`
    UPDATE wallets SET
      name = ?, type = ?, color = ?, icon = ?, updated_at = ?
    WHERE id = ?
  `).run(merged.name, merged.type, merged.color, merged.icon, merged.updated_at, id);
  return merged;
}

export function deleteWallet(id: string) {
  const db = getDatabase();
  const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE account_id = ? OR to_account_id = ?").get(id, id) as any;
  if (txCount && txCount.count > 0) {
    throw new Error(`Cannot delete wallet: ${txCount.count} transaction(s) are linked to it.`);
  }
  db.prepare("DELETE FROM wallets WHERE id = ?").run(id);
}

// Deposits Operations with automatic interest & maturity calculations
export function calculateDepositExpected(amount: number, interestRate: number, periodMonths: number) {
  const principal = Number(amount) || 0;
  const rate = Number(interestRate) || 0;
  const months = Number(periodMonths) || 12;

  // Simple interest annualized: P * (R / 100) * (months / 12)
  const expectedInterest = Math.round((principal * (rate / 100) * (months / 12)) * 100) / 100;
  const expectedMaturityAmount = Math.round((principal + expectedInterest) * 100) / 100;

  return { expectedInterest, expectedMaturityAmount };
}

export function createDeposit(data: {
  name: string;
  bank_name: string;
  amount: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  period_months: number;
  status?: string;
  notes?: string;
  source_account_id?: string;
  source_account_type?: "saving_account" | "wallet";
}) {
  const db = getDatabase();
  const id = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const amount = Number(data.amount);
  const interestRate = Number(data.interest_rate);
  const periodMonths = Number(data.period_months) || 12;

  const { expectedInterest, expectedMaturityAmount } = calculateDepositExpected(amount, interestRate, periodMonths);

  db.prepare(`
    INSERT INTO deposits (
      id, name, bank_name, amount, interest_rate, start_date, maturity_date,
      period_months, expected_interest, expected_maturity_amount, status, notes,
      source_account_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.bank_name,
    amount,
    interestRate,
    data.start_date,
    data.maturity_date,
    periodMonths,
    expectedInterest,
    expectedMaturityAmount,
    data.status || "active",
    data.notes || "",
    data.source_account_id || null,
    now,
    now
  );

  // If funded from an account/wallet, deduct principal from that account
  if (data.source_account_id) {
    adjustAccountOrWalletBalance(db, data.source_account_id, data.source_account_type || "saving_account", -amount);
  }

  return {
    id,
    ...data,
    expected_interest: expectedInterest,
    expected_maturity_amount: expectedMaturityAmount,
    created_at: now,
    updated_at: now,
  };
}

export function updateDeposit(id: string, updates: any) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM deposits WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Deposit not found");

  const amount = updates.amount !== undefined ? Number(updates.amount) : existing.amount;
  const rate = updates.interest_rate !== undefined ? Number(updates.interest_rate) : existing.interest_rate;
  const period = updates.period_months !== undefined ? Number(updates.period_months) : existing.period_months;

  const { expectedInterest, expectedMaturityAmount } = calculateDepositExpected(amount, rate, period);

  const merged = {
    ...existing,
    ...updates,
    amount,
    interest_rate: rate,
    period_months: period,
    expected_interest: expectedInterest,
    expected_maturity_amount: expectedMaturityAmount,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE deposits SET
      name = ?, bank_name = ?, amount = ?, interest_rate = ?, start_date = ?,
      maturity_date = ?, period_months = ?, expected_interest = ?,
      expected_maturity_amount = ?, status = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.bank_name,
    merged.amount,
    merged.interest_rate,
    merged.start_date,
    merged.maturity_date,
    merged.period_months,
    merged.expected_interest,
    merged.expected_maturity_amount,
    merged.status,
    merged.notes || "",
    merged.updated_at,
    id
  );

  return merged;
}

export function deleteDeposit(id: string) {
  const db = getDatabase();
  db.prepare("DELETE FROM deposits WHERE id = ?").run(id);
}

// Budget Management
export function createBudget(data: {
  category_id: string;
  amount: number;
  month: number;
  year: number;
}) {
  const db = getDatabase();
  const id = `bgt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const amount = Number(data.amount);

  // Check if budget already exists for this category/month/year
  const existing = db.prepare(`
    SELECT id FROM budgets WHERE category_id = ? AND month = ? AND year = ?
  `).get(data.category_id, data.month, data.year) as any;

  if (existing) {
    db.prepare(`
      UPDATE budgets SET amount = ?, updated_at = ? WHERE id = ?
    `).run(amount, now, existing.id);
    return { id: existing.id, ...data, updated_at: now };
  }

  db.prepare(`
    INSERT INTO budgets (id, category_id, amount, month, year, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.category_id, amount, data.month, data.year, now, now);

  return { id, ...data, created_at: now, updated_at: now };
}

export function updateBudget(id: string, updates: { amount?: number; category_id?: string }) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM budgets WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Budget not found");

  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  db.prepare(`
    UPDATE budgets SET amount = ?, category_id = ?, updated_at = ? WHERE id = ?
  `).run(merged.amount, merged.category_id, merged.updated_at, id);
  return merged;
}

export function deleteBudget(id: string) {
  const db = getDatabase();
  db.prepare("DELETE FROM budgets WHERE id = ?").run(id);
}

// Saving Goals & Contributions
export function createSavingGoal(data: {
  name: string;
  target_amount: number;
  current_amount?: number;
  starting_date: string;
  target_date: string;
  description?: string;
  color?: string;
  icon?: string;
}) {
  const db = getDatabase();
  const id = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const target = Number(data.target_amount);
  const current = Number(data.current_amount) || 0;

  db.prepare(`
    INSERT INTO saving_goals (
      id, name, target_amount, current_amount, starting_date, target_date,
      description, color, icon, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    target,
    current,
    data.starting_date,
    data.target_date,
    data.description || "",
    data.color || "#10B981",
    data.icon || "target",
    current >= target ? "completed" : "in_progress",
    now,
    now
  );

  return { id, ...data, current_amount: current, created_at: now, updated_at: now };
}

export function updateSavingGoal(id: string, updates: any) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM saving_goals WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Saving goal not found");

  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  const current = Number(merged.current_amount);
  const target = Number(merged.target_amount);
  const status = current >= target ? "completed" : "in_progress";

  db.prepare(`
    UPDATE saving_goals SET
      name = ?, target_amount = ?, current_amount = ?, starting_date = ?,
      target_date = ?, description = ?, color = ?, icon = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.name,
    target,
    current,
    merged.starting_date,
    merged.target_date,
    merged.description || "",
    merged.color,
    merged.icon,
    status,
    merged.updated_at,
    id
  );

  return { ...merged, status };
}

export function deleteSavingGoal(id: string) {
  const db = getDatabase();
  db.prepare("DELETE FROM saving_contributions WHERE goal_id = ?").run(id);
  db.prepare("DELETE FROM saving_goals WHERE id = ?").run(id);
}

export function addSavingContribution(data: {
  goal_id: string;
  account_id?: string;
  account_type?: "saving_account" | "wallet";
  amount: number;
  date: string;
  notes?: string;
}) {
  const db = getDatabase();
  const id = `sc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const amount = Number(data.amount);

  db.prepare(`
    INSERT INTO saving_contributions (id, goal_id, account_id, account_type, amount, date, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.goal_id,
    data.account_id || null,
    data.account_type || null,
    amount,
    data.date,
    data.notes || "",
    now
  );

  // Update Goal's current_amount
  const goal = db.prepare("SELECT * FROM saving_goals WHERE id = ?").get(data.goal_id) as any;
  if (goal) {
    const newCurrent = Number(goal.current_amount) + amount;
    const isCompleted = newCurrent >= Number(goal.target_amount);
    db.prepare(`
      UPDATE saving_goals 
      SET current_amount = ?, status = ?, updated_at = ? 
      WHERE id = ?
    `).run(newCurrent, isCompleted ? "completed" : "in_progress", now, data.goal_id);
  }

  // Deduct from source account/wallet if provided (WITHOUT marking as an expense!)
  if (data.account_id && data.account_type) {
    adjustAccountOrWalletBalance(db, data.account_id, data.account_type, -amount);
  }

  return { id, ...data, created_at: now };
}

// Category Management with Safe Reassignment
export function createCategory(data: {
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}) {
  const db = getDatabase();
  const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO categories (id, name, type, icon, color, is_custom, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `).run(id, data.name, data.type, data.icon || "tag", data.color || "#6366F1", now);

  return { id, ...data, is_custom: 1, created_at: now };
}

export function updateCategory(id: string, updates: { name?: string; icon?: string; color?: string }) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Category not found");

  const merged = { ...existing, ...updates };
  db.prepare(`
    UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?
  `).run(merged.name, merged.icon, merged.color, id);

  return merged;
}

export function deleteCategory(id: string, replacementCategoryId?: string) {
  const db = getDatabase();
  const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE category_id = ?").get(id) as any;

  if (txCount && txCount.count > 0) {
    if (!replacementCategoryId) {
      throw new Error(
        `Category is used by ${txCount.count} transaction(s). Please provide a replacement category before deleting.`
      );
    }
    // Reassign transactions
    db.prepare("UPDATE transactions SET category_id = ? WHERE category_id = ?").run(replacementCategoryId, id);
    // Reassign budgets
    db.prepare("UPDATE budgets SET category_id = ? WHERE category_id = ?").run(replacementCategoryId, id);
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// Profile Management
export function updateProfile(updates: any) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM user_profile LIMIT 1").get() as any;

  const merged = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE user_profile SET
      full_name = ?, email = ?, username = ?, phone = ?, avatar_url = ?,
      currency = ?, currency_symbol = ?, timezone = ?, date_format = ?,
      theme = ?, monthly_savings_target = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.full_name,
    merged.email,
    merged.username,
    merged.phone || "",
    merged.avatar_url || "",
    merged.currency || "LKR",
    merged.currency_symbol || "Rs.",
    merged.timezone || "Asia/Colombo",
    merged.date_format || "DD/MM/YYYY",
    merged.theme || "dark",
    Number(merged.monthly_savings_target) || 0,
    merged.updated_at,
    existing.id
  );

  return merged;
}

// Admin Operations
export function getAdminStats() {
  const db = getDatabase();

  const accountsCount = (db.prepare("SELECT COUNT(*) as c FROM saving_accounts").get() as any).c;
  const walletsCount = (db.prepare("SELECT COUNT(*) as c FROM wallets").get() as any).c;
  const depositsCount = (db.prepare("SELECT COUNT(*) as c FROM deposits").get() as any).c;
  const txCount = (db.prepare("SELECT COUNT(*) as c FROM transactions").get() as any).c;
  const budgetsCount = (db.prepare("SELECT COUNT(*) as c FROM budgets").get() as any).c;
  const goalsCount = (db.prepare("SELECT COUNT(*) as c FROM saving_goals").get() as any).c;

  let dbSize = 0;
  try {
    if (fs.existsSync(DB_FILE)) {
      dbSize = fs.statSync(DB_FILE).size;
    }
  } catch (e) {
    // ignore
  }

  return {
    accountsCount,
    walletsCount,
    depositsCount,
    txCount,
    budgetsCount,
    goalsCount,
    dbSize,
    dbFile: DB_FILE,
  };
}

export function resetDatabase() {
  const db = getDatabase();
  db.exec(`
    DELETE FROM transactions;
    DELETE FROM saving_accounts;
    DELETE FROM wallets;
    DELETE FROM deposits;
    DELETE FROM budgets;
    DELETE FROM saving_goals;
    DELETE FROM saving_contributions;
  `);
}

export function exportAllData() {
  return getFullFinancialState();
}

export function importAllData(data: any) {
  const db = getDatabase();
  resetDatabase();

  if (data.savingAccounts && Array.isArray(data.savingAccounts)) {
    const insert = db.prepare(`
      INSERT INTO saving_accounts (id, name, bank_name, account_type, account_number, opening_balance, current_balance, description, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of data.savingAccounts) {
      insert.run(a.id, a.name, a.bank_name, a.account_type, a.account_number, a.opening_balance, a.current_balance, a.description, a.color, a.created_at, a.updated_at);
    }
  }

  if (data.wallets && Array.isArray(data.wallets)) {
    const insert = db.prepare(`
      INSERT INTO wallets (id, name, type, opening_balance, current_balance, color, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const w of data.wallets) {
      insert.run(w.id, w.name, w.type, w.opening_balance, w.current_balance, w.color, w.icon, w.created_at, w.updated_at);
    }
  }

  if (data.deposits && Array.isArray(data.deposits)) {
    const insert = db.prepare(`
      INSERT INTO deposits (id, name, bank_name, amount, interest_rate, start_date, maturity_date, period_months, expected_interest, expected_maturity_amount, status, notes, source_account_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of data.deposits) {
      insert.run(d.id, d.name, d.bank_name, d.amount, d.interest_rate, d.start_date, d.maturity_date, d.period_months, d.expected_interest, d.expected_maturity_amount, d.status, d.notes, d.source_account_id, d.created_at, d.updated_at);
    }
  }

  if (data.transactions && Array.isArray(data.transactions)) {
    const insert = db.prepare(`
      INSERT INTO transactions (id, title, type, amount, category_id, account_id, account_type, to_account_id, to_account_type, date, payment_method, description, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of data.transactions) {
      insert.run(t.id, t.title, t.type, t.amount, t.category_id, t.account_id, t.account_type, t.to_account_id, t.to_account_type, t.date, t.payment_method, t.description, t.notes, t.created_at, t.updated_at);
    }
  }

  if (data.budgets && Array.isArray(data.budgets)) {
    const insert = db.prepare(`
      INSERT INTO budgets (id, category_id, amount, month, year, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of data.budgets) {
      insert.run(b.id, b.category_id, b.amount, b.month, b.year, b.created_at, b.updated_at);
    }
  }

  if (data.savingGoals && Array.isArray(data.savingGoals)) {
    const insert = db.prepare(`
      INSERT INTO saving_goals (id, name, target_amount, current_amount, starting_date, target_date, description, color, icon, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const g of data.savingGoals) {
      insert.run(g.id, g.name, g.target_amount, g.current_amount, g.starting_date, g.target_date, g.description, g.color, g.icon, g.status, g.created_at, g.updated_at);
    }
  }

  if (data.savingContributions && Array.isArray(data.savingContributions)) {
    const insert = db.prepare(`
      INSERT INTO saving_contributions (id, goal_id, account_id, account_type, amount, date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const sc of data.savingContributions) {
      insert.run(sc.id, sc.goal_id, sc.account_id, sc.account_type, sc.amount, sc.date, sc.notes, sc.created_at);
    }
  }

  if (data.user) {
    updateProfile(data.user);
  }
}
