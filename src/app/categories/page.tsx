"use client";

import React, { useState, useMemo } from "react";
import {
  Tags,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useFinance } from "@/context/FinanceContext";
import { Category, CategoryType } from "@/types";

const COLORS = [
  "#10B981", "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E", "#EF4444",
  "#F97316", "#F59E0B", "#64748B",
];

export default function CategoriesPage() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<CategoryType>("expense");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Safe Reassignment / Delete State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [replacementCategoryId, setReplacementCategoryId] = useState<string>("");

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [icon, setIcon] = useState("tag");
  const [color, setColor] = useState("#6366F1");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate usage counts per category from actual transactions
  const usageMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.category_id) {
        map.set(t.category_id, (map.get(t.category_id) || 0) + 1);
      }
    }
    return map;
  }, [transactions]);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  const resetForm = () => {
    setName("");
    setType(activeTab);
    setIcon("tag");
    setColor("#6366F1");
    setFormError("");
    setEditingCategory(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || "tag");
    setColor(cat.color || "#6366F1");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon,
          color,
        });
        if (!res.success) {
          setFormError(res.error || "Failed to update category");
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addCategory({
          name: name.trim(),
          type,
          icon,
          color,
        });
        if (!res.success) {
          setFormError(res.error || "Failed to add category");
          setIsSubmitting(false);
          return;
        }
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe delete handler
  const handleInitiateDelete = (cat: Category) => {
    setDeletingCategory(cat);
    // Find eligible replacement categories of the same type
    const replacements = categories.filter((c) => c.id !== cat.id && c.type === cat.type);
    if (replacements.length > 0) {
      setReplacementCategoryId(replacements[0].id);
    } else {
      setReplacementCategoryId("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    const usageCount = usageMap.get(deletingCategory.id) || 0;

    if (usageCount > 0 && !replacementCategoryId) {
      alert("Please select a replacement category to safely reassign existing transactions.");
      return;
    }

    try {
      const res = await deleteCategory(deletingCategory.id, replacementCategoryId || undefined);
      if (!res.success) {
        alert(res.error || "Failed to delete category");
      }
      setDeletingCategory(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Tags className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Category Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize income and expense categories, icons, and colors with safe transaction reassignment
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "expense"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <TrendingDown className="h-3.5 w-3.5" />
          <span>Expense Categories ({categories.filter((c) => c.type === "expense").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("income")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "income"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Income Categories ({categories.filter((c) => c.type === "income").length})</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => {
          const usageCount = usageMap.get(cat.id) || 0;

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-[#0C111D] border border-white/5 hover:border-white/10 transition-all hover:shadow-lg flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color || "#6366F1" }}
                >
                  <Tags className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                    {cat.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      {usageCount} transaction{usageCount !== 1 ? "s" : ""}
                    </span>
                    {usageCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleInitiateDelete(cat)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="text-xs text-slate-400">
                  Configure category name, type, and appearance
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Solar Energy, Pet Care, Freelance UI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Category Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === "expense"
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : "border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        type === "income"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              )}

              {/* Color Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Category Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-lg transition-transform ${
                        color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0C111D]" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Reassignment / Delete Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeletingCategory(null)} />
          <div className="relative w-full max-w-md bg-[#0C111D] border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 animate-fade-in max-h-[90vh] overflow-y-auto touch-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-400" />
                Delete Category: {deletingCategory.name}
              </h3>
              <button
                onClick={() => setDeletingCategory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const count = usageMap.get(deletingCategory.id) || 0;
              const eligibleReplacements = categories.filter(
                (c) => c.id !== deletingCategory.id && c.type === deletingCategory.type
              );

              return (
                <div className="space-y-4 my-4">
                  {count > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        <p className="font-bold flex items-center gap-1.5 mb-1">
                          <AlertCircle className="h-4 w-4 text-amber-400" />
                          Category is in use by {count} transaction(s)!
                        </p>
                        <p className="text-[11px] text-amber-400/90 leading-relaxed">
                          To protect financial records and avoid orphaned transactions, please select a replacement category to safely reassign them to before deleting.
                        </p>
                      </div>

                      {eligibleReplacements.length > 0 ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Safe Replacement Category *
                          </label>
                          <select
                            value={replacementCategoryId}
                            onChange={(e) => setReplacementCategoryId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                          >
                            {eligibleReplacements.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="text-xs text-rose-400 font-semibold">
                          No other category of this type is available. Please create another category before deleting this one.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      This category has no financial transactions linked to it. It can be safely deleted immediately.
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                    <button
                      onClick={() => setDeletingCategory(null)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={count > 0 && !replacementCategoryId}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                    >
                      {count > 0 ? "Reassign & Delete" : "Confirm Delete"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
