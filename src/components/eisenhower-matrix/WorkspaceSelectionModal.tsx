"use client";

import React, { useState } from "react";
import {
  Zap,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  X,
  Calendar,
  Check,
  Loader2,
} from "lucide-react";
import { Workspace } from "@/types/eisenhower";

interface WorkspaceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onSelect: (id: number | null) => void; // null for Test Mode
  onCreate: (name: string, description: string) => Promise<void>;
  onUpdate: (id: number, name: string, description: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const WorkspaceSelectionModal: React.FC<
  WorkspaceSelectionModalProps
> = ({
  isOpen,
  onClose,
  workspaces,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [view, setView] = useState<"initial" | "list" | "create" | "edit">(
    "initial",
  );
  const [loading, setLoading] = useState(false);
  const [editingWs, setEditingWs] = useState<Workspace | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setLoading(true);
    await onCreate(formData.name, formData.description);
    setLoading(false);
    setView("list");
    setFormData({ name: "", description: "" });
  };

  const handleUpdate = async () => {
    if (!editingWs || !formData.name.trim()) return;
    setLoading(true);
    await onUpdate(editingWs.id, formData.name, formData.description);
    setLoading(false);
    setView("list");
    setEditingWs(null);
    setFormData({ name: "", description: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? All tasks in this workspace will be deleted."))
      return;
    setLoading(true);
    await onDelete(id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[480px] bg-white rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300 transform transition-all text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {view === "initial" && "Get Started"}
              {view === "list" && "Your Workspaces"}
              {view === "create" && "New Workspace"}
              {view === "edit" && "Edit Workspace"}
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {view === "initial" &&
                "Select how you want to use the Matrix today."}
              {view === "list" && "Choose a workspace to load your tasks."}
              {view === "create" && "Define a context for your productivity."}
              {view === "edit" && "Update your workspace details."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 w-full mb-6" />

        {/* Content */}
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {view === "initial" && (
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => onSelect(null)}
                className="group relative overflow-hidden flex items-center justify-between p-1 bg-[#FDF6E9] hover:bg-[#FBEED5] border border-amber-100 rounded-[2rem] transition-all text-left shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-5 p-5 w-full">
                  <div className="p-4 bg-amber-400 text-white rounded-[1.2rem] shadow-amber-200 shadow-lg group-hover:scale-110 transition-transform">
                    <Zap size={24} className="fill-white" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Test Mode
                    </h3>
                    <p className="text-slate-600/80 text-sm font-medium">
                      No persistence. Sandbox only.
                    </p>
                  </div>
                  <ChevronRight className="text-amber-400/60 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setView("list")}
                className="group relative overflow-hidden flex items-center justify-between p-1 bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-indigo-100 rounded-[2rem] transition-all text-left shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-5 p-5 w-full">
                  <div className="p-4 bg-indigo-500 text-white rounded-[1.2rem] shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform">
                    <Briefcase size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Start with Workspace
                    </h3>
                    <p className="text-slate-600/80 text-sm font-medium">
                      Persistent data and focused contexts.
                    </p>
                  </div>
                  <ChevronRight className="text-indigo-400/60 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {view === "list" && (
            <div className="space-y-4">
              {workspaces.length === 0 ? (
                <div className="text-center py-10 px-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                  <div className="p-4 bg-white text-slate-300 w-fit mx-auto rounded-full mb-4 shadow-sm border border-slate-100">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    No Workspaces Found
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Create your first workspace to start organizing.
                  </p>
                  <button
                    onClick={() => setView("create")}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all mx-auto shadow-lg shadow-indigo-200"
                  >
                    <Plus size={16} /> Create One Now
                  </button>
                </div>
              ) : (
                <>
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className="group flex items-center justify-between p-2 pl-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-[1.5rem] transition-all hover:shadow-md hover:border-slate-200"
                    >
                      <button
                        onClick={() => onSelect(ws.id)}
                        className="flex-grow flex items-center gap-4 text-left py-2"
                      >
                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 tracking-tight">
                            {ws.name}
                          </h4>
                          {ws.description && (
                            <p className="text-slate-500 text-xs font-medium line-clamp-1">
                              {ws.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                              Created{" "}
                              {new Date(ws.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <button
                          onClick={() => {
                            setEditingWs(ws);
                            setFormData({
                              name: ws.name,
                              description: ws.description || "",
                            });
                            setView("edit");
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ws.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setView("create")}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-slate-50 hover:bg-white border border-dashed border-slate-200 hover:border-indigo-200 rounded-[1.5rem] text-slate-400 hover:text-indigo-600 transition-all font-bold group mt-2"
                  >
                    <Plus
                      size={20}
                      className="group-hover:rotate-90 transition-transform"
                    />{" "}
                    Add New Workspace
                  </button>
                </>
              )}
            </div>
          )}

          {(view === "create" || view === "edit") && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                  Workspace Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Deep Work, Startup Life, Fitness"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What is the focus of this workspace?"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    view === "create" ? handleCreate() : handleUpdate()
                  }
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check size={18} />{" "}
                      {view === "create" ? "Create Workspace" : "Save Changes"}
                    </div>
                  )}
                </button>
                <button
                  onClick={() => {
                    setView("list");
                    setEditingWs(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {view !== "initial" && (
          <div className="p-6 pt-0 flex justify-center border-t border-slate-100 mt-2">
            <button
              onClick={() => setView("initial")}
              className="text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] transition-all mt-6"
            >
              ← Back to mode selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
