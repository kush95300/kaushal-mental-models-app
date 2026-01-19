"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

interface CompletionModalProps {
  isOpen: boolean;
  taskContent: string;
  estimatedMinutes: number | null;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  taskContent,
  estimatedMinutes,
  onClose,
  onConfirm,
}) => {
  const [actualMinutes, setActualMinutes] = useState<string>(
    estimatedMinutes?.toString() || "",
  );

  console.log("CompletionModal render, isOpen:", isOpen);
  if (!isOpen) return null;

  const handleSubmit = () => {
    const minutes = parseInt(actualMinutes) || 0;
    onConfirm(minutes);
    setActualMinutes("");
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-black text-slate-900 mb-2 font-display uppercase tracking-tight">
          Task Complete!
        </h3>
        <p className="text-sm font-bold text-slate-500 mb-6">{taskContent}</p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
              How long did it actually take?
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <input
                  type="number"
                  min="0"
                  value={Math.floor((parseInt(actualMinutes) || 0) / 60)}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    const m = (parseInt(actualMinutes) || 0) % 60;
                    setActualMinutes((h * 60 + m).toString());
                  }}
                  className="w-full bg-transparent outline-none font-black text-2xl text-slate-700 text-center placeholder:text-slate-200"
                  placeholder="0"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  HR
                </span>
              </div>
              <span className="text-slate-300 font-bold mb-4">:</span>
              <div className="flex-1 bg-white rounded-2xl px-4 py-2 flex flex-col items-center justify-center shadow-sm border border-slate-100 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={(parseInt(actualMinutes) || 0) % 60}
                  onChange={(e) => {
                    const h = Math.floor((parseInt(actualMinutes) || 0) / 60);
                    let m = parseInt(e.target.value) || 0;
                    if (m > 59) m = 59;
                    setActualMinutes((h * 60 + m).toString());
                  }}
                  className="w-full bg-transparent outline-none font-black text-2xl text-slate-700 text-center placeholder:text-slate-200"
                  placeholder="0"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  MIN
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            Mark Done
          </button>
        </div>
      </div>
    </div>
  );
};
