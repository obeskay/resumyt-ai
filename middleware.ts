import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protege las rutas que requieren autenticación
  if (req.nextUrl.pathname.startsWith("/profile") && !session) {
    const lang = req.nextUrl.pathname.split("/")[1] || "es";
    return NextResponse.redirect(new URL(`/${lang}/login`, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/profile/:path*"],
};
