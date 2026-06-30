import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalClientContainer from "@/components/global-client-container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEATSHIELD AI | Urban Heat Mitigation & Cooling Platform",
  description: "Optimizing urban heat islands and cooling strategies using remote sensing, machine learning, digital twins, and AI decision-support systems.",
  keywords: ["Urban Heat Island", "Remote Sensing", "Digital Twin", "Climate AI", "Cooling Strategies", "Sustainable City Planning"],
  authors: [{ name: "HEATSHIELD AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      id="heatshield-root-html"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" id="heatshield-root-body" suppressHydrationWarning>
        <GlobalClientContainer>
          {children}
        </GlobalClientContainer>
      </body>
    </html>
  );
}
