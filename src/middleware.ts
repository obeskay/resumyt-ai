import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Rutas que necesitan Node.js Runtime
  const nodeRoutes = ["/api/summarize", "/api/generate-questions"];

  if (nodeRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-middleware-runtime", "nodejs");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
