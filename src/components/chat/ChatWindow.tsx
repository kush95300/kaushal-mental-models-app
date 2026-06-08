"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { Bot, User } from "lucide-react";

interface ChatWindowProps {
  messages: ChatMessage[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black
                ${isUser
                  ? "bg-indigo-600"
                  : "bg-gradient-to-br from-violet-500 to-indigo-600"
                }
              `}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
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
      <div ref={bottomRef} />
    </div>
  );
}
