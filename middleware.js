import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isRateLimited } from "./lib/rate-limit";

const authMiddleware = withAuth({
  pages: {
    signIn: "/",
  },
});

// Questo middleware gira PRIMA di qualsiasi pagina protetta, quindi blocca
// l'accesso diretto via URL (copia/incolla del link) se non c'è una sessione
// valida — non solo i click dentro l'app come succedeva prima.
// Applica anche un rate limit di base per IP su tutte le richieste protette
// e sulle rotte di autenticazione/API più sensibili.
export default async function middleware(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Troppe richieste, riprova in un minuto." },
      { status: 429 }
    );
  }

  // Le rotte di NextAuth (login/callback Google) devono restare accessibili
  // SENZA richiedere già una sessione, altrimenti il login si rompe da solo.
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  return authMiddleware(req);
}

export const config = {
  matcher: [
    "/shop/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
    "/api/orders/:path*",
    "/api/products/:path*",
  ],
};
