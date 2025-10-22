import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      rol: string;
      imagen?: string;
      telnumber?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    rol: string;
    imagen?: string;
    telnumber?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      rol: string;
      imagen?: string;
      telnumber?: string;
    };
  }
}
