import { withAuth } from "next-auth/middleware";

// Questo middleware gira PRIMA di qualsiasi pagina protetta, quindi blocca
// l'accesso diretto via URL (copia/incolla del link) se non c'è una sessione
// valida — non solo i click dentro l'app come succedeva prima.
export default withAuth({
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: [
    "/shop/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
