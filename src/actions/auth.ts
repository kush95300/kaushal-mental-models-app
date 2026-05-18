"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt, decrypt, getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(username: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Invalid username or password" };
    }

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
      await prisma.user.create({
        data: {
          username: "admin",
          password: hashedPassword,
          isAdmin: true,
        },
      });
    }
  } catch (err) {
    // Ignore race condition errors during concurrent static generation
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
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin,
      },
    });

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
      select: { id: true, username: true, isAdmin: true, createdAt: true },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Failed to get users" };
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

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return { success: false };
    
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, username: true, isAdmin: true }
    });
    
    if (!user) return { success: false };
    return { success: true, user };
  } catch (error) {
    return { success: false };
  }
}
