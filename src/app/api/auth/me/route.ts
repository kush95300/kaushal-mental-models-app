/**
 * GET /api/auth/me
 * Returns current session user (id, username, isAdmin).
 * Used by client components (AiChatbot) to check auth state.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      isAdmin: session.isAdmin,
    },
  });
}
