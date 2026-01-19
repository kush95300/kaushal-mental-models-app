"use client";

import Link from "next/link";
import {
  Sparkles,
  LayoutGrid,
  Zap,
  Scissors,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";

export default function Home() {
  const models = [
    {
      id: "EISENHOWER",
      title: "Eisenhower Matrix",
      description: "Prioritize tasks based on urgency and importance.",
      icon: <LayoutGrid className="w-8 h-8 text-indigo-500" />,
      color: "from-indigo-500 to-purple-600",
      tag: "Productivity",
      href: "/eisenhower-matrix",
    },
    {
      id: "PARETO",
      title: "Pareto Principle",
      description: "Focus on the 20% of effort that produces 80% of results.",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      color: "from-amber-400 to-orange-600",
      tag: "Efficiency",
      comingSoon: true,
    },
    {
      id: "FIRST_PRINCIPLES",
      title: "First Principles",
      description: "Deconstruct complex problems to basic truths.",
      icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
      color: "from-emerald-400 to-teal-600",
      tag: "Thinking",
      comingSoon: true,
    },
    {
      id: "OCCAM",
      title: "Occam's Razor",
      description: "The simplest explanation is usually the correct one.",
      icon: <Scissors className="w-8 h-8 text-rose-500" />,
      color: "from-rose-400 to-pink-600",
      tag: "Logic",
      comingSoon: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] relative overflow-hidden text-slate-900 font-sans p-4 md:p-8 flex flex-col">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-10%] opacity-[0.05] text-amber-500 animate-pulse-slow">
          <Lightbulb size={600} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[10%] left-[-5%] opacity-[0.03] text-indigo-500">
          <Lightbulb size={400} strokeWidth={0.5} />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[120px] animate-blob-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-amber-100/30 rounded-full blur-[120px] animate-blob-slow animation-delay-2000" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(#4f46e5 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex flex-col items-center justify-center">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="w-3 h-3" /> The Wisdom Lab
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">
            Mental{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
              Models
            </span>
          </h1>
          <p className="text-slate-500 font-semibold text-xl max-w-2xl mx-auto">
            Frameworks for better thinking, decision making, and productivity.
            Select a model to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4">
          {models.map((model) =>
            model.comingSoon ? (
              <div
                key={model.id}
                className="group relative flex flex-col p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-200/50 text-left transition-all duration-500 overflow-hidden opacity-60 cursor-not-allowed grayscale"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-3xl bg-slate-50">
                    {model.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-100 rounded-full">
                    Locked
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">
                  {model.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                  {model.description}
                </p>
                <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                  Stay Tuned
                </div>
              </div>
            ) : (
              <Link
                key={model.id}
                href={model.href || "#"}
                className="group relative flex flex-col p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-200/50 text-left transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:shadow-indigo-200/50 hover:border-indigo-200"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 -mr-8 -mt-8 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-3xl bg-slate-50 group-hover:bg-white group-hover:shadow-lg transition-all">
                    {model.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-100 rounded-full">
                    {model.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
                  {model.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                  {model.description}
                </p>
                <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  Launch App <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </Link>
            ),
          )}
        </div>
      </div>

      <footer className="mt-16 py-8 text-center relative z-10 group">
        <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6 transition-all group-hover:w-24 group-hover:bg-indigo-400" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
          Turning mental models into action
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200" />
          <p className="text-xs font-bold text-slate-500 tracking-tight">
            Created with{" "}
            <span className="text-rose-500 animate-pulse inline-block mx-0.5">
              ❤️
            </span>{" "}
            by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold">
              Kaushal Soni
            </span>
          </p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200" />
        </div>
      </footer>
    </main>
  );
}
