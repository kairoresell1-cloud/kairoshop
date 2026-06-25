import "./globals.css";
import SakuraPetals from "@/components/SakuraPetals";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Kairo Shop",
  description: "Kairo Shop — Resell Store premium",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="relative min-h-screen bg-kairo-black">
        <SakuraPetals />
        <Providers>
          <div className="relative z-10">
            <AppShell>{children}</AppShell>
          </div>
        </Providers>
      </body>
    </html>
  );
}
