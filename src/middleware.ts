import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "super-secret-key-for-development";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Protect /eisenhower-matrix, /admin and /
  if (pathname === "/" || pathname.startsWith("/eisenhower-matrix") || pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    try {
      const { payload } = await jwtVerify(session, key, {
        algorithms: ["HS256"],
      });
      
      // If going to admin portal, check if user is admin
      if (pathname.startsWith("/admin") && !payload.isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Prevent logged in users from seeing the login page
  if (pathname === "/login") {
    if (session) {
      try {
        await jwtVerify(session, key, { algorithms: ["HS256"] });
        return NextResponse.redirect(new URL("/", request.url));
      } catch (err) {
        // invalid session is fine, let them see login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/eisenhower-matrix/:path*", "/admin/:path*"],
};
