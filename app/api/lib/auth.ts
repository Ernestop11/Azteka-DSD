import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "session_azteka";

export async function getCurrentUser(request?: NextRequest) {
  let token: string | undefined;

  if (request) {
    // Use request.cookies for route handlers
    token = request.cookies.get(SESSION_COOKIE)?.value;
  } else {
    // Fallback to cookies() for server components (if needed)
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;

  try {
    // Validate session in database
    // Note: Prisma relation name is "User" (capitalized) per schema.prisma
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        User: {
          select: {
            id: true,
            role: true,
            email: true,
          },
        },
      },
    });

    // Check if session exists and is not expired
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.User;
  } catch {
    return null;
  }
}

// Require specific roles - returns user if authorized, null if not
export async function requireRoles(allowedRoles: string[], request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}

// Require SUPER_ADMIN or ADMIN role
export async function requireAdmin(request?: NextRequest) {
  return requireRoles(['SUPER_ADMIN', 'ADMIN'], request);
}

// Require SUPER_ADMIN only
export async function requireSuperAdmin(request?: NextRequest) {
  return requireRoles(['SUPER_ADMIN'], request);
}

// Require any employee role (EMPLOYEE, DRIVER, ADMIN, SUPER_ADMIN)
export async function requireEmployee(request?: NextRequest) {
  return requireRoles(['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'DRIVER'], request);
}

// Helper to return unauthorized response
export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

