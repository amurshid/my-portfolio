import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SITE } from "./lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const title = `${SITE.name} — ${SITE.role}`;

export const metadata: Metadata = {
  title,
  description: SITE.tagline,
  openGraph: {
    title,
    description: SITE.tagline,
    siteName: SITE.name,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
