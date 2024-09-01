import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "@/i18n-config";

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language")?.split(",")[0].split("-")[0];
  return i18n.locales.includes(acceptLanguage as any) ? acceptLanguage as string : i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // No aplicar el middleware a las rutas API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Verifica si la ruta ya tiene un locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Si la ruta no tiene un locale, redirige a la ruta con el locale por defecto
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const url = new URL(`/${locale}${pathname}`, request.url);

    // Evita redirecciones infinitas
    if (url.href !== request.url) {
      return NextResponse.redirect(url);
    }
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};