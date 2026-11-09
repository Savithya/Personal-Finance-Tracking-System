import { Transaction, Budget, CategorySpending, FinancialSummary, SavingAccount, Wallet, Deposit } from "@/types";

export function roundCurrency(val: number): number {
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number // 1-12
): Transaction[] {
  return transactions.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

/**
 * Calculates authoritative financial summary using actual records
 */
export function calculateFinancialSummary(
  savingAccounts: SavingAccount[],
  wallets: Wallet[],
  deposits: Deposit[],
  transactions: Transaction[],
  year: number,
  month: number,
  currencySymbol: string = "Rs."
): FinancialSummary {
  const currentMonthTx = filterTransactionsByMonth(transactions, year, month);

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of currentMonthTx) {
    const amount = Number(t.amount) || 0;
    if (t.type === "income") {
      totalIncome += amount;
    } else if (t.type === "expense") {
      totalExpenses += amount;
    }
  }

  totalIncome = roundCurrency(totalIncome);
  totalExpenses = roundCurrency(totalExpenses);
  const netCashFlow = roundCurrency(totalIncome - totalExpenses);

  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = roundCurrency((Math.max(0, netCashFlow) / totalIncome) * 100);
  }

  const totalSavingAccountsBalance = roundCurrency(
    savingAccounts.reduce((acc, a) => acc + (Number(a.current_balance) || 0), 0)
  );

  const totalWalletsBalance = roundCurrency(
    wallets.reduce((acc, w) => acc + (Number(w.current_balance) || 0), 0)
  );

  const totalDepositsBalance = roundCurrency(
    deposits.reduce((acc, d) => acc + (Number(d.amount) || 0), 0)
  );

  const totalBalance = roundCurrency(totalSavingAccountsBalance + totalWalletsBalance + totalDepositsBalance);

  return {
    totalBalance,
    totalSavingAccountsBalance,
    totalWalletsBalance,
    totalDepositsBalance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    currencySymbol,
  };
}

/**
 * Spending broken down by Category
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categoriesMap: Map<string, { name: string; color: string; icon: string }>,
  year?: number,
  month?: number
): CategorySpending[] {
  let filtered = transactions.filter((t) => t.type === "expense");

  if (year && month) {
    filtered = filterTransactionsByMonth(filtered, year, month);
  }

  const totalExpense = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const categoryTotals = new Map<string, { amount: number; count: number }>();

  for (const t of filtered) {
    const catId = t.category_id || "uncategorized";
    const current = categoryTotals.get(catId) || { amount: 0, count: 0 };
    current.amount += Number(t.amount) || 0;
    current.count += 1;
    categoryTotals.set(catId, current);
  }

  const result: CategorySpending[] = [];

  categoryTotals.forEach((val, catId) => {
    const cat = categoriesMap.get(catId) || {
      name: "Uncategorized",
      color: "#94A3B8",
      icon: "tag",
    };

    const amount = roundCurrency(val.amount);
    const percentage = totalExpense > 0 ? roundCurrency((amount / totalExpense) * 100) : 0;

    result.push({
      categoryId: catId,
      categoryName: cat.name,
      color: cat.color,
      icon: cat.icon,
      amount,
      percentage,
      transactionCount: val.count,
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Budget vs Actual Expense status
 */
export interface BudgetStatusItem {
  budget: Budget;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isWarning: boolean;
}

export function calculateBudgetStatus(
  budgets: Budget[],
  transactions: Transaction[],
  categoriesMap: Map<string, { name: string; color: string; icon: string }>,
  year: number,
  month: number
): BudgetStatusItem[] {
  const currentMonthExpenses = filterTransactionsByMonth(transactions, year, month).filter(
    (t) => t.type === "expense"
  );

  return budgets
    .filter((b) => b.year === year && b.month === month)
    .map((b) => {
      const cat = categoriesMap.get(b.category_id) || {
        name: "General",
        color: "#6366F1",
        icon: "tag",
      };

      const spent = roundCurrency(
        currentMonthExpenses
          .filter((t) => t.category_id === b.category_id)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      );

      const budgetAmount = roundCurrency(Number(b.amount) || 0);
      const remainingAmount = roundCurrency(budgetAmount - spent);
      const percentageUsed = budgetAmount > 0 ? roundCurrency((spent / budgetAmount) * 100) : 0;

      return {
        budget: { ...b, spent, remaining: remainingAmount },
        categoryName: cat.name,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
        budgetAmount,
        spentAmount: spent,
        remainingAmount,
        percentageUsed,
        isOverBudget: spent > budgetAmount,
        isWarning: percentageUsed >= 80 && spent <= budgetAmount,
      };
    });
}

/**
 * Monthly trend calculation for charts
 */
export function calculateMonthlyTrends(
  transactions: Transaction[],
  currentYear: number,
  currentMonth: number,
  monthsCount: number = 6
) {
  const trends: {
    month: string;
    monthKey: string;
    income: number;
    expenses: number;
    net: number;
  }[] = [];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = monthsCount - 1; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }

    const monthTx = filterTransactionsByMonth(transactions, y, m);
    let inc = 0;
    let exp = 0;

    for (const t of monthTx) {
      const amt = Number(t.amount) || 0;
      if (t.type === "income") inc += amt;
      else if (t.type === "expense") exp += amt;
    }

    trends.push({
      month: `${monthNames[m - 1]} ${y.toString().slice(-2)}`,
      monthKey: `${y}-${String(m).padStart(2, "0")}`,
      income: roundCurrency(inc),
      expenses: roundCurrency(exp),
      net: roundCurrency(inc - exp),
    });
  }

  return trends;
}
