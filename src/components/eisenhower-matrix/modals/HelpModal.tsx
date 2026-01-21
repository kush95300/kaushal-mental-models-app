"use client";

import React from "react";
import { X, Target, Zap, Clock, Users2, Trash2 } from "lucide-react";

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
    <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar">
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600">
            <Target size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              The Eisenhower Matrix
            </h3>
            <p className="text-sm font-semibold text-indigo-600/70 uppercase tracking-widest">
              Mastering the Art of Prioritization
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
        >
          <X size={28} className="text-slate-400" />
        </button>
      </div>

      <div className="mb-10 bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50">
        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
          The{" "}
          <span className="text-indigo-600 font-black">Eisenhower Matrix</span>{" "}
          is a legendary time management framework that helps you distinguish
          between tasks that are{" "}
          <span className="italic font-bold text-rose-500">Urgent</span> and
          those that are truly{" "}
          <span className="italic font-bold text-indigo-500">Important</span>.
          By categorizing your workload into four quadrants, you can escape the
          &quot;Urgency Trap,&quot; stop reacting to noise, and start investing
          your energy in deep work, strategic planning, and long-term growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Q1 */}
        <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
              <Zap size={18} />
            </div>
            <h4 className="font-black text-rose-700 uppercase tracking-wider text-sm">
              Quadrant 1: Do First
            </h4>
          </div>
          <p className="text-xs font-bold text-rose-600/80 mb-4 tracking-tight">
            URGENT & IMPORTANT
          </p>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Tasks that require immediate action. These are crises, deadlines, or
            pressing problems.
            <br />
            <br />
            <span className="text-[10px] font-black uppercase text-rose-500 bg-white/50 px-2 py-1 rounded-md">
              Strategy: Do it now
            </span>
          </p>
        </div>

        {/* Q2 */}
        <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Clock size={18} />
            </div>
            <h4 className="font-black text-indigo-700 uppercase tracking-wider text-sm">
              Quadrant 2: Schedule
            </h4>
          </div>
          <p className="text-xs font-bold text-indigo-600/80 mb-4 tracking-tight">
            IMPORTANT BUT NOT URGENT
          </p>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            The most critical quadrant for long-term growth. Planning, study,
            exercise, and relationship building.
            <br />
            <br />
            <span className="text-[10px] font-black uppercase text-indigo-500 bg-white/50 px-2 py-1 rounded-md">
              Strategy: Schedule it
            </span>
          </p>
        </div>

        {/* Q3 */}
        <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200">
              <Users2 size={18} />
            </div>
            <h4 className="font-black text-amber-700 uppercase tracking-wider text-sm">
              Quadrant 3: Delegate
            </h4>
          </div>
          <p className="text-xs font-bold text-amber-600/80 mb-4 tracking-tight">
            URGENT BUT NOT IMPORTANT
          </p>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Tasks that feel pressing but don&apos;t contribute to your goals.
            Meetings, phone calls, or emails.
            <br />
            <br />
            <span className="text-[10px] font-black uppercase text-amber-600 bg-white/50 px-2 py-1 rounded-md">
              Strategy: Let others help
            </span>
          </p>
        </div>

        {/* Q4 */}
        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-500 text-white rounded-xl shadow-lg shadow-slate-200">
              <Trash2 size={18} />
            </div>
            <h4 className="font-black text-slate-700 uppercase tracking-wider text-sm">
              Quadrant 4: Eliminate
            </h4>
          </div>
          <p className="text-xs font-bold text-slate-600/80 mb-4 tracking-tight">
            NEITHER URGENT NOR IMPORTANT
          </p>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Time-wasters and distractions. Avoid these as much as possible to
            stay focused.
            <br />
            <br />
            <span className="text-[10px] font-black uppercase text-slate-500 bg-white/50 px-2 py-1 rounded-md">
              Strategy: Stop doing
            </span>
          </p>
        </div>
      </div>

      <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-center">
        <p className="text-sm text-slate-300 font-bold italic">
          &quot;What is important is seldom urgent and what is urgent is seldom
          important.&quot;
        </p>
        <p className="text-[10px] text-indigo-400 font-black uppercase mt-2 tracking-widest">
          — Dwight D. Eisenhower
        </p>
      </div>
    </div>
  </div>
);
