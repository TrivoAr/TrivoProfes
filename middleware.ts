import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware para manejar rutas públicas (login, register, etc.)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Si intenta acceder a /login o rutas públicas, verificar si ya está autenticado
  if (pathname === "/login" || pathname === "/register") {
    const token = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

    // Si ya está autenticado, redirigir al dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

// Configuración del middleware con withAuth para rutas protegidas
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirigir usuarios autenticados que intentan acceder a login
    if ((pathname === "/login" || pathname === "/register") && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Si no hay token en rutas protegidas, NextAuth redirige al login automáticamente
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Roles permitidos para acceder al panel de profesores
    const allowedRoles = ["admin", "profe", "dueño de academia"];

    // Si el usuario tiene un rol no permitido, redirigir a página de acceso denegado
    if (!allowedRoles.includes(token.user?.rol as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Permitir acceso a login/register sin token
        if (pathname === "/login" || pathname === "/register") {
          return true;
        }

        // Para otras rutas, requiere token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // Ruta raíz
    "/",
    // Rutas protegidas que requieren autenticación
    "/dashboard/:path*",
    "/outings/:path*",
    "/teams/:path*",
    "/academies/:path*",
    "/members/:path*",
    "/payments/:path*",
    "/settings/:path*",
    // Rutas públicas para redirigir si ya está autenticado
    "/login",
    "/register",
  ],
};
