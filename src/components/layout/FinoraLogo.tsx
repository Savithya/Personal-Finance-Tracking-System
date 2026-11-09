"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FinoraLogoProps {
  size?: "sm" | "md" | "lg";
  collapsed?: boolean;
  showBadge?: boolean;
  showSubtitle?: boolean;
  currency?: string;
  className?: string;
}

/**
 * High-precision vector emblem for FINORA
 * Encapsulates an architectural 'F' monogram integrated with upward financial momentum
 */
export function FinoraEmblem({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = {
    sm: "h-8 w-8 rounded-lg p-[1px]",
    md: "h-10 w-10 rounded-xl p-[1.5px]",
    lg: "h-12 w-12 rounded-2xl p-[2px]",
  };

  const innerSizeMap = {
    sm: "rounded-[7px] p-1.5",
    md: "rounded-[10px] p-2",
    lg: "rounded-[14px] p-2.5",
  };

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 shadow-md shadow-emerald-500/25 shrink-0 ring-1 ring-white/20 dark:ring-white/10 group transition-all duration-200 select-none",
        sizeMap[size],
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full bg-gradient-to-b from-[#0B1A14] to-[#040C0A] flex items-center justify-center relative overflow-hidden",
          innerSizeMap[size]
        )}
      >
        {/* Subtle ambient internal glow */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-400/20 rounded-full blur-md pointer-events-none" />

        {/* Vector Monogram Mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-emerald-400"
        >
          <path
            d="M5 4.75C5 3.7835 5.7835 3 6.75 3H18.25C18.9404 3 19.5 3.55964 19.5 4.25C19.5 4.94036 18.9404 5.5 18.25 5.5H8.5V10.25H15.5C16.1904 10.25 16.75 10.8096 16.75 11.5C16.75 12.1904 16.1904 12.75 15.5 12.75H8.5V19.25C8.5 20.2165 7.7165 21 6.75 21C5.7835 21 5 20.2165 5 19.25V4.75Z"
            fill="url(#finora-glyph-gradient)"
          />
          {/* Ascending Investment Trend Accents */}
          <circle cx="19.25" cy="4.25" r="1.5" fill="#34D399" />
          <circle cx="16.5" cy="11.5" r="1.25" fill="#6EE7B7" />

          <defs>
            <linearGradient
              id="finora-glyph-gradient"
              x1="5"
              y1="3"
              x2="19.5"
              y2="21"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFFFFF" />
              <stop offset="0.65" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Currency Indicator Badge with live status pulse
 */
export function FinoraCurrencyBadge({
  currency = "LKR",
  className,
}: {
  currency?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shrink-0 shadow-xs",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
      {currency}
    </span>
  );
}

/**
 * Complete, unified Finora Brand Lockup
 */
export function FinoraBrand({
  size = "md",
  collapsed = false,
  showBadge = true,
  showSubtitle = true,
  currency = "LKR",
  className,
}: FinoraLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 overflow-hidden", className)}>
      <FinoraEmblem size={size} />

      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              FINORA
              <span className="text-emerald-500 dark:text-emerald-400 ml-0.5">.</span>
            </span>
            {showBadge && <FinoraCurrencyBadge currency={currency} />}
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-1 leading-none truncate">
              Personal Finance System
            </span>
          )}
        </div>
      )}
    </div>
  );
}
