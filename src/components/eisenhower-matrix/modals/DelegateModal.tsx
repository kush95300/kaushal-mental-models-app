"use client";

import React from "react";
import { X, UserCog, UserPlus, Trash2 } from "lucide-react";
import { Delegate } from "@/types/eisenhower";

interface DelegateModalProps {
  delegates: Delegate[];
  newDelegateName: string;
  setNewDelegateName: (name: string) => void;
  addDelegate: () => void;
  removeDelegate: (id: number) => void;
  onClose: () => void;
}

export const DelegateModal: React.FC<DelegateModalProps> = ({
  delegates,
  newDelegateName,
  setNewDelegateName,
  addDelegate,
  removeDelegate,
  onClose,
}) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white dark:border-slate-800 animate-in zoom-in-95 duration-500 transition-colors">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-500 dark:text-amber-400">
            <UserCog size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Manage Delegates
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 font-sans">
              Build your high-performance team
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
        >
          <X size={24} className="text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 focus-within:border-amber-200 dark:focus-within:border-amber-900/50 transition-all">
          <input
            type="text"
            value={newDelegateName}
            onChange={(e) => setNewDelegateName(e.target.value)}
            placeholder="Enter teammate name..."
            className="flex-grow px-4 bg-transparent outline-none font-bold text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-200 font-sans"
          />
          <button
            onClick={addDelegate}
            className="p-3 px-5 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 dark:hover:bg-amber-600 transition-all shadow-lg active:scale-95 font-sans"
          >
            Add Team Member
          </button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 font-sans">
          {delegates.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center opacity-30 dark:opacity-20">
              <UserPlus size={48} className="mb-4 text-slate-300" />
              <p className="font-bold uppercase text-[10px] tracking-[0.2em] text-center">
                Your bench is empty.
                <br />
                Add teammates above.
              </p>
            </div>
          ) : (
            delegates.map((delegate) => (
              <div
                key={delegate.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl group/item hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-sm">
                    {delegate.name.charAt(0)}
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">
                    {delegate.name}
                  </span>
                </div>
                <button
                  onClick={() => removeDelegate(delegate.id)}
                  disabled={delegate.name === "Self"}
                  className={`p-2 rounded-xl transition-all opacity-0 group-hover/item:opacity-100 ${
                    delegate.name === "Self"
                      ? "text-slate-200 dark:text-slate-800 cursor-not-allowed"
                      : "text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);
