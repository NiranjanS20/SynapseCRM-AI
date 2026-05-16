import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/providers";

// Using Inter as the sans font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Setup Satoshi as a local font
// Note: We need to place satoshi woff2 files in public/fonts/satoshi/
// For now, it is commented out to prevent Next.js build errors until the files are added.
/*
const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
});
*/

// Temporary fallback for display font
const satoshi = { variable: "font-sans" };

export const metadata: Metadata = {
  title: "SynapseCRM AI | Autonomous Intelligence",
  description: "Intelligent operating system for revenue teams. Enterprise multi-agent AI CRM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${satoshi.variable}`}>
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-sage-500/30 selection:text-sage-300 font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
