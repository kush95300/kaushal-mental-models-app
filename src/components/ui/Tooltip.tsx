import React, { ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "bottom" | "top" | "left" | "right";
  align?: "center" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "bottom",
  align = "center",
  className = "",
}) => {
  let positionClasses = "";
  let arrowClasses = "";

  if (position === "bottom") {
    positionClasses = "top-full mt-2.5";
    arrowClasses = "-top-1 left-1/2 -translate-x-1/2 border-l border-t";
    if (align === "left") positionClasses += " left-0";
    else if (align === "right") positionClasses += " right-0";
    else positionClasses += " left-1/2 -translate-x-1/2";
  } else if (position === "top") {
    positionClasses = "bottom-full mb-2.5";
    arrowClasses = "-bottom-1 left-1/2 -translate-x-1/2 border-r border-b";
    if (align === "left") positionClasses += " left-0";
    else if (align === "right") positionClasses += " right-0";
    else positionClasses += " left-1/2 -translate-x-1/2";
  } else if (position === "left") {
    positionClasses = "right-full mr-2.5 top-1/2 -translate-y-1/2";
    arrowClasses = "-right-1 top-1/2 -translate-y-1/2 border-r border-t";
  } else if (position === "right") {
    positionClasses = "left-full ml-2.5 top-1/2 -translate-y-1/2";
    arrowClasses = "-left-1 top-1/2 -translate-y-1/2 border-l border-b";
  }

  return (
    <div className={`relative inline-flex group/tooltip items-center justify-center z-10 hover:z-[9999] ${className}`}>
      {children}
      <div
        className={`absolute ${positionClasses} hidden group-hover/tooltip:block z-[500] w-max max-w-xs p-3 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-700 pointer-events-none text-center normal-case tracking-normal font-sans leading-relaxed`}
      >
        {content}
        <div
          className={`absolute w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-slate-700 ${arrowClasses}`}
        />
      </div>
    </div>
  );
};
