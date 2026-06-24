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
  callbacks: {
    async signIn({ user }) {
      // Al primo login, se l'email corrisponde al Super Owner configurato
      // su Railway (variabile SUPER_OWNER_EMAIL), gli viene assegnato
      // automaticamente il ruolo SUPER_OWNER. Nessun altro può ottenerlo
      // tramite login: solo questa email, e solo se non esiste già un
      // Super Owner registrato con un'altra email (regola "deve sempre
      // esistere almeno 1 Super Owner" + "nessuno lo può rimuovere").
      if (user.email === process.env.SUPER_OWNER_EMAIL) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { role: "SUPER_OWNER" },
          create: { email: user.email, role: "SUPER_OWNER" },
        });
      }
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
