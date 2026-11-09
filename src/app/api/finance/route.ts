import { NextRequest, NextResponse } from "next/server";
import {
  getFullFinancialState,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createSavingAccount,
  updateSavingAccount,
  deleteSavingAccount,
  createWallet,
  updateWallet,
  deleteWallet,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  createBudget,
  updateBudget,
  deleteBudget,
  createSavingGoal,
  updateSavingGoal,
  deleteSavingGoal,
  addSavingContribution,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProfile,
} from "@/lib/server-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = getFullFinancialState();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API GET /api/finance error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch financial data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    let result: any = null;

    switch (action) {
      // Transactions
      case "create_transaction":
        result = createTransaction(payload);
        break;
      case "update_transaction":
        result = updateTransaction(payload.id, payload.updates);
        break;
      case "delete_transaction":
        deleteTransaction(payload.id);
        result = { id: payload.id, deleted: true };
        break;

      // Saving Accounts
      case "create_saving_account":
        result = createSavingAccount(payload);
        break;
      case "update_saving_account":
        result = updateSavingAccount(payload.id, payload.updates);
        break;
      case "delete_saving_account":
        deleteSavingAccount(payload.id);
        result = { id: payload.id, deleted: true };
        break;

      // Wallets
      case "create_wallet":
        result = createWallet(payload);
        break;
      case "update_wallet":
        result = updateWallet(payload.id, payload.updates);
        break;
      case "delete_wallet":
        deleteWallet(payload.id);
        result = { id: payload.id, deleted: true };
        break;

      // Deposits
      case "create_deposit":
        result = createDeposit(payload);
        break;
      case "update_deposit":
        result = updateDeposit(payload.id, payload.updates);
        break;
      case "delete_deposit":
        deleteDeposit(payload.id);
        result = { id: payload.id, deleted: true };
        break;

      // Budgets
      case "create_budget":
        result = createBudget(payload);
        break;
      case "update_budget":
        result = updateBudget(payload.id, payload.updates);
        break;
      case "delete_budget":
        deleteBudget(payload.id);
        result = { id: payload.id, deleted: true };
        break;

      // Saving Goals
      case "create_goal":
        result = createSavingGoal(payload);
        break;
      case "update_goal":
        result = updateSavingGoal(payload.id, payload.updates);
        break;
      case "delete_goal":
        deleteSavingGoal(payload.id);
        result = { id: payload.id, deleted: true };
        break;
      case "add_goal_contribution":
        result = addSavingContribution(payload);
        break;

      // Categories
      case "create_category":
        result = createCategory(payload);
        break;
      case "update_category":
        result = updateCategory(payload.id, payload.updates);
        break;
      case "delete_category":
        deleteCategory(payload.id, payload.replacementCategoryId);
        result = { id: payload.id, deleted: true };
        break;

      // Profile
      case "update_profile":
        result = updateProfile(payload);
        break;

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Return the updated full state alongside the action result
    const state = getFullFinancialState();
    return NextResponse.json({ success: true, result, data: state });
  } catch (error: any) {
    console.error("API POST /api/finance error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute financial action" },
      { status: 400 }
    );
  }
}
