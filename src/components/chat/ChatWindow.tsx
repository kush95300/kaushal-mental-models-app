"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, ProposedTask } from "@/types/chat";
import { Bot, User, Smile, Sparkles, Heart, Zap } from "lucide-react";
import ProposedTaskCard from "./ProposedTaskCard";
import Link from "next/link";

interface ChatWindowProps {
  messages: ChatMessage[];
  proposedTasks?: ProposedTask[];
  onConfirmProposed?: () => void;
  onCancelProposed?: () => void;
  isSubmittingProposed?: boolean;
  avatarType?: "icon" | "image";
  avatarIcon?: string;
  avatarImage?: string;
  workspaces?: any[];
  onSelectWorkspace?: (wsId: number) => void;
  username?: string;
}

const AVATAR_ICONS = {
  Smile,
  Bot,
  Sparkles,
  Heart,
  Zap,
};

export default function ChatWindow({
  messages,
  proposedTasks,
  onConfirmProposed,
  onCancelProposed,
  isSubmittingProposed,
  avatarType = "icon",
  avatarIcon = "Smile",
  avatarImage = "",
  workspaces = [],
  onSelectWorkspace,
  username = "user",
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or when proposed tasks arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, proposedTasks]);

  if (messages.length === 0) return null;

  const renderBotAvatar = () => {
    if (avatarType === "image" && avatarImage.trim()) {
      return (
        <img
          src={avatarImage}
          alt="Bot Avatar"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }
    const IconComponent = AVATAR_ICONS[avatarIcon as keyof typeof AVATAR_ICONS] || Smile;
    return <IconComponent className="w-3.5 h-3.5 text-white" />;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
      {messages.map((msg) => {
        if (msg.role === "system") {
          return (
            <div key={msg.id} className="flex justify-center my-1.5 animate-in fade-in zoom-in-95 duration-200">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 select-none shadow-sm">
                {msg.content}
              </span>
            </div>
          );
        }

        // Intercept special grilling templates
        if (msg.content === "TUTORIAL_LINKS") {
          return (
            <div
              key={msg.id}
              className="flex flex-col gap-2.5 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl ml-9 shadow-sm"
            >
              <button
                onClick={() => {
                  localStorage.removeItem(`tour_dismissed_${username}`);
                  window.location.href = "/eisenhower-matrix?videoTour=true";
                }}
                className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-750 text-white text-xs font-black rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center gap-2"
              >
                <span>🎥</span> Play Video Onboarding Tour
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(`tutorial_dismissed_eisenhower_${username}`);
                  window.location.href = "/eisenhower-matrix?tutorial=true";
                }}
                className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-xs font-black rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center gap-2"
              >
                <span>🎯</span> Start Interactive Matrix Walkthrough
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(`tutorial_dismissed_analytics_${username}`);
                  window.location.href = "/analytics?tutorial=true";
                }}
                className="w-full text-left px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm flex items-center gap-2"
              >
                <span>📊</span> Start Analytics Dashboard Tutorial
              </button>
            </div>
          );
        }

        if (msg.content === "FAQ_LINK") {
          return (
            <div key={msg.id} className="p-1 ml-9">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
              >
                ❓ Go to FAQ Page
              </Link>
            </div>
          );
        }

        if (msg.content === "WORKSPACE_CHOOSER") {
          return (
            <div
              key={msg.id}
              className="flex flex-col gap-1.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl ml-9"
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Available Workspaces</p>
              <div className="flex flex-wrap gap-2">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => onSelectWorkspace?.(ws.id)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-center gap-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ws.color || "indigo" }} />
                    {ws.name}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black overflow-hidden
                ${isUser
                  ? "bg-indigo-600"
                  : "bg-gradient-to-br from-violet-500 to-indigo-600"
                }
              `}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : renderBotAvatar()}
            </div>

            {/* Bubble */}
            <div
              className={`
                relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isUser
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 shadow-sm rounded-bl-md"
                }
              `}
            >
              {msg.isStreaming ? (
                <span>
                  {msg.content}
                  <span className="inline-block w-1.5 h-3.5 bg-current ml-0.5 animate-pulse rounded-sm opacity-70" />
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        );
      })}

      {proposedTasks && proposedTasks.length > 0 && (
        <div className="mt-2">
          <ProposedTaskCard
            tasks={proposedTasks}
            onConfirm={onConfirmProposed!}
            onCancel={onCancelProposed!}
            isSubmitting={isSubmittingProposed!}
          />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}


