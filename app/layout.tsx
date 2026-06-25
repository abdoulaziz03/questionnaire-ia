import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enquête — L'IA dans la relation client en assurance | France × Côte d'Ivoire",
  description:
    "Questionnaire anonyme de recherche (Mémoire de Bachelor en Banque Assurance) sur l'intelligence artificielle comme outil structurant de la relation client dans l'assurance. Enquête comparative France – Côte d'Ivoire.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#16202e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
