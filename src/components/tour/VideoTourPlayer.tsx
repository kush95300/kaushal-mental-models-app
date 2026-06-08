"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  LayoutGrid,
  Zap,
  Check,
  Users,
  PieChart,
  Sun,
  Moon,
  MousePointer,
  Plus,
  ArrowRight,
  HelpCircle,
  Scissors,
  Lock,
  Maximize,
  Minimize,
  ChevronDown
} from "lucide-react";
import { audioSynth } from "@/lib/audio";
import { useTheme } from "@/hooks/useTheme";
import { TRACKS } from "@/lib/tracks";

interface VideoTourPlayerProps {
  onClose: () => void;
  onDontShowAgain?: (val: boolean) => void;
  excludeTrackIds?: number[];
}


export const VideoTourPlayer: React.FC<VideoTourPlayerProps> = ({
  onClose,
  onDontShowAgain,
  excludeTrackIds
}) => {
  const filteredTracks = React.useMemo(() => {
    return excludeTrackIds ? TRACKS.filter(t => !excludeTrackIds.includes(t.id)) : TRACKS;
  }, [excludeTrackIds]);
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [dontShowCheckbox, setDontShowCheckbox] = useState(false);
  const [localTheme, setLocalTheme] = useState<"light" | "dark">("dark");
  const [maxUnlockedTrackIdx, setMaxUnlockedTrackIdx] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error enabling fullscreen", err);
      });
    } else {
      document.exitFullscreen();
    }
  };


  // Load unlocked progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tour_max_unlocked_idx");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < TRACKS.length) {
        setMaxUnlockedTrackIdx(parsed);
      }
    }
  }, []);

  const updateMaxUnlockedTrack = (idx: number) => {
    setMaxUnlockedTrackIdx((prev) => {
      const nextVal = Math.max(prev, idx);
      localStorage.setItem("tour_max_unlocked_idx", nextVal.toString());
      return nextVal;
    });
  };

  const activeTrack = filteredTracks[activeTrackIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenSubtitleRef = useRef("");
  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Determine if the current track has completed
  const isTrackCompleted = currentTime >= activeTrack.duration;

  // Get matching subtitle text
  const currentSubtitleObj = !isTrackCompleted
    ? (activeTrack.subtitles.find((s) => currentTime >= s.start && currentTime <= s.end)?.text || null)
    : null;
  const currentSubtitle = currentSubtitleObj ? currentSubtitleObj[language] : "";

  // Synced audio synthesis controls
  useEffect(() => {
    audioSynth.setMute(isMuted);
    if (isMuted) {
      audioSynth.stopSpeaking();
      lastSpokenSubtitleRef.current = "";
    }
  }, [isMuted]);

  // Sync background ambient music with play/pause state
  useEffect(() => {
    if (isPlaying && !isTrackCompleted) {
      audioSynth.playBackgroundMusic();
    } else {
      audioSynth.stopBackgroundMusic();
    }
    return () => {
      audioSynth.stopBackgroundMusic();
    };
  }, [isPlaying, isTrackCompleted]);

  // Synchronize playback speed changes directly with the active audio
  useEffect(() => {
    audioSynth.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  // Synchronize Speech Synthesis with currentSubtitle, play/pause, and mute states
  useEffect(() => {
    if (isPlaying && !isMuted && !isTrackCompleted) {
      if (currentSubtitle) {
        if (currentSubtitle !== lastSpokenSubtitleRef.current) {
          const sub = activeTrack.subtitles.find((s) => currentTimeRef.current >= s.start && currentTimeRef.current <= s.end);
          const offset = sub ? (currentTimeRef.current - sub.start) : 0;
          audioSynth.speak(currentSubtitle, playbackSpeed, language, offset);
          lastSpokenSubtitleRef.current = currentSubtitle;
        }
      }
    } else {
      audioSynth.stopSpeaking();
      lastSpokenSubtitleRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSubtitle, isPlaying, isMuted, isTrackCompleted, language]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      audioSynth.stopSpeaking();
    };
  }, []);

  // Player ticker loop
  useEffect(() => {
    if (isPlaying) {
      const tickAmount = 0.1;
      const intervalMs = 100 / playbackSpeed;

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + tickAmount;

          // Check if we are crossing a subtitle segment end boundary
          const currentSub = activeTrack.subtitles.find(s => prev >= s.start && prev < s.end);
          if (currentSub && next >= currentSub.end) {
            if (audioSynth.isSpeaking()) {
              // Hold timeline progress at the boundary until the voiceover finishes
              return currentSub.end - 0.05;
            }
          }

          if (next >= activeTrack.duration) {
            audioSynth.playSuccess();
            setIsPlaying(false); // Pause at the end of the track to show sequential NEXT action
            updateMaxUnlockedTrack(activeTrackIdx + 1);
            return activeTrack.duration;
          }
          // Play click sound at chapter markers
          const isChapterTime = activeTrack.chapters.some(
            (c) => Math.abs(c.time - next) < tickAmount * 1.5 && prev < c.time && next >= c.time
          );
          if (isChapterTime) {
            audioSynth.playTick();
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeTrackIdx, playbackSpeed]);

  // Track change side-effects
  const handleTrackChange = (idx: number) => {
    audioSynth.unlockSpeech();
    audioSynth.stopSpeaking();
    lastSpokenSubtitleRef.current = "";
    audioSynth.playSwoosh();
    setActiveTrackIdx(idx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleNextTrack = () => {
    if (activeTrackIdx < filteredTracks.length - 1) {
      updateMaxUnlockedTrack(activeTrackIdx + 1);
      handleTrackChange(activeTrackIdx + 1);
    } else {
      onClose(); // Last track completed, close the tour
    }
  };

  const handleTimelineScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioSynth.unlockSpeech();
    audioSynth.stopSpeaking();
    
    // Find matching subtitle text at the scrubbed time to play it immediately
    const matchedSubtitleSub = activeTrack.subtitles.find((s) => time >= s.start && time <= s.end);
    const matchedSubtitleObj = matchedSubtitleSub ? matchedSubtitleSub.text : null;
    const matchedSubtitle = matchedSubtitleObj ? matchedSubtitleObj[language] : "";
    const offset = matchedSubtitleSub ? (time - matchedSubtitleSub.start) : 0;
    
    lastSpokenSubtitleRef.current = matchedSubtitle;
    
    setCurrentTime(time);
    if (time < activeTrack.duration) {
      setIsPlaying(true);
      if (matchedSubtitle && !isMuted) {
        audioSynth.speak(matchedSubtitle, playbackSpeed, language, offset);
      }
    }
  };

  // Auto theme switcher for Track 2 (Eisenhower Matrix) Q2 Chapter (now 42s - 54s)
  useEffect(() => {
    if (activeTrack.id === 2 && currentTime >= 42 && currentTime < 54) {
      const toggleSec = Math.floor(currentTime / 6) % 2;
      setLocalTheme(toggleSec === 0 ? "light" : "dark");
    } else {
      setLocalTheme("dark");
    }
  }, [activeTrack.id, currentTime]);

  return (
    <div
      className="fixed inset-0 z-[50900] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div
        ref={containerRef}
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        className={`bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans shadow-indigo-500/10 transition-all duration-500 ${
          isFullscreen
            ? "w-screen h-screen max-w-none max-h-none rounded-none border-none"
            : "w-full max-w-4xl rounded-[2.5rem]"
        } ${
          isFullscreen && !showControls && isPlaying ? "cursor-none" : "cursor-default"
        }`}
      >
        
        {/* Header */}
        <div
          className={`px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 transition-all duration-550 overflow-hidden ${
            !showControls && isPlaying
              ? "max-h-0 py-0 border-b-0 opacity-0 pointer-events-none"
              : "max-h-24 py-6 opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Interactive Platform Tour</h2>
              <p className="text-xs font-semibold text-slate-400">Discover "The Wisdom Lab" Productivity Suite</p>
            </div>
          </div>

          {/* Video Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {filteredTracks.map((track, idx) => {
              const isLocked = false;
              return (
                <button
                  key={track.id}
                  disabled={isLocked}
                  onClick={() => handleTrackChange(idx)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all uppercase flex items-center gap-1.5 ${
                    activeTrackIdx === idx
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : isLocked
                      ? "text-slate-600 cursor-not-allowed opacity-50"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isLocked && <Lock className="w-3 h-3" />}
                  {track.title.split(". ")[1]}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile / Tablet Selector */}
        <div
          className={`flex lg:hidden items-center justify-between px-4 bg-slate-950 border-b border-slate-800 transition-all duration-550 ${
            !showControls && isPlaying
              ? "max-h-0 py-0 border-b-0 opacity-0 pointer-events-none"
              : "max-h-16 py-2.5 opacity-100"
          }`}
        >
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">Chapter:</span>
          <div className="relative flex-grow">
            <select
              value={activeTrackIdx}
              onChange={(e) => handleTrackChange(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 text-white text-[11px] font-black tracking-wider rounded-xl py-2 pl-3.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {filteredTracks.map((track, idx) => {
                const isLocked = false;
                const titleStr = track.title.split(". ")[1];
                return (
                  <option key={track.id} value={idx} disabled={isLocked} className="bg-slate-950 text-white py-2">
                    {isLocked ? `🔒 [Locked] ${titleStr}` : `${idx + 1}. ${titleStr}`}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Dynamic Screen/Canvas Area */}
        <div
          className={`relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-b border-slate-800 select-none transition-all ${
            isFullscreen ? "flex-grow w-full h-full" : "aspect-video"
          }`}
        >
          
          {/* Active Canvas Renders */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8">
            
            {/* Sequential "Next Track" completion overlay card */}
            {isTrackCompleted && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-30 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] max-w-sm w-full text-center space-y-6 shadow-2xl shadow-indigo-500/5 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">Chapter Completed!</h4>
                    <p className="text-xs font-semibold text-slate-400">
                      {activeTrackIdx < TRACKS.length - 1 
                        ? `Up next: ${TRACKS[activeTrackIdx + 1].title.split(". ")[1]}`
                        : "You've finished the interactive intro tour."}
                    </p>
                  </div>
                  <button
                    onClick={handleNextTrack}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {activeTrackIdx < filteredTracks.length - 1 ? (
                      <>
                        Start Next Chapter <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        {excludeTrackIds ? "Back to App" : "Start with App"} <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* VIDEO 1: WHAT ARE MENTAL MODELS? */}
            {activeTrack.id === 1 && (
              <div className="w-full h-full flex flex-col justify-between text-center relative z-10 transition-all duration-300">
                {/* Scene 1.1: Introduction (0s - 15s) */}
                {currentTime < 15 && (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                      <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                      Cognitive Frameworks
                    </h3>
                    <p className="text-slate-400 max-w-md font-semibold text-sm">
                      Mental models are conceptual tools that help simplify complex environments and make logical decisions.
                    </p>
                  </div>
                )}

                {/* Scene 1.2: How They Work (15s - 30s) */}
                {currentTime >= 15 && currentTime < 30 && (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-6 animate-in slide-in-from-right duration-500">
                    <h3 className="text-2xl font-black text-indigo-400 tracking-tight">
                      Simplifying Complexity
                    </h3>
                    <div className="flex items-center justify-center gap-6 w-full max-w-lg">
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 text-center">
                        <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Incoming Noise</span>
                        <div className="text-xs font-bold text-slate-400 line-through">Unstructured Overload</div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-indigo-500 animate-pulse" />
                      <div className="bg-indigo-600 p-4 rounded-2xl flex-1 text-center shadow-lg shadow-indigo-500/20">
                        <span className="text-[10px] font-black uppercase text-indigo-200 block mb-1">Structured Action</span>
                        <div className="text-xs font-black text-white">Eisenhower Priority</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scene 1.3: Cognitive Filters (30s - 45s) */}
                {currentTime >= 30 && (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
                    <h3 className="text-2xl font-black text-purple-400 tracking-tight">Logical Thinking Filters</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                      {[
                        { name: "Eisenhower Box", desc: "Priority Mapping", icon: <LayoutGrid className="text-indigo-400" />, active: true },
                        { name: "Pareto Principle", desc: "80/20 Efficiency", icon: <Zap className="text-amber-400" />, active: false },
                        { name: "First Principles", desc: "Deconstruct Logic", icon: <Sparkles className="text-emerald-400" />, active: false },
                        { name: "Occam's Razor", desc: "Simplicity First", icon: <Scissors className="text-rose-400" />, active: false }
                      ].map((m, idx) => (
                        <div
                          key={idx}
                          className={`bg-slate-900 border p-4 rounded-3xl text-left space-y-2 relative overflow-hidden ${
                            m.active ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-800 opacity-60"
                          }`}
                        >
                          {m.active && <span className="absolute top-3 right-3 text-[8px] font-black tracking-widest bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase">Active</span>}
                          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center mb-1">
                            {m.icon}
                          </div>
                          <h4 className="font-black text-xs">{m.name}</h4>
                          <p className="text-[9px] text-slate-400 font-semibold">{m.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIDEO 2: WHAT IS EISENHOWER MATRIX? */}
            {activeTrack.id === 2 && (
              <div className="w-full h-full flex flex-col justify-between relative z-10 transition-all duration-300">
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                  
                  {/* Introduction (0s - 15s) */}
                  {currentTime < 15 && (
                    <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 p-8 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-500 space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 relative">
                        <LayoutGrid className="w-10 h-10 text-white animate-pulse" />
                        <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest font-mono">Prioritization Framework</span>
                        <h4 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">The Eisenhower Matrix</h4>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-md">
                        A productivity model designed to evaluate tasks by their <strong className="text-indigo-400">Urgency</strong> and <strong className="text-purple-400">Importance</strong>. It filters out daily noise and focuses energy on what truly creates long-term value.
                      </p>
                    </div>
                  )}

                  {/* Structure Overview (15s - 30s) */}
                  {currentTime >= 15 && currentTime < 30 && (
                    <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center space-y-4 animate-in slide-in-from-right duration-500">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest font-mono">Matrix Structure</span>
                        <h4 className="text-xl font-black text-white">The Four Quadrants</h4>
                      </div>
                      
                      {/* 2x2 visual grid */}
                      <div className="relative w-full max-w-xs grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                        <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex flex-col justify-between h-16 text-left">
                          <span className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest">Q1</span>
                          <span className="text-[10px] font-black text-rose-300">Do First</span>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl flex flex-col justify-between h-16 text-left">
                          <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Q2</span>
                          <span className="text-[10px] font-black text-indigo-300">Schedule</span>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex flex-col justify-between h-16 text-left">
                          <span className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest">Q3</span>
                          <span className="text-[10px] font-black text-amber-300">Delegate</span>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700/40 p-2.5 rounded-xl flex flex-col justify-between h-16 text-left">
                          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Q4</span>
                          <span className="text-[10px] font-black text-slate-400">Eliminate</span>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 font-semibold text-center max-w-sm pt-2 leading-relaxed">
                        By mapping work into these spaces, you can easily separate what requires instant focus from what drives strategic momentum.
                      </p>
                    </div>
                  )}

                  {/* Q1: Do First (30s - 42s) */}
                  {currentTime >= 30 && currentTime < 42 && (
                    <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-500/30 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl animate-in zoom-in-95 duration-300 text-left">
                      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                        <Zap className="w-8 h-8 animate-bounce" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider font-mono">Quadrant 1 (30s - 42s)</span>
                        <h4 className="text-xl font-black text-white">Do First (Urgent & Important)</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Critical tasks that require immediate attention. Focus here to resolve immediate deadlines.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Q2: Schedule (42s - 54s) */}
                  {currentTime >= 42 && currentTime < 54 && (
                    <div className={`w-full max-w-lg p-6 rounded-[2rem] border-2 flex items-center gap-5 shadow-2xl transition-colors duration-300 text-left ${
                      localTheme === "light" 
                        ? "bg-indigo-50/50 border-indigo-500/20 text-slate-900 shadow-indigo-100"
                        : "bg-slate-900 border-indigo-500/30 text-white"
                    }`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        localTheme === "light" ? "bg-indigo-100 text-indigo-600" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}>
                        <LayoutGrid className="w-8 h-8" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider font-mono">Quadrant 2 (42s - 54s)</span>
                        <h4 className="text-xl font-black">Schedule (Not Urgent & Important)</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Strategic planning, learning, and self-growth. This quadrant drives maximum long-term value.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Q3: Delegate (54s - 66s) */}
                  {currentTime >= 54 && currentTime < 66 && (
                    <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/30 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl text-left">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider font-mono">Quadrant 3 (54s - 66s)</span>
                        <h4 className="text-xl font-black text-white">Delegate (Urgent & Not Important)</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Tasks that must get done quickly but do not require your specific expertise. Delegate to protect focus.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Q4: Eliminate (66s - 78s) */}
                  {currentTime >= 66 && currentTime < 78 && (
                    <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700/50 p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl text-left">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <Scissors className="w-8 h-8" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">Quadrant 4 (66s - 78s)</span>
                        <h4 className="text-xl font-black text-white">Eliminate (Not Urgent & Not Important)</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Time-wasting activities and distractions. Eliminate them to declutter your schedule.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary (78s - 90s) */}
                  {currentTime >= 78 && (
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl text-center space-y-4">
                      <h4 className="text-xl font-black text-indigo-400 uppercase tracking-wider font-mono">Logic Summary (78s - 90s)</h4>
                      <div className="grid grid-cols-4 gap-3 w-full">
                        <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 text-rose-400 font-black text-xs">Q1: Do First</div>
                        <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-400 font-black text-xs">Q2: Schedule</div>
                        <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-400 font-black text-xs">Q3: Delegate</div>
                        <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-slate-400 font-black text-xs">Q4: Eliminate</div>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">
                        Optimizing focus means shifting tasks systematically from reactive quadrants to high-value scheduling.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIDEO 3: ADDING & MOVING TASKS */}
            {activeTrack.id === 3 && (
              <div className="w-full h-full flex flex-col justify-between relative z-10 transition-all duration-300">
                {/* Scene 3.1: Task Creation (0s - 15s) */}
                {currentTime < 15 && (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
                    <h3 className="text-2xl font-black text-indigo-400 tracking-tight">Drafting Tasks in Inbox</h3>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl max-w-md w-full space-y-3 shadow-lg text-left">
                      <span className="text-[10px] font-black uppercase text-slate-500">Task Title & Time Estimate</span>
                      <div className="flex items-center gap-2 border border-slate-800 bg-slate-950 px-3 py-2.5 rounded-2xl relative">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-slate-100">
                          {currentTime < 4 ? "" : currentTime < 8 ? "Review codebase architecture" : "Review codebase architecture (Est: 45 min)"}
                          <span className="animate-ping">|</span>
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[9px] font-black text-slate-500 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">Press Enter</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scene 3.2: Drag & Drop (15s - 30s) */}
                {currentTime >= 15 && currentTime < 30 && (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-4 relative w-full h-full">
                    <h3 className="text-2xl font-black text-indigo-400 tracking-tight">Tethered Drag-and-Drop Prioritization</h3>
                    <div className="flex items-center justify-between w-full max-w-xl bg-slate-900/50 p-4 rounded-3xl border border-slate-800 relative h-36">
                      <div className="w-40 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl h-full flex flex-col justify-between text-left">
                        <span className="text-[10px] font-black uppercase text-slate-500">Inbox</span>
                        {currentTime < 22 && (
                          <div className="bg-indigo-600 text-white font-black text-[10px] p-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                            Review architecture
                          </div>
                        )}
                        <span className="text-[9px] text-slate-600">0 remaining</span>
                      </div>

                      {/* Moving element simulation */}
                      {currentTime >= 18 && currentTime < 24 && (
                        <div
                          className="absolute bg-indigo-600 text-white font-black text-[10px] p-2 rounded-xl flex items-center gap-2 shadow-2xl z-30 pointer-events-none transition-all duration-300"
                          style={{
                            left: `${35 + (currentTime - 18) * 8}%`,
                            top: `${40 - Math.sin((currentTime - 18) * Math.PI / 6) * 20}%`,
                            transform: "scale(1.05)"
                          }}
                        >
                          <MousePointer className="w-3.5 h-3.5 fill-white text-indigo-600" />
                          Review architecture
                        </div>
                      )}

                      <div className="w-40 bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-2xl h-full flex flex-col justify-between text-left">
                        <span className="text-[10px] font-black uppercase text-rose-400">Do First</span>
                        {currentTime >= 23 && (
                          <div className="bg-rose-600 text-white font-black text-[10px] p-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-500/20 animate-in zoom-in-95 duration-200">
                            <Check className="w-3 h-3" /> Review architecture
                          </div>
                        )}
                        <span className="text-[9px] text-slate-500 font-semibold">Priority</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scene 3.3: Marking Done (30s - 45s) */}
                {currentTime >= 30 && (
                  <div className="flex-grow flex flex-col items-center justify-center space-y-4 animate-in slide-in-from-right duration-500">
                    <h3 className="text-2xl font-black text-amber-400 tracking-tight">Mark Done & Track Actual Time</h3>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl max-w-md w-full space-y-3 shadow-lg text-left">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Completion</span>
                        <span className="text-[9px] font-semibold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Velocity Check</span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-md border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 stroke-[4]" />
                          </div>
                          <span className="text-xs font-black line-through text-slate-500">Review codebase architecture</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Estimated: 45 min</span>
                          <span className="text-emerald-400">Actual Spent: 40 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIDEO 4: KEY PLATFORM FEATURES */}
            {activeTrack.id === 4 && (
              <div className="w-full h-full flex flex-col justify-between relative z-10 transition-all duration-300">
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                  
                  {/* Workspace Feature (0s - 12s) */}
                  {currentTime < 12 && (
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex items-center gap-5 shadow-2xl animate-in zoom-in-95 duration-300 text-left">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <LayoutGrid className="w-8 h-8" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-mono">Multi-Tenant Contexts (0s - 12s)</span>
                        <h4 className="text-lg font-black text-white">Contextual Workspaces</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Isolate different task contexts like Work and Personal. Each workspace keeps its own tasks and team delegates.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analytics Feature (12s - 24s) */}
                  {currentTime >= 12 && currentTime < 24 && (
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex items-center gap-5 shadow-2xl text-left">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <PieChart className="w-8 h-8 animate-pulse" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider font-mono">Productivity Insights (12s - 24s)</span>
                        <h4 className="text-lg font-black text-white">Analytics Dashboard</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Monitor completion ratios, quadrant distributions, task velocity graphs, and delegation workloads.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delegate Management Feature (24s - 36s) */}
                  {currentTime >= 24 && currentTime < 36 && (
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex items-center gap-5 shadow-2xl text-left">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono">Team Collaboration (24s - 36s)</span>
                        <h4 className="text-lg font-black text-white">Delegate Management</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Define and assign responsibilities to specific team members to streamline workload sharing.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Task Cleanup Feature (36s - 48s) */}
                  {currentTime >= 36 && (
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex items-center gap-5 shadow-2xl text-left">
                      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                        <Scissors className="w-8 h-8" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider font-mono">Clean Slates (36s - 48s)</span>
                        <h4 className="text-lg font-black text-white">Clearing & Resetting</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          Clean up your database instantly by resetting daily tasks, archiving old completions, or clearing deleted items.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Subtitles Overlay */}
          <div className="absolute bottom-4 left-6 right-6 z-20 text-center pointer-events-none">
            {showCaptions && currentSubtitle && (
              <span className="bg-slate-950/90 text-white border border-slate-800 px-4 py-2 rounded-2xl text-xs font-black tracking-wide shadow-2xl leading-relaxed">
                {currentSubtitle}
              </span>
            )}
          </div>

          {/* Decorative radial lighting in canvas background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.1),transparent_60%)] pointer-events-none" />
        </div>

        {/* Video Player Timeline Control Footer */}
        <div
          className={`bg-slate-950 flex flex-col gap-4 transition-all duration-550 overflow-hidden ${
            !showControls && isPlaying ? "max-h-0 p-0 opacity-0 pointer-events-none" : "max-h-48 p-6 opacity-100"
          }`}
        >
          
          {/* Progress Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 tracking-wider w-10 text-right">
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, "0")}
            </span>
            <input
              type="range"
              min="0"
              max={activeTrack.duration}
              step="0.1"
              value={currentTime}
              onChange={handleTimelineScrub}
              className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] font-black text-slate-500 tracking-wider w-10 text-left">
              {Math.floor(activeTrack.duration / 60)}:{(activeTrack.duration % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {/* Buttons and volume controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              
              {/* Play / Pause */}
              <button
                onClick={() => {
                  audioSynth.unlockSpeech();
                  if (isTrackCompleted) {
                    setCurrentTime(0);
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              {/* Volume / Synth Sound Toggle */}
              <button
                onClick={() => {
                  audioSynth.unlockSpeech();
                  setIsMuted(!isMuted);
                }}
                className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title={isMuted ? "Unmute Tour Audio" : "Mute Tour Audio"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {/* Captions (CC) Toggle */}
              <button
                onClick={() => setShowCaptions((v) => !v)}
                title={showCaptions ? "Hide Captions" : "Show Captions"}
                className={`px-2.5 py-2 rounded-xl border text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                  showCaptions
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                CC
              </button>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                {[1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      audioSynth.unlockSpeech();
                      setPlaybackSpeed(speed);
                    }}
                    className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                      playbackSpeed === speed ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                {(["en", "hi", "hinglish"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      audioSynth.unlockSpeech();
                      setLanguage(lang);
                    }}
                    className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer uppercase ${
                      language === lang ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "Hinglish"}
                    </span>
                    <span className="inline sm:hidden">
                      {lang === "en" ? "EN" : lang === "hi" ? "HI" : "HING"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              
              {/* Conditional Footer "Next" Button for Sequential flow */}
              {isTrackCompleted && activeTrackIdx < filteredTracks.length - 1 && (
                <button
                  onClick={handleNextTrack}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer animate-in fade-in zoom-in-95 duration-300"
                  title="Advance to next chapter"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowCheckbox}
                  onChange={(e) => {
                    setDontShowCheckbox(e.target.checked);
                    if (onDontShowAgain) onDontShowAgain(e.target.checked);
                  }}
                  className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Don&apos;t show again</span>
              </label>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-800 shadow-md cursor-pointer"
              >
                Skip Tour
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
