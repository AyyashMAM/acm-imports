import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const isForgotPage = pathname === "/admin/forgot-password";
    // Reachable by anyone with a valid (even non-admin) recovery session from
    // a reset-password email link — the page itself checks for that session.
    const isResetPage = pathname === "/admin/reset-password";
    const isAdmin = !!user && role === "admin";

    if (!isAdmin && !isLoginPage && !isForgotPage && !isResetPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (isAdmin && (isLoginPage || isForgotPage)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (pathname.startsWith("/account")) {
    const isPublicAuthPage =
      pathname === "/account/login" ||
      pathname === "/account/signup" ||
      pathname === "/account/forgot-password";
    // Same reasoning as /admin/reset-password above.
    const isResetPage = pathname === "/account/reset-password";

    if (!user && !isPublicAuthPage && !isResetPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (user && isPublicAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*"],
};
