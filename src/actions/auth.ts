"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt, decrypt, getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function ensureDefaultWorkspaces(userId: number) {
  const count = await prisma.workspace.count({ where: { userId } });
  if (count === 0) {
    await prisma.workspace.create({
      data: { name: "Personal", description: "Personal tasks and goals", color: "bg-indigo-500", icon: "User", userId },
    });
    await prisma.workspace.create({
      data: { name: "Work", description: "Professional projects and deadlines", color: "bg-amber-500", icon: "Briefcase", userId },
    });
  }
}

export async function login(username: string, password: string) {
  try {
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
    const session = await encrypt({ id: user.id, username: user.username, isAdmin: user.isAdmin, expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, { expires, httpOnly: true });

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
  try {
    const existing = await prisma.user.findUnique({ where: { username: "admin" } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      const admin = await prisma.user.create({
        data: {
          username: "admin",
          password: hashedPassword,
          isAdmin: true,
          status: "APPROVED",
        },
      });
      await ensureDefaultWorkspaces(admin.id);
    } else {
      await ensureDefaultWorkspaces(existing.id);
    }
  } catch (err) {
    // Ignore race condition errors during concurrent static generation
  }
}

export async function requestAccount(username: string, password: string) {
  try {
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
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Request account error:", error);
    return { success: false, error: "Failed to request account" };
  }
}

export async function createUser(username: string, password: string, isAdmin: boolean) {
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

    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function changeAdminPassword(oldPassword: string, newPassword: string) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return { success: false, error: "Unauthorized" };

    const payload = await decrypt(session);
    if (!payload || !payload.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return { success: false, error: "User not found" };

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return { success: false, error: "Incorrect current password" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return { success: false };
    
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, username: true, isAdmin: true, status: true }
    });
    
    if (!user) return { success: false };
    return { success: true, user };
  } catch (error) {
    return { success: false };
  }
}
