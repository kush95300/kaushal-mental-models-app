"use client";

import React, { useState } from "react";
import { X, Settings, Clock, Save, Loader2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxDailyMinutes: number;
  onUpdateMaxMinutes: (minutes: number) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  maxDailyMinutes,
  onUpdateMaxMinutes,
}) => {
  const [hours, setHours] = useState(maxDailyMinutes / 60);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    await onUpdateMaxMinutes(hours * 60);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-white/50 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <Settings size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Clock size={16} className="text-indigo-500" />
              Max Daily Work Hours
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Set your maximum desired work hours per day. We&apos;ll alert you
              if your &quot;Do&quot; quadrant exceeds this limit.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="16"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="min-w-[4rem] text-center font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                {hours}h
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
