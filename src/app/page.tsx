"use client";

import Link from "next/link";
import {
  Sparkles,
  LayoutGrid,
  Zap,
  Scissors,
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  Linkedin,
  Github,
  ExternalLink,
  Moon,
  Sun,
  UserCog,
  KeyRound,
  LogOut,
  LogIn,
  User as UserIcon,
  X,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";
import { getCurrentUser, logout, changeUserPassword } from "@/actions/auth";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    getCurrentUser().then((res) => {
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    });
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    setPassLoading(true);

    const res = await changeUserPassword(oldPassword, newPassword);
    if (res.success) {
      setPassSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setShowPassModal(false);
        setPassSuccess("");
      }, 1500);
    } else {
      setPassError(res.error || "Failed to change password");
    }
    setPassLoading(false);
  };

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
    <main className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 relative overflow-hidden text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8 flex flex-col transition-colors">
      {/* Top Navigation Bar */}
      <div className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between max-w-7xl mx-auto pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white dark:border-slate-800 shadow-lg">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-spin-slow" />
          <span className="font-black text-sm tracking-wider uppercase text-slate-800 dark:text-white">
            The Wisdom Lab
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 pl-4 rounded-2xl border border-white dark:border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 mr-1">
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                  {currentUser.username}
                </span>
                {currentUser.isAdmin && (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              {currentUser.isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <UserCog className="w-3.5 h-3.5" /> User Management
                </Link>
              )}

              <button
                onClick={() => setShowPassModal(true)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                title="Change Password"
              >
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </button>

              <button
                onClick={() => logout()}
                className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white dark:border-slate-800 shadow-lg text-slate-500 dark:text-amber-400 hover:scale-110 active:scale-95 transition-all group"
            title="Toggle Theme"
          >
            {mounted && theme === "dark" ? (
              <Sun
                size={20}
                className="group-hover:rotate-45 transition-transform"
              />
            ) : (
              <Moon
                size={20}
                className="group-hover:-rotate-12 transition-transform"
              />
            )}
          </button>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-10%] opacity-[0.05] dark:opacity-[0.03] text-amber-500 animate-pulse-slow">
          <Lightbulb size={600} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[10%] left-[-5%] opacity-[0.03] dark:opacity-[0.02] text-indigo-500">
          <Lightbulb size={400} strokeWidth={0.5} />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-blob-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-amber-100/30 dark:bg-amber-900/10 rounded-full blur-[120px] animate-blob-slow animation-delay-2000" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01]"
          style={{
            backgroundImage:
              "radial-gradient(#4f46e5 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex flex-col items-center justify-center pt-24">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/80 dark:border-slate-800/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Sparkles className="w-3 h-3" /> The Wisdom Lab
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
            Mental{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Models
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-xl max-w-2xl mx-auto">
            Frameworks for better thinking, decision making, and productivity.
            Select a model to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4">
          {models.map((model) =>
            model.comingSoon ? (
              <div
                key={model.id}
                className="group relative flex flex-col p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-none text-left transition-all duration-500 overflow-hidden opacity-60 cursor-not-allowed grayscale"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800">
                    {model.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                    Locked
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-3">
                  {model.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  {model.description}
                </p>
                <div className="mt-auto flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
                  Stay Tuned
                </div>
              </div>
            ) : (
              <div key={model.id} className="relative group">
                <Link
                  href={model.href || "#"}
                  className="group relative flex flex-col p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-none text-left transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 w-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 -mr-8 -mt-8 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-lg transition-all">
                      {model.icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                      {model.tag}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {model.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                    {model.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
                    Launch App <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </Link>
                {model.id === "EISENHOWER" && (
                  <Link
                    href="/eisenhower-matrix?showHelp=true"
                    className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all z-20"
                    title="Read about this model"
                  >
                    <HelpCircle className="w-8 h-8" />
                  </Link>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Change Password</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your account security credentials.
                </p>
              </div>
            </div>

            {passError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold text-center">
                {passError}
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold text-center">
                {passSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-colors mt-6 disabled:opacity-50"
              >
                {passLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-16 py-8 text-center relative z-10 group">
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 mx-auto rounded-full mb-6 transition-all group-hover:w-24 group-hover:bg-indigo-400" />
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">
          Turning mental models into action
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 tracking-tight">
            Created with{" "}
            <span className="text-rose-500 animate-pulse inline-block mx-0.5">
              ❤️
            </span>{" "}
            by{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                const links = [
                  "https://www.linkedin.com/in/sonikaushal/",
                  "https://github.com/kush95300/",
                  "https://flowcv.me/kaushal-soni",
                ];
                const randomLink =
                  links[Math.floor(Math.random() * links.length)];
                window.open(randomLink, "_blank", "noopener,noreferrer");
              }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-extrabold hover:opacity-80 transition-opacity cursor-pointer inline-block"
            >
              Kaushal Soni
            </a>
          </p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <a
            href="https://www.linkedin.com/in/sonikaushal/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md transition-all shadow-sm"
            title="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="https://github.com/kush95300/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all shadow-sm"
            title="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://flowcv.me/kaushal-soni"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-md transition-all shadow-sm"
            title="FlowCV Portfolio"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </footer>
    </main>
  );
}
