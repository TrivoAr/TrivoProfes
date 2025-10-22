import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Si no hay token, NextAuth ya lo redirige al login
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/outings/:path*",
    "/teams/:path*",
    "/academies/:path*",
    "/members/:path*",
    "/payments/:path*",
  ],
};
