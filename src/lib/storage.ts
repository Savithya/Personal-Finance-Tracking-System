// FINORA - Storage Shim
import { DEMO_USER } from "./demo-data";

export class StorageService {
  static getUserProfile() {
    return DEMO_USER;
  }
  static getAccounts() {
    return [];
  }
  static getCategories() {
    return [];
  }
  static getTransactions() {
    return [];
  }
  static getBudgets() {
    return [];
  }
  static getSavingsGoals() {
    return [];
  }
}
