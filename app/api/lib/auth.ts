import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "session_azteka";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  
  try {
    // Validate session in database (same as middleware)
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
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

    return session.user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

