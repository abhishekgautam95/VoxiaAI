"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Check,
  Tag,
} from "lucide-react";

export interface KnowledgeDocumentItem {
  id: string;
  title: string;
  category: string;
  content: string;
  sourceType: string;
  enabled: boolean;
  createdAt: string;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

const CATEGORIES = [
  "All",
  "Insurance",
  "Clinical Policies",
  "Pricing",
  "Directions",
  "General FAQ",
];

export function KnowledgeBaseModal({
  isOpen,
  onClose,
  onUpdateCount,
}: KnowledgeBaseModalProps) {
  const [documents, setDocuments] = useState<KnowledgeDocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Document Form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Insurance");
  const [newContent, setNewContent] = useState("");

  const loadDocuments = useCallback(() => {
    setIsLoading(true);
    fetch("/api/knowledge-base")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.documents)) {
          setDocuments(data.documents);
          if (onUpdateCount) onUpdateCount(data.documents.length);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [onUpdateCount]);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          content: newContent.trim(),
          sourceType: "FAQ",
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        setIsAdding(false);
        loadDocuments();
        setToastMessage("Knowledge document indexed successfully!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleDocument = async (doc: KnowledgeDocumentItem) => {
    try {
      const res = await fetch(`/api/knowledge-base/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !doc.enabled }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, enabled: !d.enabled } : d))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (onUpdateCount) onUpdateCount(documents.length - 1);
        setToastMessage("Document removed from knowledge base.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== "All" && doc.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchContent = doc.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative flex h-full max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Clinic Knowledge Base & Semantic Index
              </h2>
              <p className="text-xs text-zinc-400">
                Manage clinical policies, insurance networks, and answers used by the AI voice agent.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-3 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Controls: Search, Filter & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 px-6 py-3 bg-zinc-900/30">
          <div className="flex flex-1 items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge documents..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isAdding ? "Close Form" : "Add Knowledge Doc"}</span>
          </button>
        </div>

        {/* Add Document Form Drawer */}
        {isAdding && (
          <form
            onSubmit={handleCreateDocument}
            className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Delta Dental In-Network Coverage Terms"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">
                Document Content / Verbatim Answer *
              </label>
              <textarea
                rows={3}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Provide accurate clinical facts, instructions, or pricing details for the AI voice agent..."
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500"
              >
                Save & Index
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Document List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Loading knowledge base documents...
            </div>
          ) : filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`rounded-xl border p-4 transition-all ${
                  doc.enabled
                    ? "border-zinc-800/80 bg-zinc-900/40"
                    : "border-zinc-850 bg-zinc-950/40 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {doc.title}
                      </span>
                      <span className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700/60">
                        <Tag className="h-2.5 w-2.5 text-cyan-400" />
                        {doc.category}
                      </span>
                      {doc.enabled ? (
                        <span className="rounded bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                          Indexed & Active
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] text-zinc-500">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300 pt-1">
                      {doc.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleDocument(doc)}
                      className={`rounded px-2 py-1 text-[11px] font-medium border transition-colors ${
                        doc.enabled
                          ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                          : "border-emerald-800 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/60"
                      }`}
                    >
                      {doc.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 hover:border-rose-800/60 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-2 text-xs font-semibold text-zinc-400">
                No knowledge documents found
              </p>
              <p className="text-[11px] text-zinc-600">
                Try adjusting your search query or add a new knowledge doc above.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-6 py-3 bg-zinc-900/40 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-cyan-400" />
            Showing {filteredDocs.length} of {documents.length} knowledge documents
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
