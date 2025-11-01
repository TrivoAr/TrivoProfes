import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirigir usuarios autenticados que intentan acceder a login
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirigir la raíz al login si no hay sesión, al dashboard si hay sesión
    if (pathname === "/") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Roles permitidos para acceder al panel de profesores
    const allowedRoles = ["admin", "profe", "dueño de academia"];

    // Si el usuario tiene un rol no permitido, redirigir a página de acceso denegado
    if (token && !allowedRoles.includes(token.user?.rol as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Permitir acceso a login sin token
        if (pathname === "/login") {
          return true;
        }

        // Permitir acceso a la raíz (se manejará en el middleware)
        if (pathname === "/") {
          return true;
        }

        // Para todas las demás rutas, requiere token
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
    /*
     * Coincide con todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public (archivos públicos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
