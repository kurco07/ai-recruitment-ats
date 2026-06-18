import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"];

const ROLE_HOME = {
  recruiter: "/recruiter/dashboard",
  hiring_manager: "/manager/dashboard",
  admin: "/admin/users",
  candidate: "/candidate/dashboard",
};

const ROLE_PREFIX = {
  recruiter: "/recruiter",
  hiring_manager: "/manager",
  admin: "/admin",
  candidate: "/candidate",
};

export async function middleware(request) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isApi = pathname.startsWith("/api");

  if (isApi) {
    return supabaseResponse;
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "candidate";
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    return NextResponse.redirect(url);
  }

  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "no_profile");
      return NextResponse.redirect(url);
    }

    const role = profile.role;
    supabaseResponse.headers.set("x-user-role", role);
    const allowedPrefix = ROLE_PREFIX[role];

    const isRecruiterArea = pathname.startsWith("/recruiter");
    const isManagerArea = pathname.startsWith("/manager");
    const isAdminArea = pathname.startsWith("/admin");
    const isCandidateArea = pathname.startsWith("/candidate");

    const inProtectedArea =
      isRecruiterArea || isManagerArea || isAdminArea || isCandidateArea;

    if (inProtectedArea) {
      const hasAccess =
        (role === "admin") ||
        (role === "recruiter" && (isRecruiterArea || isManagerArea)) ||
        (role === "hiring_manager" && isManagerArea) ||
        (role === "candidate" && isCandidateArea);

      if (!hasAccess) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_HOME[role];
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
