# FINORA – Personal Finance Management System

A modern, high-performance personal finance management application tailored for authentic financial tracking in **Sri Lankan Rupees (LKR)** and calibrated to the **Asia/Colombo** timezone.

---

## 🌟 Key Features

- **Strict Sri Lankan Rupee (LKR) Standard:**
  - Currency symbol: `Rs.`
  - Formatting convention: `Rs. 125,000.00`
  - Standard time format: `DD/MM/YYYY` in `Asia/Colombo` timezone.
- **Persistent Embedded SQLite Engine:**
  - Powered by Node.js native `node:sqlite` (`data/finora.db`).
  - No external database or heavy services required.
  - Complete zero-mock initial database state — ready for entering real personal finances immediately.
- **Accurate Financial Balance Math:**
  - **Incomes:** Add to target account or wallet balance.
  - **Expenses:** Subtract from target account or wallet balance.
  - **Transfers:** Move money atomically between accounts and wallets without double-counting as income or expense.
  - **Goal Contributions:** Fund saving goals from real account/wallet balances without inflating expense metrics.
  - **Fixed Deposits:** Optional funding directly from an existing savings account.
- **Security-Hardened Admin Panel:**
  - Password protected with `crypto.scryptSync` salted hashing.
  - HMAC-signed session tokens and HttpOnly cookies.
  - Comprehensive database inspection, JSON backup export, backup restoration, and safe reset with confirmation.

---

## 🧭 Navigation & Modules

FINORA strictly implements the 11 core financial modules requested:

1. **Overview (`/`)**: High-level financial dashboard featuring real net worth, monthly cash flow charts, category spending breakdown, account & wallet previews, and recent transactions.
2. **Saving Accounts (`/saving-accounts`)**: Multi-bank account tracking (Commercial Bank, Sampath Bank, HNB, BOC, People's Bank, Seylan, etc.), masked account numbers, opening and current balances, and transaction histories.
3. **Deposits (`/deposits`)**: Real Fixed Deposit and savings deposit tracker. Automatically calculates expected interest and maturity amount based on principal, annual rate, and duration.
4. **Budget Management (`/budgets`)**: Monthly category budgets with live actual-spend calculations, utilization progress bars, remaining budget figures, and overspending visual alerts.
5. **Category Management (`/categories`)**: Custom income (Salary, Freelance, Business, Interest, Other) and expense categories (Food, Transport, Housing, Utilities, etc.) with custom color pickers and icon selectors. Safe reassignment protects transactions from orphaned deletions.
6. **Wallets (`/wallets`)**: Cash, Bank, Digital, Personal, and Other wallets. Supports instant fund transfers between wallets and accounts.
7. **Saving Goals (`/saving-goals`)**: Target goals (Vehicle, Laptop, Emergency Fund, Education) with visual completion percentages, target dates, and contribution logs linked to real balances.
8. **Transactions (`/transactions`)**: Central transaction ledger with multi-filter search (type, category, account, date range), sorting, pagination, and CSV export.
9. **Income Inflows (`/income`)**: Dedicated incoming money tracker with monthly comparisons, category distributions, and direct transaction integration.
10. **Expense Management (`/expenses`)**: Comprehensive expense tracking with category bar/pie charts, top spending category breakdowns, and time filters.
11. **My Profile (`/profile`)**: Account details, avatar selector, monthly savings target, LKR & Colombo timezone settings, and password update.
12. **Admin Panel (`/admin` and `/admin/login`)**: Administrative portal with database diagnostics, JSON backup export/import, and safe database wipe.

---

## 🔐 Admin Credentials

- **Admin Login URL:** `http://localhost:3001/admin/login`
- **Default Username:** `admin`
- **Default Password:** `admin@Finora2026!`
*(Configured securely via environment variables in `.env.local`)*

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev -- -p 3001
```

### Production Build & Start
```bash
npm run build
npm run start -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS (Deep Navy, Slate, Emerald Green accents)
- **Database:** SQLite (`node:sqlite` in Node.js 22+)
- **Icons:** Lucide React
- **Charts:** Recharts
