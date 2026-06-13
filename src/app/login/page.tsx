"use client";

import { useState, useEffect } from "react";
import { login, requestAccount, isAdminPasswordDefault, requestPasswordReset } from "@/actions/auth";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  KeyRound,
  User as UserIcon,
  LogIn,
  UserPlus,
  Info,
} from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "request" | "forgot">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminBanner, setShowAdminBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isAdminPasswordDefault().then((res) => setShowAdminBanner(res));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const res = await login(username, password);
      if (res.success) {
        const tourDismissed = localStorage.getItem(`tour_dismissed_${username}`);
        if (!tourDismissed) {
          router.push("/eisenhower-matrix");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        setError(res.error || "Login failed");
        setLoading(false);
      }
    } else if (mode === "request") {
      const res = await requestAccount(username, password);
      if (res.success) {
        setSuccess(
          "Account requested successfully! An administrator will review your request.",
        );
        setUsername("");
        setPassword("");
        setMode("login");
      } else {
        setError(res.error || "Failed to request account");
      }
      setLoading(false);
    } else {
      const res = await requestPasswordReset(username);
      if (res.success) {
        setSuccess("Password reset request submitted successfully. Please contact admin to get your temporary password.");
        setUsername("");
      } else {
        setError(res.error || "Failed to request password reset");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-amber-100/30 dark:bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 dark:border-slate-800/80 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-3 h-3" /> The Wisdom Lab
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
            {mode === "login" ? "Welcome Back" : mode === "request" ? "Request Account" : "Reset Password"}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {mode === "login"
              ? "Enter your credentials to access your workspace."
              : mode === "request"
              ? "Submit a request to create a new workspace account."
              : "Enter your username to request a password reset."}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== "forgot" && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("request");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === "request"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Request Account
            </button>
          </div>
        )}

        {mode === "forgot" && (
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center gap-1 text-xs font-black text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {mode === "login" && showAdminBanner && (
          <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl flex items-start gap-2.5 text-indigo-900 dark:text-indigo-200">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed font-medium">
              <span className="font-bold">Default Admin Credentials:</span>{" "}
              username:{" "}
              <code className="bg-indigo-100 dark:bg-indigo-800/60 px-1 py-0.5 rounded font-mono font-bold">
                admin
              </code>{" "}
              / password:{" "}
              <code className="bg-indigo-100 dark:bg-indigo-800/60 px-1 py-0.5 rounded font-mono font-bold">
                admin
              </code>
              <div className="mt-1 text-[11px] text-indigo-600/80 dark:text-indigo-300/80">
                You can change your password anytime after logging in.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-bold text-center">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                }}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">
                {mode === "login" ? "Authenticating..." : mode === "request" ? "Submitting..." : "Requesting..."}
              </span>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            ) : mode === "request" ? (
              <>
                <UserPlus className="w-5 h-5" /> Request Account
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" /> Request Password Reset
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
