"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, Theme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "button", className }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isDark, mounted } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Avoid SSR hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("h-8 w-8 rounded-xl bg-white/5 animate-pulse", className)} />
    );
  }

  // Segmented control (Used in MobileNav and Profile Settings)
  if (variant === "segmented") {
    const options: { id: Theme; label: string; icon: React.ElementType }[] = [
      { id: "light", label: "Light", icon: Sun },
      { id: "dark", label: "Dark", icon: Moon },
      { id: "system", label: "System", icon: Monitor },
    ];

    return (
      <div
        className={cn(
          "grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs",
          className
        )}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all",
                isActive
                  ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-slate-200/50 dark:border-white/10"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown menu variant
  if (variant === "dropdown") {
    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={cn(
            "p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center",
            className
          )}
          title={`Active theme: ${theme} (${isDark ? "Dark" : "Light"})`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-emerald-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 rotate-0" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-[#0C111D] border border-slate-200 dark:border-white/10 shadow-xl py-1 z-50 animate-fade-in text-xs">
            <button
              onClick={() => {
                setTheme("light");
                setDropdownOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors",
                theme === "light"
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-700 dark:text-slate-300"
              )}
            >
              <span className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-amber-500" /> Light
              </span>
              {theme === "light" && <Check className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => {
                setTheme("dark");
                setDropdownOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors",
                theme === "dark"
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-700 dark:text-slate-300"
              )}
            >
              <span className="flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 text-emerald-400" /> Dark
              </span>
              {theme === "dark" && <Check className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => {
                setTheme("system");
                setDropdownOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors",
                theme === "system"
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-700 dark:text-slate-300"
              )}
            >
              <span className="flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-blue-400" /> System
              </span>
              {theme === "system" && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quick One-Click Toggle Button (Default for Header)
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center shrink-0 active:scale-95 group",
        className
      )}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-emerald-600 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
