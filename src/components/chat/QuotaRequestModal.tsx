"use client";

import { useState, useRef, useCallback } from "react";
import { AlertCircle, MessageSquarePlus, Send } from "lucide-react";

interface QuotaRequestModalProps {
  used: number;
  limit: number;
  period: string;
  onClose: () => void;
}

export default function QuotaRequestModal({ used, limit, period, onClose }: QuotaRequestModalProps) {
  const [extra, setExtra] = useState(10);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (extra <= 0) { setError("Please enter a positive number."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat/quota-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedExtra: extra, reason: reason.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Request failed."); }
      else { setSuccess(true); }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[46000] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-amber-900 dark:text-amber-200">Message Limit Reached</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                You've used {used}/{limit} messages this {period.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>

        {!success ? (
          <div className="p-5 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Request additional messages from your admin. They'll be notified and can approve all or part of your request.
            </p>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                How many extra messages do you need?
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExtra(Math.max(1, extra - 5))}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >−</button>
                <input
                  type="number"
                  min={1}
                  value={extra}
                  onChange={(e) => setExtra(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  onClick={() => setExtra(extra + 5)}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >+</button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 200))}
                rows={2}
                maxLength={200}
                placeholder="e.g. Working on a project deadline this week…"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              />
              <p className="text-right text-[10px] text-slate-400 mt-0.5">{reason.length}/200</p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60 shadow-sm shadow-indigo-500/30"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? "Sending…" : "Send Request to Admin"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <MessageSquarePlus className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-black text-slate-800 dark:text-slate-100">Request Sent!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your admin has been notified. You'll see the approved messages added to your quota once approved.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors mt-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
