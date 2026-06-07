import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set in production!",
    );
  }
  return secret || "super-secret-key-for-development";
};

const getKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, getKey(), {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    if (!payload || !payload.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        isAdmin: true,
        status: true,
        tokenVersion: true,
      },
    });

    if (
      !user ||
      user.status !== "APPROVED" ||
      user.tokenVersion !== payload.tokenVersion
    ) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
