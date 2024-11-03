import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "@/i18n-config";
import { getToken } from "next-auth/jwt";

// Rutas que no requieren autenticación
const PUBLIC_PATHS = ["/", "/login", "/register", "/summary"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname should handle i18n
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale =
      request.cookies.get("NEXT_LOCALE")?.value || i18n.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Get the pathname without the locale
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, "/");
  const locale = pathname.split("/")[1];

  // Verificar el token de NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si la ruta es pública, permitir acceso
  if (PUBLIC_PATHS.some((path) => pathnameWithoutLocale.startsWith(path))) {
    // Si el usuario está autenticado y trata de acceder a login/register, redirigir a profile
    if (token && ["/login", "/register"].includes(pathnameWithoutLocale)) {
      return NextResponse.redirect(new URL(`/${locale}/profile`, request.url));
    }
    return NextResponse.next();
  }

  // Si el usuario no está autenticado y trata de acceder a una ruta protegida
  if (!token && !PUBLIC_PATHS.includes(pathnameWithoutLocale)) {
    // Crear una nueva URL para la redirección
    const returnPath = `/${locale}${pathnameWithoutLocale}`; // Construimos la ruta de retorno correctamente
    const returnUrl = encodeURIComponent(new URL(returnPath, request.url).href);

    return NextResponse.redirect(
      new URL(`/${locale}/login?returnUrl=${returnUrl}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
