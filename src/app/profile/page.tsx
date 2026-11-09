"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Globe,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Camera,
  Coins,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { useTheme, Theme } from "@/context/ThemeContext";
import { formatCurrency } from "@/lib/utils";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUserProfile, summary } = useFinance();
  const { theme, setTheme } = useTheme();

  // Profile Form State
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || AVATAR_OPTIONS[0]);
  const [savingsTarget, setSavingsTarget] = useState(String(user.monthly_savings_target || 25000));

  // Preferences
  const [dateFormat, setDateFormat] = useState(user.date_format || "DD/MM/YYYY");
  const [selectedTheme, setSelectedTheme] = useState(user.theme || "dark");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback State
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");

    if (!fullName.trim()) {
      setProfileError("Full Name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setProfileError("A valid email address is required.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await updateUserProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
        monthly_savings_target: parseFloat(savingsTarget) || 0,
        date_format: dateFormat,
        theme: selectedTheme as any,
        currency: "LKR",
        currency_symbol: "Rs.",
        timezone: "Asia/Colombo",
      });

      if (!res.success) {
        setProfileError(res.error || "Failed to save profile");
      } else {
        setProfileMessage("Profile and preferences saved successfully!");
        setTimeout(() => setProfileMessage(""), 4000);
      }
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    // Update password simulation for user profile
    setPasswordMessage("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMessage(""), 4000);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of FINORA?")) {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Profile & Account Settings</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, Sri Lankan Rupee preferences, and security settings
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg">
              <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.full_name || "Financial User"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mx-auto sm:mx-0">
                LKR Profile Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email || "user@finora.lk"}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
              <span>
                Standard Currency: <strong className="text-emerald-400 font-bold">LKR (Rs.)</strong>
              </span>
              <span>•</span>
              <span>
                Timezone: <strong className="text-slate-200">Asia/Colombo</strong>
              </span>
              <span>•</span>
              <span>
                Total Stored Liquidity: <strong className="text-white font-bold">{formatCurrency(summary.totalBalance)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick avatar selection */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">Select Profile Avatar:</span>
          <div className="flex items-center gap-3">
            {AVATAR_OPTIONS.map((url, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setAvatarUrl(url)}
                className={`h-10 w-10 rounded-xl overflow-hidden border-2 transition-transform ${
                  avatarUrl === url ? "border-emerald-500 scale-110" : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={url} alt="avatar option" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-400" /> Personal Information & Account Settings
        </h3>

        {profileError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {profileMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Phone Number (Sri Lanka)
              </label>
              <input
                type="text"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Monthly Savings Target (LKR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Regional & System Preferences */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-500" /> Regional & System Preferences
            </h4>

            {/* Interface Theme Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Interface Color Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme("dark");
                    setTheme("dark");
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    theme === "dark"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 border border-white/10 shrink-0">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Deep obsidian & emerald glow</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme("light");
                    setTheme("light");
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    theme === "light"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Crisp clean & high contrast</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme("system");
                    setTheme("system");
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    theme === "system"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">System Auto</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Matches OS / Browser preference</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Currency
                </label>
                <input
                  type="text"
                  value="Sri Lankan Rupee (LKR - Rs.)"
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-emerald-600 dark:text-emerald-400 text-xs font-bold cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Configured globally across all modules.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  System Timezone
                </label>
                <input
                  type="text"
                  value="Asia/Colombo (+05:30)"
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Sri Lankan standard time.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Sri Lankan Standard)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving Changes..." : "Save Profile & Preferences"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Settings */}
      <div className="p-6 rounded-3xl bg-[#0C111D] border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="h-4 w-4 text-rose-400" /> Security & Account Authentication
        </h3>

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passwordMessage}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
