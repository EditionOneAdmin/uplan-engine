import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "U-Plan Engine — Machbarkeitsentscheidung in Minuten",
  description:
    "...automatisiert und optimiert die Machbarkeitsprüfung & Variantenplanung. U-Plan Engine findet die beste Planung für Ihr Grundstück.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
