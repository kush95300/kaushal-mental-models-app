"use client";

import { useEffect, useState } from "react";
import { getFAQs, submitFAQQuestion } from "@/actions/faq";
import { ChevronDown, MessageSquare, Send, ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ id: number; username: string } | null>(null);

  // New question form
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchFAQs = async () => {
    setLoading(true);
    const res = await getFAQs();
    if (res.success && res.data) {
      setFaqs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFAQs();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data?.user ?? null))
      .catch(() => setSession(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    setError("");
    setSuccess(false);

    const res = await submitFAQQuestion(question);
    if (res.success) {
      setSuccess(true);
      setQuestion("");
    } else {
      setError(res.error || "Failed to submit question.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 font-sans text-slate-900 dark:text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-indigo-500" />
              Frequently Asked Questions
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Find quick answers or submit a question to the administrator.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FAQ Accordion list */}
          <div className="md:col-span-2 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-48 opacity-50">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">
                No questions found.
              </div>
            ) : (
              faqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="w-full px-5 py-4 text-left font-bold text-base md:text-lg flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-indigo-500" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-350 border-t border-slate-100 dark:border-slate-800/60 animate-in slide-in-from-top-2 duration-150">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Submit Question Card */}
          <div className="md:col-span-1">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <h3 className="font-black text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Ask a Question
              </h3>
              
              {!session ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You must be signed in to submit questions for administration review.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Submit your question. Once approved and answered by our administrators, it will appear here.
                  </p>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">
                      Your Question
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
                      rows={4}
                      maxLength={300}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm text-slate-800 dark:text-slate-100 resize-none"
                      placeholder="e.g. How can I export my weekly analytics summary?"
                      required
                    />
                    <p className="text-right text-[10px] text-slate-400 mt-1">{question.length}/300</p>
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-rose-500">{error}</p>
                  )}
                  {success && (
                    <p className="text-xs font-bold text-emerald-500">
                      Sent! Admin will review and answer soon.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !question.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Sending..." : "Submit Question"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
