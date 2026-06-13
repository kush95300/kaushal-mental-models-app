"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt, decrypt, getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// In-Memory Rate Limiter for Brute Force Protection
type RateLimitEntry = { count: number; resetTime: number };
const rateLimitMap = new Map<string, RateLimitEntry>();
let adminInitialized = false;

function checkRateLimit(identifier: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count += 1;
  return { success: true };
}

export async function ensureDefaultWorkspaces(userId: number) {
  const count = await prisma.workspace.count({ where: { userId } });
  if (count === 0) {
    await prisma.workspace.create({
      data: {
        name: "Personal",
        description: "Personal tasks and goals",
        color: "bg-indigo-500",
        icon: "User",
        userId,
      },
    });
    await prisma.workspace.create({
      data: {
        name: "Work",
        description: "Professional projects and deadlines",
        color: "bg-amber-500",
        icon: "Briefcase",
        userId,
      },
    });
  }
}

export async function login(username: string, password: string) {
  try {
    if (!checkRateLimit(`login_${username}`).success) {
      return {
        success: false,
        error: "Too many login attempts. Please try again in a minute.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    if (user.status === "PENDING") {
      return { success: false, error: "Account pending admin approval" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Invalid username or password" };
    }

    await ensureDefaultWorkspaces(user.id);

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      tokenVersion: user.tokenVersion,
      expires,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Failed to log in" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
  redirect("/login");
}

export async function createInitialAdmin() {
  if (adminInitialized) return;
  try {
    const existing = await prisma.user.findUnique({
      where: { username: "admin" },
    });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      const admin = await prisma.user.create({
        data: {
          username: "admin",
          password: hashedPassword,
          isAdmin: true,
          status: "APPROVED",
          tokenVersion: 0,
        },
      });
      await ensureDefaultWorkspaces(admin.id);
    } else {
      await ensureDefaultWorkspaces(existing.id);
    }
    adminInitialized = true;
  } catch (err) {
    // Ignore race condition errors during concurrent static generation
  }
}

export async function requestAccount(username: string, password: string) {
  try {
    if (!checkRateLimit(`req_${username}`).success) {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
      };
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin: false,
        status: "PENDING",
        tokenVersion: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Request account error:", error);
    return { success: false, error: "Failed to request account" };
  }
}

export async function createUser(
  username: string,
  password: string,
  isAdmin: boolean,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin,
        status: "APPROVED",
        tokenVersion: 0,
      },
    });

    await ensureDefaultWorkspaces(newUser.id);

    return { success: true };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUsers() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const users = await prisma.user.findMany({
      where: { status: "APPROVED" },
      select: { id: true, username: true, isAdmin: true, createdAt: true },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Failed to get users" };
  }
}

export async function getPendingUsers() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const users = await prisma.user.findMany({
      where: { status: "PENDING" },
      select: { id: true, username: true, createdAt: true },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Get pending users error:", error);
    return { success: false, error: "Failed to get pending users" };
  }
}

export async function approveUser(id: number) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    await ensureDefaultWorkspaces(user.id);

    return { success: true };
  } catch (error) {
    console.error("Approve user error:", error);
    return { success: false, error: "Failed to approve user" };
  }
}

export async function deleteUser(id: number) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    if (payload.id === id) {
      return { success: false, error: "Cannot delete yourself" };
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) return { success: false, error: "User not found" };
    if (userToDelete.username === "admin") {
      return { success: false, error: "Cannot delete the root admin account" };
    }

    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function changeUserPassword(
  oldPassword: string,
  newPassword: string,
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return { success: false, error: "User not found" };

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return { success: false, error: "Incorrect current password" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: payload.id },
        data: { password: hashedPassword, tokenVersion: { increment: 1 } },
      }),
      prisma.passwordHistory.create({
        data: {
          userId: payload.id,
          username: user.username,
          action: "PASSWORD_CHANGED",
        },
      }),
      prisma.passwordResetRequest.updateMany({
        where: {
          username: user.username,
          status: "APPROVED",
        },
        data: {
          tempPassword: null,
          status: "COMPLETED",
          resolvedAt: new Date(),
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

export const changeAdminPassword = changeUserPassword;

export async function isAdminPasswordDefault() {
  try {
    const admin = await prisma.user.findUnique({
      where: { username: "admin" },
    });
    if (!admin) return false;
    const isMatch = await bcrypt.compare("admin", admin.password);
    return isMatch;
  } catch (err) {
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return { success: false };

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, username: true, isAdmin: true, status: true },
    });

    if (!user || user.status !== "APPROVED") return { success: false };
    return { success: true, user };
  } catch (error) {
    return { success: false };
  }
}

export async function requestPasswordReset(username: string) {
  try {
    if (!checkRateLimit(`reset_${username}`, 3, 300000)) {
      return {
        success: false,
        error: "Too many reset attempts. Please try again in 5 minutes.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Username not found" };
    }

    if (user.status !== "APPROVED") {
      return { success: false, error: "Account is not active/approved" };
    }

    const existingRequest = await prisma.passwordResetRequest.findFirst({
      where: { username, status: "PENDING" },
    });

    if (existingRequest) {
      return {
        success: false,
        error: "A password reset request is already pending for this account.",
      };
    }

    await prisma.$transaction([
      prisma.passwordResetRequest.create({
        data: {
          username,
          status: "PENDING",
        },
      }),
      prisma.passwordHistory.create({
        data: {
          userId: user.id,
          username: user.username,
          action: "REQUEST_CREATED",
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Request password reset error:", error);
    return { success: false, error: "Failed to submit reset request" };
  }
}

export async function getPasswordResetRequests() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const requests = await prisma.passwordResetRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, requests };
  } catch (error) {
    console.error("Get password reset requests error:", error);
    return { success: false, error: "Failed to get reset requests" };
  }
}

export async function resolvePasswordResetRequest(
  id: number,
  action: "approve" | "reject",
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const request = await prisma.passwordResetRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return { success: false, error: "Reset request not found" };
    }

    if (request.status !== "PENDING") {
      return { success: false, error: "Request is already resolved" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { username: request.username },
    });

    const targetUserId = targetUser ? targetUser.id : 0;

    if (action === "reject") {
      await prisma.$transaction([
        prisma.passwordResetRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            resolvedAt: new Date(),
          },
        }),
        prisma.passwordHistory.create({
          data: {
            userId: targetUserId,
            username: request.username,
            action: "REQUEST_REJECTED",
          },
        }),
      ]);
      return { success: true };
    }

    if (!targetUser) {
      return { success: false, error: "Target user not found" };
    }

    // Generate random password
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tempPass = "temp-";
    for (let i = 0; i < 6; i++) {
      tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hashedPassword = await bcrypt.hash(tempPass, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { username: request.username },
        data: {
          password: hashedPassword,
          tokenVersion: { increment: 1 }, // Invalidate sessions
        },
      }),
      prisma.passwordResetRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          tempPassword: tempPass,
          resolvedAt: new Date(),
        },
      }),
      prisma.passwordHistory.create({
        data: {
          userId: targetUser.id,
          username: request.username,
          action: "REQUEST_APPROVED",
        },
      }),
    ]);

    return { success: true, tempPassword: tempPass };
  } catch (error) {
    console.error("Resolve password reset request error:", error);
    return { success: false, error: "Failed to resolve reset request" };
  }
}

export async function getPasswordHistory() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const history = await prisma.passwordHistory.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, history };
  } catch (error) {
    console.error("Get password history error:", error);
    return { success: false, error: "Failed to fetch password history" };
  }
}

