import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email })
          .select("+password");

        if (!user) {
          throw new Error("Credenciales inválidas");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Credenciales inválidas");
        }

        // Solo permitir acceso a admins, profes y dueños de academia
        if (!["admin", "profe", "dueño de academia"].includes(user.rol)) {
          throw new Error("No tienes permisos para acceder al panel de profesores");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          rol: user.rol,
          imagen: user.imagen,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
