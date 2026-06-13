"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Smile, Trash2, X, LogIn, Sparkles, Pencil, Check, Volume2, VolumeX, Settings, Zap, Bot, Heart, Image as ImageIcon, Minus, HelpCircle, Plus } from "lucide-react";
import { ChatMessage, LLMProvider, ProposedTask, LLMStructuredResponse, QuotaStatus } from "@/types/chat";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import LLMSwitcher from "./LLMSwitcher";
import SuggestedPrompts from "./SuggestedPrompts";
import QuotaRequestModal from "./QuotaRequestModal";
import { getWorkspaces } from "@/actions/workspace";

interface AiChatbotProps {
  context: "home" | "matrix";
  workspaceId?: number;
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Robustly strip JSON strings or formatting blocks from LLM responses */
function sanitizeReply(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj.reply) return obj.reply;
      if (obj.clarificationQuestion) return obj.clarificationQuestion;
    } catch {}
  }
  if (text.includes("```json")) {
    const clean = text.replace(/```json[\s\S]*?```/g, "").trim();
    if (clean) return clean;
  }
  return text;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export default function AiChatbot({ context, workspaceId }: AiChatbotProps) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ id: number; username: string } | null | "loading">("loading");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeProvider, setActiveProvider] = useState<LLMProvider | null>(null);

  const [proposedTasks, setProposedTasks] = useState<ProposedTask[]>([]);
  const [isSubmittingTasks, setIsSubmittingTasks] = useState(false);

  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);

  // ── Bot customization states ──────────────────────────────────────────────
  const [botName, setBotName] = useState("Betu");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  const [avatarType, setAvatarType] = useState<"icon" | "image">("image");
  const [avatarIcon, setAvatarIcon] = useState<string>("Smile");
  const [avatarImage, setAvatarImage] = useState<string>("https://miro.medium.com/v2/resize:fit:2400/1*wqbW85G-0PYtTiJyRCWeMw.jpeg");
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<"english" | "hinglish">("english");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [logMode, setLogMode] = useState(false);

  // ── Drag & Movement states ──────────────────────────────────────────────────
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // ── Workspace states ────────────────────────────────────────────────────────
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(workspaceId ?? null);
  const [pendingPromptAfterWorkspace, setPendingPromptAfterWorkspace] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Text to Speech states ───────────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Auth & Workspaces check on mount ─────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data?.user ?? null))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    if (session && session !== "loading") {
      getWorkspaces().then((res) => {
        if (res.success && res.data) {
          setWorkspaces(res.data);
        }
      });
    }
  }, [session]);

  // ── Load custom bot configuration from localStorage ──────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("chatbot_name");
    if (saved && saved.trim()) setBotName(saved.trim());

    const savedType = localStorage.getItem("chatbot_avatar_type") || "image";
    const savedIcon = localStorage.getItem("chatbot_avatar_icon") || "Smile";
    const savedImage = localStorage.getItem("chatbot_avatar_image") || "https://miro.medium.com/v2/resize:fit:2400/1*wqbW85G-0PYtTiJyRCWeMw.jpeg";
    if (savedType === "icon" || savedType === "image") setAvatarType(savedType);
    if (savedIcon) setAvatarIcon(savedIcon);
    if (savedImage) setAvatarImage(savedImage);

    const savedLanguage = localStorage.getItem("chatbot_language");
    if (savedLanguage === "english" || savedLanguage === "hinglish") {
      setLanguage(savedLanguage);
    }

    const savedLogMode = localStorage.getItem("chatbot_routing_logs");
    setLogMode(savedLogMode === "true");
  }, []);

  // ── Load chat sessions from localStorage once session is ready ───────────────
  useEffect(() => {
    if (session && session !== "loading" && session.username) {
      const savedSessionsStr = localStorage.getItem(`chatbot_sessions_${session.username}`);
      const savedActiveId = localStorage.getItem(`chatbot_active_session_id_${session.username}`);
      
      let loadedSessions: ChatSession[] = [];
      let activeId = savedActiveId;

      if (savedSessionsStr) {
        try {
          loadedSessions = JSON.parse(savedSessionsStr);
        } catch (e) {
          console.error("Failed to parse chatbot sessions:", e);
        }
      }

      if (loadedSessions.length === 0) {
        const newSessionId = uuid();
        const initialSession: ChatSession = {
          id: newSessionId,
          title: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
        };
        loadedSessions = [initialSession];
        activeId = newSessionId;
        localStorage.setItem(`chatbot_sessions_${session.username}`, JSON.stringify(loadedSessions));
        localStorage.setItem(`chatbot_active_session_id_${session.username}`, newSessionId);
      }

      setSessions(loadedSessions);

      const hasActive = loadedSessions.some((s) => s.id === activeId);
      if (!hasActive) {
        activeId = loadedSessions[0].id;
        localStorage.setItem(`chatbot_active_session_id_${session.username}`, activeId);
      }

      setActiveSessionId(activeId);
      
      const activeSessionObj = loadedSessions.find((s) => s.id === activeId);
      if (activeSessionObj) {
        const formatted = activeSessionObj.messages.map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMessages(formatted);
      }

      setHistoryLoaded(true);
    }
  }, [session]);

  // ── Save active chat messages to current session in sessions list ────────────
  useEffect(() => {
    if (!historyLoaded || !session || session === "loading" || !session.username || !activeSessionId) return;

    setSessions((prevSessions) => {
      const updated = prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          let title = s.title;
          if (title === "New Chat") {
            const firstUserMsg = messages.find((m) => m.role === "user");
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
            }
          }
          return { ...s, messages, title };
        }
        return s;
      });

      localStorage.setItem(`chatbot_sessions_${session.username}`, JSON.stringify(updated));
      return updated;
    });
  }, [messages, activeSessionId, session, historyLoaded]);

  // ── Chat Session Managers ───────────────────────────────────────────────────
  const createNewSession = (currentSessions: ChatSession[]) => {
    const newSessionId = uuid();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    
    let updated = [newSession, ...currentSessions];
    if (updated.length > 7) {
      updated = updated.slice(0, 7);
    }
    
    setSessions(updated);
    setActiveSessionId(newSessionId);
    setMessages([]);
    setProposedTasks([]);
    stopSpeaking();
    
    if (session && session !== "loading" && session.username) {
      localStorage.setItem(`chatbot_sessions_${session.username}`, JSON.stringify(updated));
      localStorage.setItem(`chatbot_active_session_id_${session.username}`, newSessionId);
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (!targetSession || !session || session === "loading") return;

    stopSpeaking();
    setActiveSessionId(sessionId);
    localStorage.setItem(`chatbot_active_session_id_${session.username}`, sessionId);

    const formatted = targetSession.messages.map((m: any) => ({
      ...m,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    }));
    setMessages(formatted);
    setProposedTasks([]);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session || session === "loading") return;

    const updated = sessions.filter((s) => s.id !== sessionId);
    
    let newActiveId = activeSessionId;
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        newActiveId = updated[0].id;
      } else {
        const newSessionId = uuid();
        const initialSession: ChatSession = {
          id: newSessionId,
          title: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
        };
        updated.push(initialSession);
        newActiveId = newSessionId;
      }
    }

    setSessions(updated);
    setActiveSessionId(newActiveId);
    localStorage.setItem(`chatbot_sessions_${session.username}`, JSON.stringify(updated));
    localStorage.setItem(`chatbot_active_session_id_${session.username}`, newActiveId || "");

    const activeSessionObj = updated.find((s) => s.id === newActiveId);
    if (activeSessionObj) {
      const formatted = activeSessionObj.messages.map((m: any) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      }));
      setMessages(formatted);
    } else {
      setMessages([]);
    }
    setProposedTasks([]);
  };

  const fetchQuotaStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/quota-status");
      if (res.ok) {
        const data = await res.json();
        setQuotaStatus(data);
        if (!data.exhausted) {
          setQuotaExceeded(false);
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const lastMsg = prev[prev.length - 1];
            if (
              lastMsg &&
              lastMsg.role === "assistant" &&
              lastMsg.content.includes("message limit") &&
              lastMsg.content.includes("Request more from your admin")
            ) {
              const newMsgs = [...prev];
              newMsgs.pop();
              
              const nextLast = newMsgs[newMsgs.length - 1];
              if (
                nextLast &&
                nextLast.role === "system" &&
                nextLast.content.startsWith("🔍 Routing Decision")
              ) {
                newMsgs.pop();
              }
              return newMsgs;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch quota status:", err);
    }
  }, []);

  useEffect(() => {
    if (open && session && session !== "loading") {
      fetchQuotaStatus();
    }
  }, [open, session, fetchQuotaStatus]);

  // ── TTS Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── Drag & Movement mouse handlers ──────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    const target = e.target as HTMLElement;
    // Don't drag when clicking interactive elements
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("a") || target.closest("select")) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // ── Save Avatar helper ──────────────────────────────────────────────────────
  const saveAvatarSettings = (type: "icon" | "image", icon: string, image: string) => {
    setAvatarType(type);
    setAvatarIcon(icon);
    setAvatarImage(image);
    localStorage.setItem("chatbot_avatar_type", type);
    localStorage.setItem("chatbot_avatar_icon", icon);
    localStorage.setItem("chatbot_avatar_image", image);
  };

  // ── Rename helpers ────────────────────────────────────────────────────────────
  const startRenaming = () => {
    setRenameInput(botName);
    setIsRenaming(true);
    setTimeout(() => renameRef.current?.focus(), 50);
  };

  const confirmRename = () => {
    const trimmed = renameInput.trim();
    if (trimmed) {
      setBotName(trimmed);
      localStorage.setItem("chatbot_name", trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") confirmRename();
    if (e.key === "Escape") setIsRenaming(false);
  };

  // ── Text to Speech controllers ──────────────────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();

    // Remove emoji/markdown characters before speaking for clean speech
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
      .replace(/\*+/g, "")
      .replace(/-+/g, "")
      .replace(/#+/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    // Find custom voices if possible
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("natural"))
      || voices.find(v => v.lang.startsWith("en"));
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, []);

  const triggerDailyBriefing = useCallback(async () => {
    if (isStreaming || isSpeaking) return;

    const loadingId = uuid();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: `Generating your daily briefing script for ${botName}...`,
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);
    setIsStreaming(true);

    try {
      const wsId = selectedWorkspace ?? workspaceId ?? 1;
      const res = await fetch(`/api/chat/briefing?type=daily&workspaceId=${wsId}&botName=${encodeURIComponent(botName)}&language=${language}`);
      if (!res.ok) throw new Error("Failed to contact briefing API");
      const data = await res.json();
      if (!data.success || !data.briefing) {
        throw new Error(data.error || "Briefing failed");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: data.briefing, isStreaming: false } : m
        )
      );

      speakText(data.briefing);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: `Error: ${err.message || "Failed to fetch briefing."}`, isStreaming: false } : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [workspaceId, selectedWorkspace, botName, isSpeaking, isStreaming, speakText, language]);

  const triggerWeeklyBriefing = useCallback(async () => {
    if (isStreaming || isSpeaking) return;

    const loadingId = uuid();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: `Generating your weekly tasks briefing script for ${botName}...`,
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);
    setIsStreaming(true);

    try {
      const wsId = selectedWorkspace ?? workspaceId ?? 1;
      const res = await fetch(`/api/chat/briefing?type=weekly&workspaceId=${wsId}&botName=${encodeURIComponent(botName)}&language=${language}`);
      if (!res.ok) throw new Error("Failed to contact briefing API");
      const data = await res.json();
      if (!data.success || !data.briefing) {
        throw new Error(data.error || "Briefing failed");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: data.briefing, isStreaming: false } : m
        )
      );

      speakText(data.briefing);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: `Error: ${err.message || "Failed to fetch briefing."}`, isStreaming: false } : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [workspaceId, selectedWorkspace, botName, isSpeaking, isStreaming, speakText, language]);

  // ── Send message with local grilling pre-filters ────────────────────────────
  const handleUserMessage = useCallback(async (msgText: string, wsIdForce?: number) => {
    const text = msgText.trim();
    if (!text || isStreaming) return;

    // Check if there is a pending prompt after workspace selection, and the user typed the workspace name
    if (pendingPromptAfterWorkspace && !wsIdForce) {
      const matchedWs = workspaces.find(
        (w) => w.name.toLowerCase() === text.toLowerCase()
      );
      if (matchedWs) {
        setMessages((prev) =>
          prev.filter(
            (m) =>
              m.content !== "WORKSPACE_CHOOSER" &&
              !m.content.startsWith("To add this task") &&
              !m.content.startsWith("To add these tasks")
          )
        );
        setSelectedWorkspace(matchedWs.id);
        const promptToRun = pendingPromptAfterWorkspace;
        setPendingPromptAfterWorkspace(null);
        handleUserMessage(promptToRun, matchedWs.id);
        return;
      }
    }

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setProposedTasks([]);

    // Check if task query (create, delete, edit, plan, decompose etc.)
    const isTaskQuery = /add|create|delete|remove|schedule|remind|plan|divide|split|break down|subtask|decompose|book|fix|do|build|write|send|assign|complete|finish|prepare|review/i.test(text);

    // Decide routing
    let routeDecision: "VIDEO_TUTORIAL" | "FAQ" | "GEMINI" = "GEMINI";
    const isOffTopic = /recipe|weather|news|movie|song|sports|cooking|chocolate|cake|bake|dinner/i.test(text);

    if (isOffTopic) {
      routeDecision = "FAQ";
    } else if (isTaskQuery) {
      routeDecision = "GEMINI";
    } else {
      const isTutorialRequest = /eisenhower|matrix|quadrant|do first|schedule|delegate|eliminate|inbox|priorit|tutorial|tour|walkthrough|guide|analytics|heatmap|statistics|report|productivity/i.test(text);
      const isFAQRequest = !isTutorialRequest && /workspace|briefing|alexa|audio|speak|voice|delegate|team member/i.test(text);

      if (isTutorialRequest) {
        routeDecision = "VIDEO_TUTORIAL";
      } else if (isFAQRequest) {
        routeDecision = "FAQ";
      } else {
        routeDecision = "GEMINI";
      }
    }

    // Append routing log message if logMode is enabled
    if (logMode) {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "system",
          content: `🔍 Routing Decision: ${routeDecision}${isOffTopic ? " (OFF_TOPIC)" : ""}`,
          timestamp: new Date(),
        },
      ]);
    }

    // 1. Video Tutorial Branch
    if (routeDecision === "VIDEO_TUTORIAL") {
      setIsStreaming(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: "assistant",
            content: "I found a relevant interactive tutorial for this! You can start the guided tour by clicking one of the buttons below:",
            timestamp: new Date(),
          },
          {
            id: uuid(),
            role: "assistant",
            content: "TUTORIAL_LINKS",
            timestamp: new Date(),
          },
        ]);
        setIsStreaming(false);
      }, 400);
      return;
    }

    // 2. FAQ Branch (includes Off-Topic)
    if (routeDecision === "FAQ") {
      setIsStreaming(true);
      
      let faqContent = "I can only answer questions related to productivity, the Eisenhower Matrix, mental models, and task management. For other topics, please check our FAQ page or ask the admin.";
      
      if (!isOffTopic) {
        const isWorkspaceFAQ = /workspace|workspaces/i.test(text);
        const isBriefingFAQ = /briefing|daily briefing|weekly briefing|alexa|audio|speak|voice/i.test(text);
        const isDelegatesFAQ = /delegate|delegates|team member/i.test(text);

        if (isWorkspaceFAQ) {
          faqContent = "Workspaces allow you to separate different areas of your life (e.g. Personal, Work, Side Projects). Each workspace has its own independent matrix of tasks and delegates. You can switch or create workspaces from the top-left dropdown on the board.";
        } else if (isBriefingFAQ) {
          faqContent = "The chatbot can generate an audio daily or weekly briefing summarizing your tasks, productivity status, and quadrant balance advice. Just click the Brief buttons in the chatbot welcome view!";
        } else if (isDelegatesFAQ) {
          faqContent = "Delegates are team members, colleagues, or assistants whom you assign tasks to. In this app, delegating a task automatically schedules a short follow-up task for yourself to verify progress.";
        }
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: "assistant",
            content: faqContent,
            timestamp: new Date(),
          },
          {
            id: uuid(),
            role: "assistant",
            content: "FAQ_LINK",
            timestamp: new Date(),
          },
        ]);
        setIsStreaming(false);
      }, 400);
      return;
    }

    // It IS a task query! Proceed to workspace context check and Gemini:
    let wsToUse = wsIdForce ?? selectedWorkspace;

    if (!wsToUse) {
      const matchedWs = workspaces.find((w) => {
        const escapedName = w.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escapedName}\\b`, "i");
        return regex.test(text);
      });
      if (matchedWs) {
        wsToUse = matchedWs.id;
        setSelectedWorkspace(matchedWs.id);
      }
    }

    if (isTaskQuery && context === "home" && !wsToUse && workspaces.length > 1) {
      setPendingPromptAfterWorkspace(text);
      setIsStreaming(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: "assistant",
            content: "To add this task, please select the target workspace first:",
            timestamp: new Date(),
          },
          {
            id: uuid(),
            role: "assistant",
            content: "WORKSPACE_CHOOSER",
            timestamp: new Date(),
          },
        ]);
        setIsStreaming(false);
      }, 400);
      return;
    }

    let finalWsId = wsToUse;
    if (!finalWsId && workspaces.length === 1) {
      finalWsId = workspaces[0].id;
    }

    // Setup Gemini Stream
    const assistantMsgId = uuid();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      // Decompose tasks limit enforcement
      const isDecompQuery = /plan|divide|split|break down|subtask|decompose/i.test(text);
      const cleanPrompt = isDecompQuery
        ? `Act as a task planner. Take this big task: '${text}'. Divide it into smaller sub-tasks, each with a duration of 1 to 3 hours (60 to 180 minutes) maximum. Return the list of tasks.`
        : text;

      const backendMessages = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        content: m.id === userMsg.id ? cleanPrompt : m.content,
        timestamp: m.timestamp,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: backendMessages,
          provider: activeProvider ?? undefined,
          context,
          workspaceId: finalWsId ?? undefined,
          botName,
          language,
        }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      if (!res.ok && res.status !== 429) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const chunk = JSON.parse(jsonStr);

            if (chunk.type === "quota_exceeded") {
              setQuotaExceeded(true);
              setQuotaStatus({ used: chunk.used, limit: chunk.limit, period: chunk.period, exhausted: true });
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: `You've reached your ${chunk.period.toLowerCase()} message limit (${chunk.used}/${chunk.limit}). Request more from your admin.`, isStreaming: false }
                    : m,
                ),
              );
              break;
            }

            if (chunk.type === "rate_limited") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: "You're sending messages too fast. Please wait a moment and try again.", isStreaming: false }
                    : m,
                ),
              );
              break;
            }

            if (chunk.type === "token" && chunk.token) {
              accumulated += chunk.token;
              const displayText = extractReply(accumulated) || accumulated;
              const sanitizedText = sanitizeReply(displayText);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: sanitizedText } : m,
                ),
              );
            }

            if (chunk.type === "done" && chunk.result) {
              const result: LLMStructuredResponse = chunk.result;
              const finalReply = result.confused
                ? (result.clarificationQuestion ?? result.reply)
                : result.reply;

              const sanitizedReply = sanitizeReply(finalReply);

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: sanitizedReply, isStreaming: false } : m,
                ),
              );

              if (result.proposedTasks?.length > 0) {
                setProposedTasks(result.proposedTasks);
              }
            }

            if (chunk.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: chunk.error || "Sorry, something went wrong. Please try again.", isStreaming: false, isError: true }
                    : m,
                ),
              );
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: "Connection error. Please check your network and try again.", isStreaming: false, isError: true }
              : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      setMessages((prev) => prev.map((m) => ({ ...m, isStreaming: false })));
      fetchQuotaStatus();
    }
  }, [messages, activeProvider, context, workspaces, selectedWorkspace, botName, isStreaming, fetchQuotaStatus, language, logMode, pendingPromptAfterWorkspace]);

  const handleSelectWorkspace = (wsId: number) => {
    setSelectedWorkspace(wsId);
    setMessages((prev) => prev.filter((m) => m.content !== "WORKSPACE_CHOOSER" && !m.content.startsWith("To add this task")));
    if (pendingPromptAfterWorkspace) {
      handleUserMessage(pendingPromptAfterWorkspace, wsId);
      setPendingPromptAfterWorkspace(null);
    }
  };

  const handleRetry = useCallback((errorMsgId: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === errorMsgId);
      if (idx === -1) return prev;

      let userMsgIdx = -1;
      for (let i = idx - 1; i >= 0; i--) {
        if (prev[i].role === "user") {
          userMsgIdx = i;
          break;
        }
      }

      if (userMsgIdx === -1) return prev;

      const userMsgText = prev[userMsgIdx].content;

      const newMsgs = prev.filter((m, i) => {
        if (i === userMsgIdx || m.id === errorMsgId) return false;
        if (i > userMsgIdx && i < idx && m.role === "system") return false;
        return true;
      });

      setTimeout(() => {
        handleUserMessage(userMsgText);
      }, 50);

      return newMsgs;
    });
  }, [handleUserMessage]);

  const addTasksToMatrix = useCallback(async () => {
    if (!proposedTasks.length) return;
    setIsSubmittingTasks(true);

    try {
      const wsId = selectedWorkspace ?? workspaceId ?? 1;

      for (const task of proposedTasks) {
        let delegateId: number | null = null;

        if (task.delegateName && task.delegateName.toLowerCase() !== "self") {
          const existingRes = await fetch(`/api/delegates?workspaceId=${wsId}`);
          if (existingRes.ok) {
            const existingList: any[] = await existingRes.json();
            const found = existingList.find(
              (d) => d.name.toLowerCase() === task.delegateName.toLowerCase(),
            );
            if (found) {
              delegateId = found.id;
            } else {
              const delRes = await fetch("/api/delegates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: task.delegateName, workspaceId: wsId }),
              });
              if (delRes.ok) {
                const delData = await delRes.json();
                delegateId = delData.id;
              }
            }
          }
        }

        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: task.content,
            isImportant: task.isImportant,
            isUrgent: task.isUrgent,
            quadrant: task.quadrant,
            dueDate: task.dueDate,
            delegateId,
            estimatedMinutes: task.estimatedMinutes,
            workspaceId: wsId,
          }),
        });
      }

      setProposedTasks([]);
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: `✅ Added ${proposedTasks.length} task${proposedTasks.length > 1 ? "s" : ""} to your matrix! Check your board to review them.`,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: "There was an error adding the tasks. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSubmittingTasks(false);
    }
  }, [proposedTasks, selectedWorkspace, workspaceId]);

  const addSingleTaskToMatrix = useCallback(async (task: ProposedTask) => {
    setIsSubmittingTasks(true);

    try {
      const wsId = selectedWorkspace ?? workspaceId ?? 1;
      
      const tasksToAdd = [
        task,
        ...proposedTasks.filter((f) => f.isFollowUp && f.parentTask === task.content)
      ];

      for (const t of tasksToAdd) {
        let delegateId: number | null = null;

        if (t.delegateName && t.delegateName.toLowerCase() !== "self") {
          const existingRes = await fetch(`/api/delegates?workspaceId=${wsId}`);
          if (existingRes.ok) {
            const existingList: any[] = await existingRes.json();
            const found = existingList.find(
              (d) => d.name.toLowerCase() === t.delegateName.toLowerCase(),
            );
            if (found) {
              delegateId = found.id;
            } else {
              const delRes = await fetch("/api/delegates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: t.delegateName, workspaceId: wsId }),
              });
              if (delRes.ok) {
                const delData = await delRes.json();
                delegateId = delData.id;
              }
            }
          }
        }

        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: t.content,
            isImportant: t.isImportant,
            isUrgent: t.isUrgent,
            quadrant: t.quadrant,
            dueDate: t.dueDate,
            delegateId,
            estimatedMinutes: t.estimatedMinutes,
            workspaceId: wsId,
          }),
        });
      }

      setProposedTasks((prev) =>
        prev.filter((p) => !tasksToAdd.some((t) => t.content === p.content && t.isFollowUp === p.isFollowUp))
      );

      const addedCount = tasksToAdd.length;
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: `✅ Added task "${task.content}" ${addedCount > 1 ? `and its auto-created follow-up ` : ""}to your matrix!`,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: "assistant",
          content: `There was an error adding the task "${task.content}". Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSubmittingTasks(false);
    }
  }, [proposedTasks, selectedWorkspace, workspaceId]);

  const renderAvatar = (className = "w-4 h-4 text-white", forceImageFull = false) => {
    if (avatarType === "image" && avatarImage.trim()) {
      return (
        <img
          src={avatarImage}
          alt={botName}
          className={`${forceImageFull ? "w-full h-full" : className} object-cover rounded-full`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }
    const IconComponent = ({ Smile, Bot, Sparkles, Heart, Zap }[avatarIcon] || Smile) as any;
    return <IconComponent className={className} />;
  };

  if (session === "loading") return null;

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-[45000] flex flex-col items-center gap-1.5 pointer-events-none select-none">
          <button
            id="ai-chatbot-trigger"
            onClick={() => setOpen(true)}
            className={`
              pointer-events-auto w-14 h-14 rounded-full text-white shadow-xl transition-all duration-200 
              flex items-center justify-center overflow-hidden group hover:scale-105 active:scale-95 relative
              ${avatarType === "image" && avatarImage.trim() 
                ? "bg-transparent shadow-indigo-500/20 hover:shadow-indigo-500/40 border border-slate-200 dark:border-slate-800" 
                : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/40 hover:shadow-indigo-500/60"
              }
            `}
            title={`Open ${botName}`}
          >
            {renderAvatar("w-6 h-6 group-hover:scale-110 transition-transform", true)}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </button>
          <span 
            onClick={() => setOpen(true)}
            className="pointer-events-auto cursor-pointer text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/40 shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:text-indigo-500 active:scale-95"
          >
            Ask {botName}
          </span>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          className="fixed bottom-6 right-6 z-[45000] w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-3rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
        >

          {/* Settings panel overlay */}
          {showSettings && (
            <div className="absolute inset-0 bg-white dark:bg-slate-900 z-[45500] flex flex-col p-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Chatbot Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Rename */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Rename Chatbot</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value.slice(0, 24))}
                      maxLength={24}
                      className="flex-1 px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                      placeholder="e.g. Betu"
                    />
                    <button
                      onClick={() => {
                        const trimmed = renameInput.trim();
                        if (trimmed) {
                          setBotName(trimmed);
                          localStorage.setItem("chatbot_name", trimmed);
                        }
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Language (Bhasha)</label>
                  <div className="flex gap-2">
                    {(["english", "hinglish"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          localStorage.setItem("chatbot_language", lang);
                        }}
                        className={`flex-1 py-2 text-xs font-black rounded-xl border capitalize transition-all ${
                          language === lang
                            ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                        }`}
                      >
                        {lang === "english" ? "English" : "Hinglish"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Routing Logs Enable */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enable Routing Logs</label>
                  <input
                    type="checkbox"
                    checked={logMode}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setLogMode(val);
                      localStorage.setItem("chatbot_routing_logs", String(val));
                    }}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                  />
                </div>

                {/* Chat History (Max 7) */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Chat History (Max 7)</label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {sessions.map((s) => {
                      const isActive = s.id === activeSessionId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            handleSwitchSession(s.id);
                            setShowSettings(false);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isActive
                              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500/50"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black truncate ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                              {s.title}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                              {s.messages.length} message{s.messages.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {sessions.length > 1 && (
                            <button
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-150 dark:hover:bg-slate-700 transition-colors ml-2"
                              title="Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preset Icons */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Choose Icon Avatar</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["Smile", "Bot", "Sparkles", "Heart", "Zap"] as const).map((iconName) => {
                      const IconComp = { Smile, Bot, Sparkles, Heart, Zap }[iconName] as any;
                      const isSelected = avatarType === "icon" && avatarIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          onClick={() => saveAvatarSettings("icon", iconName, avatarImage)}
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Image */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Use Custom Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={avatarImage}
                      onChange={(e) => setAvatarImage(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <button
                      onClick={() => {
                        if (avatarImage.trim()) {
                          saveAvatarSettings("image", avatarIcon, avatarImage.trim());
                        } else {
                          saveAvatarSettings("icon", avatarIcon, "");
                        }
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                  {avatarType === "image" && avatarImage.trim() && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <img src={avatarImage} alt="Preview" className="w-8 h-8 rounded-full object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      <span className="text-[10px] text-slate-400 font-bold truncate">Avatar URL Active Preview</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors mt-4"
              >
                Close Settings
              </button>
            </div>
          )}

          {/* Header */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-violet-600 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {renderAvatar("w-4 h-4 text-white")}
              </div>
              <div className="flex-1 min-w-0">
                {isRenaming ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={renameRef}
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value.slice(0, 24))}
                      onKeyDown={handleRenameKey}
                      onBlur={confirmRename}
                      maxLength={24}
                      className="bg-white/20 text-white placeholder-white/50 text-sm font-black rounded-lg px-2 py-0.5 w-full max-w-[130px] focus:outline-none focus:ring-2 focus:ring-white/40"
                      placeholder="Enter name…"
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); confirmRename(); }}
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
                      title="Save name"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group/name">
                    <h2 className="text-sm font-black text-white leading-none truncate">{botName}</h2>
                    <button
                      onClick={startRenaming}
                      className="opacity-0 group-hover/name:opacity-100 p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-all duration-150 flex-shrink-0"
                      title="Rename chatbot"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-white/70 mt-0.5">AI Productivity Assistant</p>
              </div>
            </div>

            {/* Quota limit badge */}
            {quotaStatus && (
              <span className="text-[9px] font-black bg-white/25 text-white px-2 py-0.5 rounded-full whitespace-nowrap mr-2">
                {quotaStatus.used}/{quotaStatus.limit} msgs
              </span>
            )}

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => createNewSession(sessions)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setRenameInput(botName);
                  setShowSettings(true);
                }}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <button
                onClick={() => { stopSpeaking(); setOpen(false); }}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimise"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => { stopSpeaking(); setOpen(false); }}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unauthenticated gate */}
          {!session ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 mb-1">Sign in to use {botName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The AI Tasker is available after login to keep your data secure.
                </p>
              </div>
              <a
                href="/login"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl transition-colors shadow-sm shadow-indigo-500/30"
              >
                Sign In
              </a>
            </div>
          ) : (
            <>
              {/* LLM provider switcher */}
              <div className="pt-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                <LLMSwitcher
                  active={activeProvider}
                  onChange={setActiveProvider}
                  isStreaming={isStreaming}
                />
              </div>

              {/* Messages wrapper */}
              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="px-5 py-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center overflow-hidden">
                        {renderAvatar("w-6 h-6 text-indigo-600 dark:text-indigo-400")}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Hi{session.username ? `, ${session.username}` : ""}! I'm {botName}.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tell me what to do, ask about mental models, or use your mic 🎤
                      </p>
                      <div className="flex flex-col gap-2 mt-4 max-w-[240px] mx-auto">
                        <button
                          onClick={triggerDailyBriefing}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Brief My Day (Audio)
                        </button>
                        <button
                          onClick={triggerWeeklyBriefing}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-violet-500/20 active:scale-95"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Describe Weekly Tasks (Audio)
                        </button>
                      </div>
                    </div>
                    <SuggestedPrompts onSelect={(p) => { setInput(p); }} context={context} />
                  </div>
                ) : (
                  <ChatWindow
                    messages={messages}
                    proposedTasks={proposedTasks}
                    onConfirmProposed={addTasksToMatrix}
                    onCancelProposed={() => setProposedTasks([])}
                    onConfirmSingleProposed={addSingleTaskToMatrix}
                    isSubmittingProposed={isSubmittingTasks}
                    avatarType={avatarType}
                    avatarIcon={avatarIcon}
                    avatarImage={avatarImage}
                    workspaces={workspaces}
                    onSelectWorkspace={handleSelectWorkspace}
                    username={session.username}
                    onRetry={handleRetry}
                  />
                )}
              </div>

              {/* Spoken Briefing Active Wave Visualizer */}
              {isSpeaking && (
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 border-t border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="flex items-end gap-[3px] h-4 w-6 shrink-0 pb-0.5">
                      <span className={`w-[3px] bg-indigo-500 rounded-full transition-all duration-300 ${isPaused ? 'h-[4px]' : 'h-[14px] animate-bounce'}`} style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                      <span className={`w-[3px] bg-violet-500 rounded-full transition-all duration-300 ${isPaused ? 'h-[4px]' : 'h-[10px] animate-bounce'}`} style={{ animationDelay: '0.3s', animationDuration: '0.5s' }} />
                      <span className={`w-[3px] bg-indigo-600 rounded-full transition-all duration-300 ${isPaused ? 'h-[4px]' : 'h-[16px] animate-bounce'}`} style={{ animationDelay: '0.2s', animationDuration: '0.7s' }} />
                      <span className={`w-[3px] bg-violet-600 rounded-full transition-all duration-300 ${isPaused ? 'h-[4px]' : 'h-[8px] animate-bounce'}`} style={{ animationDelay: '0.4s', animationDuration: '0.4s' }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 truncate animate-pulse">
                      {isPaused ? "Voice Briefing Paused" : `${botName} is speaking…`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPaused ? (
                      <button
                        onClick={resumeSpeaking}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                      >
                        Play
                      </button>
                    ) : (
                      <button
                        onClick={pauseSpeaking}
                        className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                      >
                        Pause
                      </button>
                    )}
                    <button
                      onClick={stopSpeaking}
                      className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-450 hover:bg-rose-100 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <VolumeX className="w-3 h-3" /> Stop
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => handleUserMessage(input)}
                disabled={isStreaming || isSubmittingTasks}
                silenceTimeoutMs={2500}
                autoSubmitAfterSilence={false}
                botName={botName}
              />
            </>
          )}
        </div>
      )}

      {/* Quota exceeded modal */}
      {quotaExceeded && quotaStatus && (
        <QuotaRequestModal
          used={quotaStatus.used}
          limit={quotaStatus.limit}
          period={quotaStatus.period}
          onClose={() => setQuotaExceeded(false)}
        />
      )}
    </>
  );
}

/** Extract the "reply" field from a partially-streamed JSON string */
function extractReply(text: string): string {
  try {
    const match = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match) return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  } catch {}
  return "";
}
