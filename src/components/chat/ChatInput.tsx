"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
  /** ms of silence before auto-stopping mic. Default: 2500 */
  silenceTimeoutMs?: number;
  /** If true, auto-submits after silence timeout. Default: false */
  autoSubmitAfterSilence?: boolean;
  botName?: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  silenceTimeoutMs = 2500,
  autoSubmitAfterSilence = false,
  botName = "Betu",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState(0); // 0 = not counting

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [value]);

  const stopRecording = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    setSilenceCountdown(0);
    setIsRecording(false);
    recognitionRef.current?.stop();
  }, []);

  const startSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setSilenceCountdown(silenceTimeoutMs);

    // Count down every 100ms for the ring UI
    const interval = setInterval(() => {
      setSilenceCountdown((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    silenceTimerRef.current = setTimeout(() => {
      clearInterval(interval);
      stopRecording();
      if (autoSubmitAfterSilence) onSend();
    }, silenceTimeoutMs);
  }, [silenceTimeoutMs, autoSubmitAfterSilence, onSend, stopRecording]);

  const toggleMic = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (e: any) => {
      // Clear any silence timer when new speech arrives
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setSilenceCountdown(0);

      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onChange(value + (value ? " " : "") + finalTranscript.trim());
      }
    };

    recognition.onspeechend = () => {
      // Speech paused — start silence countdown
      startSilenceTimer();
    };

    recognition.onerror = () => stopRecording();
    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
      setSilenceCountdown(0);
    };

    recognition.start();
  }, [isRecording, value, onChange, startSilenceTimer, stopRecording]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  // Countdown ring SVG — shows remaining silence time
  const ringProgress = silenceCountdown > 0 ? silenceCountdown / silenceTimeoutMs : 0;
  const circumference = 2 * Math.PI * 10; // r=10
  const dash = ringProgress * circumference;

  return (
    <div className="px-3 pb-3 pt-1">
      <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${botName} anything or add a task…`}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none disabled:opacity-50 leading-snug py-1 max-h-[120px] overflow-y-auto"
          style={{ minHeight: "28px" }}
        />

        {/* Mic button */}
        <button
          onClick={toggleMic}
          disabled={disabled}
          title={isRecording ? "Stop recording" : "Voice input"}
          className={`
            relative flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200
            ${isRecording
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
              : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            }
            disabled:opacity-40
          `}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}

          {/* Silence countdown ring */}
          {silenceCountdown > 0 && (
            <svg
              className="absolute inset-0 w-8 h-8 -rotate-90"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12" cy="12" r="10"
                fill="none"
                stroke="rgb(251 113 133)"
                strokeWidth="2"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
                className="transition-all"
              />
            </svg>
          )}
        </button>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/30"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-1.5">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
