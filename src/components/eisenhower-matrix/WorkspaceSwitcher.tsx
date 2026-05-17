import React, { useState } from "react";
import {
  Briefcase,
  ChevronDown,
  Plus,
  User,
  Check,
  Code,
  BookOpen,
  Heart,
  Smile,
  Compass,
  Flame,
  Globe,
  Laptop,
  Lightbulb,
  Music,
  Palette,
  Rocket,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Workspace } from "@/types/eisenhower";
import { Tooltip } from "../ui/Tooltip";

export const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Code,
  BookOpen,
  Heart,
  Smile,
  Compass,
  Flame,
  Globe,
  Laptop,
  Lightbulb,
  Music,
  Palette,
  Rocket,
  Target,
  Trophy,
  Zap,
};

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspaceId: number;
  onSwitch: (id: number) => void;
  onAdd: (name: string, color: string) => void;
  onManage: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  workspaces,
  activeWorkspaceId,
  onSwitch,
  onAdd,
  onManage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName, "indigo");
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div className="relative z-10 hover:z-[9999]">
      <Tooltip content="Workspace Switcher: Click to switch between Work, Personal, or custom workspaces." align="left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:hover:bg-white/20 backdrop-blur-md border border-slate-900/10 dark:border-white/20 rounded-2xl transition-all group"
        >
          <div
            className={`p-1.5 rounded-lg ${
              activeWorkspace?.id === 2
                ? "bg-rose-500/20 text-rose-500"
                : "bg-indigo-500/20 text-indigo-500"
            }`}
          >
            {(() => {
              const IconComponent = ICON_MAP[activeWorkspace?.icon || "Briefcase"] || (activeWorkspace?.name === "Personal" ? User : Briefcase);
              return <IconComponent size={18} />;
            })()}
          </div>
          <span className="text-sm font-black text-slate-700 dark:text-white tracking-wide font-sans">
            {activeWorkspace?.name || "Select Workspace"}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 dark:text-white/50 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </Tooltip>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="p-3 space-y-1 font-sans">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSwitch(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    ws.id === activeWorkspaceId
                      ? "bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white"
                      : "text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={`Switch to ${ws.name} workspace`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        ws.name === "Personal"
                          ? "bg-rose-500/20 text-rose-500"
                          : "bg-indigo-500/20 text-indigo-500"
                      }`}
                    >
                      {(() => {
                        const IconComponent = ICON_MAP[ws.icon || "Briefcase"] || (ws.name === "Personal" ? User : Briefcase);
                        return <IconComponent size={16} />;
                      })()}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest text-[10px]">
                      {ws.name}
                    </span>
                  </div>
                  {ws.id === activeWorkspaceId && (
                    <Check size={14} className="text-indigo-400" />
                  )}
                </button>
              ))}

              <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />

              {!showAdd ? (
                <div className="space-y-1">
                  <button
                    onClick={() => setShowAdd(true)}
                    className="w-full flex items-center gap-3 p-3 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                    title="Create a new workspace"
                  >
                    <Plus size={16} />
                    <span className="text-sm font-bold uppercase tracking-widest text-[10px]">
                      New Workspace
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onManage();
                    }}
                    className="w-full flex items-center gap-3 p-3 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                    title="Manage workspaces"
                  >
                    <Briefcase size={16} />
                    <span className="text-sm font-bold uppercase tracking-widest text-[10px]">
                      Manage Workspaces
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") setShowAdd(false);
                    }}
                    placeholder="Workspace name..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowAdd(false)}
                      className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
