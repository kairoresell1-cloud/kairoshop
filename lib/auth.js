import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "database" },
  events: {
    // Al momento giusto del ciclo di vita (dopo che l'account Google è
    // stato collegato correttamente), assegna il ruolo Super Owner se
    // l'email corrisponde a quella configurata.
    async createUser({ user }) {
      if (user.email === process.env.SUPER_OWNER_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "SUPER_OWNER" },
        });
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (existing?.banned) return false;
      return true;
    },
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { permissions: true },
      });
      session.user.id = dbUser.id;
      session.user.role = dbUser.role;
      session.user.permissions = dbUser.permissions.map((p) => p.key);
      return session;
    },
  },
  pages: {
    signIn: "/", // bottone "Accedi con Google" è in homepage
  },
};
