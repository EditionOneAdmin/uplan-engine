import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "U-Plan Engine — Vom Flürstück zur Genehmigungsreife",
  description:
    "U-Plan Engine automatisiert die Machbarkeitsprüfung, Variantenplanung und Bauantragsaufbereitung — nachvollziehbar, versioniert und auditierbar.",
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
