import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alban & Baptistine",
  description: "Partagez vos photos et vos mots pour ce beau jour",
  manifest: "/manifest.json",
  themeColor: "#F4EADE",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "A&B" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
