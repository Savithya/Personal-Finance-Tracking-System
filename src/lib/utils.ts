import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Sri Lankan Rupees (LKR)
 * Example: Rs. 125,000.00
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "LKR",
  currencySymbol: string = "Rs."
): string {
  const numeric = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) return `${currencySymbol} 0.00`;

  const isNegative = numeric < 0;
  const absAmount = Math.abs(numeric);

  const formattedNumber = absAmount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? "-" : ""}${currencySymbol} ${formattedNumber}`;
}

/**
 * Format compact currency in Sri Lankan Rupees (LKR)
 * Example: Rs. 1.25M or Rs. 125k
 */
export function formatCompactCurrency(
  amount: number | string | null | undefined,
  currencySymbol: string = "Rs."
): string {
  const numeric = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) return `${currencySymbol} 0`;

  const isNegative = numeric < 0;
  const abs = Math.abs(numeric);

  let formatted = "";
  if (abs >= 1000000000) {
    formatted = `${(abs / 1000000000).toFixed(2)}B`;
  } else if (abs >= 1000000) {
    formatted = `${(abs / 1000000).toFixed(2)}M`;
  } else if (abs >= 1000) {
    formatted = `${(abs / 1000).toFixed(1)}k`;
  } else {
    formatted = abs.toFixed(2);
  }

  return `${isNegative ? "-" : ""}${currencySymbol} ${formatted}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/**
 * Sri Lankan date format (DD/MM/YYYY or readable)
 */
export function formatDate(dateStr: string, format: "short" | "readable" | "input" = "readable"): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    if (format === "short") {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    if (format === "input") {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    }

    return d.toLocaleDateString("en-LK", {
      timeZone: "Asia/Colombo",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getMonthName(monthNumber: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthNumber - 1] || "";
}

/**
 * Mask account number for security (e.g., •••• •••• 4521)
 */
export function maskAccountNumber(accNo?: string): string {
  if (!accNo) return "Not provided";
  const clean = accNo.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  return `•••• •••• ${last4}`;
}
