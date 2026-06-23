import "./globals.css";
import SakuraPetals from "@/components/SakuraPetals";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Kairo Shop",
  description: "Kairo Shop — Resell Store premium",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="relative min-h-screen bg-kairo-black">
        <SakuraPetals />
        <Providers>
          <div className="relative z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
