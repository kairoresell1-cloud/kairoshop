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
  // Sessione JWT (non "database"): è il tipo richiesto dal middleware che
  // protegge le rotte a livello di server (Edge Runtime, senza accesso al DB).
  // L'adapter Prisma resta comunque attivo per creare/collegare gli account Google.
  session: { strategy: "jwt" },
  events: {
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
    // Con strategy "jwt", i dati utente vengono caricati nel token al login
    // e poi riletti dal DB ad ogni richiesta (cosi ruolo/permessi restano aggiornati
    // anche se cambiati dall'Owner dopo il login).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        include: { permissions: true },
      });
      if (dbUser) {
        token.role = dbUser.role;
        token.permissions = dbUser.permissions.map((p) => p.key);
        token.banned = dbUser.banned;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.permissions = token.permissions || [];
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
