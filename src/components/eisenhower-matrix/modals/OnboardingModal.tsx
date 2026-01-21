"use client";

import React from "react";
import { Target, Zap } from "lucide-react";

interface OnboardingModalProps {
  setAnalyticsStart: (date: string | null) => void;
  setIsTestMode: (mode: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  setAnalyticsStart,
  setIsTestMode,
  setShowOnboarding,
}) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 duration-500 text-center transition-colors">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 dark:text-indigo-400 ring-8 ring-indigo-50/50 dark:ring-indigo-900/10">
        <Target size={40} className="animate-pulse" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
        Ready to Master Your Time?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 font-semibold mb-8 leading-relaxed font-sans">
        To provide accurate productivity analytics, we need to know when
        you&apos;re starting your journey. Would you like to set your tracking
        start date to today?
      </p>
      <div className="flex flex-col gap-3 font-sans">
        <button
          onClick={() => setAnalyticsStart(new Date().toISOString())}
          className="w-full py-5 rounded-3xl bg-indigo-600 dark:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
        >
          Yes, Start Today
        </button>
        <button
          onClick={() => {
            setIsTestMode(true);
            setShowOnboarding(false);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-700 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
        >
          <Zap size={16} className="fill-amber-500" /> TRY IN TEST MODE
        </button>
      </div>
    </div>
  </div>
);
