import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname

  // Redirect to login if no token for protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Check role-based access
  if (path.startsWith("/teacher") && token.role !== "teacher") {
    return NextResponse.redirect(new URL("/student/dashboard", req.url))
  }

  if (path.startsWith("/student") && token.role !== "student") {
    return NextResponse.redirect(new URL("/teacher/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/test/:path*"],
}
