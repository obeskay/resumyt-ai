import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación (sin el prefijo de idioma)
const protectedRoutes = ["/profile"];
// Rutas públicas para usuarios no autenticados
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  // Verificar el token de NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Extraer la ruta sin el prefijo del idioma
  const segments = pathname.split("/");
  const pathWithoutLocale = "/" + (segments.length > 1 ? segments[1] : "");

  // Si el usuario intenta acceder a una ruta protegida y no está autenticado
  if (protectedRoutes.includes(pathWithoutLocale) && !token) {
    const returnUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/login?returnUrl=${returnUrl}`, request.url),
    );
  }

  // Si el usuario está autenticado e intenta acceder a rutas de auth
  if (authRoutes.includes(pathWithoutLocale) && token) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }

  // Para todas las demás rutas, permitir el acceso
  return NextResponse.next();
}

// Modificar el matcher para que incluya las rutas con locale
export const config = {
  matcher: ["/profile/:path*", "/login", "/register"],
};
