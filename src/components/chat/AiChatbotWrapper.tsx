"use client";

import { usePathname } from "next/navigation";
import AiChatbot from "@/components/chat/AiChatbot";

/**
 * AiChatbotWrapper — resolves context from pathname.
 * - On /eisenhower-matrix/[id] → context="matrix", workspaceId parsed from URL
 * - Everywhere else → context="home"
 * Not rendered on /login or /admin pages.
 */
export default function AiChatbotWrapper() {
  const pathname = usePathname();

  // Don't show on login or admin pages
  if (pathname.startsWith("/login") || pathname.startsWith("/admin")) return null;

  const matrixMatch = pathname.match(/\/eisenhower-matrix\/(\d+)/);
  if (matrixMatch) {
    return (
      <AiChatbot
        context="matrix"
        workspaceId={parseInt(matrixMatch[1])}
      />
    );
  }

  return <AiChatbot context="home" />;
}
