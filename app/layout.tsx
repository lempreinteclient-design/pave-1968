import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavé 1968 · T-shirts de la rue",
  description: "T-shirts imprimés à la demande, entre Mai 68 et la mobilisation étudiante d'aujourd'hui.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Special+Elite&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="footer">
            <p>Pavé 1968 · Toujours dans la rue.</p>
            <nav>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/cgv">CGV</Link>
            </nav>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
