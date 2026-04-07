import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session-token");
  const isLoggedIn = !!token;

  const { pathname } = request.nextUrl;
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnAuth =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png).*)",
  ],
};
