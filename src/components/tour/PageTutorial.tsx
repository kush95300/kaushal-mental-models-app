"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { audioSynth } from "@/lib/audio";

export interface TutorialStep {
  selector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

interface PageTutorialProps {
  pageKey: string; // e.g. 'eisenhower' or 'analytics'
  steps: TutorialStep[];
  onClose: (completed?: boolean) => void;
  onDontShowAgain?: (val: boolean) => void;
  onStepChange?: (index: number) => void;
}

export const PageTutorial: React.FC<PageTutorialProps> = ({
  pageKey,
  steps,
  onClose,
  onDontShowAgain,
  onStepChange
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 350, height: 180 });
  const activeStep = steps[currentStepIdx];

  // Callback ref to safely calculate dynamic dimensions without accessing ref in render loop
  const tooltipCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setDimensions({
        width: node.offsetWidth,
        height: node.offsetHeight
      });
    }
  }, []);

  // Recalculate target coordinates on step change, resize, or scroll
  const updateCoords = useCallback((shouldScroll: boolean = false) => {
    if (!activeStep || activeStep.selector === "body") {
      setCoords(null);
      return;
    }

    const element = document.querySelector(activeStep.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
      if (shouldScroll) {
        let scrollBlock: ScrollIntoViewOptions["block"] = "center";
        if (activeStep.position === "top") {
          scrollBlock = "end";
        } else if (activeStep.position === "bottom") {
          scrollBlock = "start";
        }
        element.scrollIntoView({ behavior: "smooth", block: scrollBlock });
      }
    } else {
      setCoords(null);
    }
  }, [activeStep]);

  // Scroll element into view and play tick ONLY on step change
  useEffect(() => {
    updateCoords(true);
    audioSynth.playTick();
    if (onStepChange) {
      onStepChange(currentStepIdx);
    }
  }, [currentStepIdx, updateCoords, onStepChange]);

  // Handle scroll and resize without triggering scrollIntoView (which would hijack scrolling)
  useEffect(() => {
    const handleScrollOrResize = () => {
      updateCoords(false);
    };
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize);
    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize);
    };
  }, [updateCoords]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      audioSynth.playSuccess();
      onClose(true);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    audioSynth.playSwoosh();
    onClose(false);
  };

  // Determine popover coordinate positions relative to target coordinates
  const getTooltipStyle = (): React.CSSProperties => {
    if (!coords) {
      // Centered fallback
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 210,
        maxWidth: "450px",
        width: "90%"
      };
    }

    const margin = 16;
    const tooltipWidth = dimensions.width || 350;
    const tooltipHeight = dimensions.height || 180;

    let top = 0;
    let left = 0;

    switch (activeStep.position) {
      case "bottom":
        top = coords.top + coords.height + margin;
        left = coords.left + coords.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = coords.top - tooltipHeight - margin;
        left = coords.left + coords.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = coords.top + coords.height / 2 - tooltipHeight / 2;
        left = coords.left - tooltipWidth - margin;
        break;
      case "right":
        top = coords.top + coords.height / 2 - tooltipHeight / 2;
        left = coords.left + coords.width + margin;
        break;
      case "center":
      default:
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 210,
          maxWidth: "450px",
          width: "90%"
        };
    }

    // Edge constraint handling
    const padding = 10;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 210,
      width: `${tooltipWidth}px`
    };
  };

  return (
    <div className="fixed inset-0 z-[190] pointer-events-none">
      
      {/* High-contrast backdrop mask overlays */}
      {!coords ? (
        activeStep?.selector === "body" ? (
          <div 
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-[4px] transition-all duration-300 pointer-events-auto"
            style={{ zIndex: 180 }}
            onClick={handleSkip}
          />
        ) : null
      ) : (
        <>
          {/* Top blur overlay */}
          <div
            className="absolute transition-all duration-300 pointer-events-none bg-slate-950/65 backdrop-blur-[4px]"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: `${Math.max(0, coords.top - 4)}px`,
              zIndex: 180
            }}
          />
          {/* Bottom blur overlay */}
          <div
            className="absolute transition-all duration-300 pointer-events-none bg-slate-950/65 backdrop-blur-[4px]"
            style={{
              top: `${coords.top + coords.height + 4}px`,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 180
            }}
          />
          {/* Left blur overlay */}
          <div
            className="absolute transition-all duration-300 pointer-events-none bg-slate-950/65 backdrop-blur-[4px]"
            style={{
              top: `${Math.max(0, coords.top - 4)}px`,
              left: 0,
              width: `${Math.max(0, coords.left - 4)}px`,
              height: `${coords.height + 8}px`,
              zIndex: 180
            }}
          />
          {/* Right blur overlay */}
          <div
            className="absolute transition-all duration-300 pointer-events-none bg-slate-950/65 backdrop-blur-[4px]"
            style={{
              top: `${Math.max(0, coords.top - 4)}px`,
              left: `${coords.left + coords.width + 4}px`,
              right: 0,
              height: `${coords.height + 8}px`,
              zIndex: 180
            }}
          />
        </>
      )}

      {/* Target Focus Highlight Ring */}
      {coords && (
        <div
          className="absolute border-2 border-indigo-500 rounded-2xl ring-8 ring-indigo-500/10 pointer-events-none transition-all duration-300 animate-pulse"
          style={{
            top: `${coords.top - 4}px`,
            left: `${coords.left - 4}px`,
            width: `${coords.width + 8}px`,
            height: `${coords.height + 8}px`,
            zIndex: 185
          }}
        />
      )}

      {/* Tethered Walkthrough Tooltip Popover */}
      <div
        key={currentStepIdx}
        ref={tooltipCallbackRef}
        style={getTooltipStyle()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl pointer-events-auto transition-all duration-300 flex flex-col gap-4 font-sans text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Tutorial Step {currentStepIdx + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-md font-black tracking-tight">{activeStep.title}</h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeStep.description}
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => {
                setDontShowAgain(e.target.checked);
                if (onDontShowAgain) onDontShowAgain(e.target.checked);
              }}
              className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-3 h-3"
            />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Don&apos;t show</span>
          </label>

          <div className="flex items-center gap-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handleBack}
                className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg active:scale-95 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
            >
              {currentStepIdx === steps.length - 1 ? "Finish" : "Next"} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
