import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const socialImage = `${baseUrl}/og.png`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "New Era Presentation",
      template: "%s — New Era Presentation",
    },
    description:
      "QRから参加し、リアクションと対話がスライドに同期する。Codex + GPT-5.6 + ChatGPT Sitesでつくった、参加型プレゼンテーション・メディア。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "プレゼンテーションは、新時代へ。",
      description: "観るものから、参加するものへ。",
      type: "website",
      images: [{ url: socialImage, width: 1729, height: 910, alt: "New Era Presentation — OpenAI Build Week 2026" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "プレゼンテーションは、新時代へ。",
      description: "観るものから、参加するものへ。",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07080c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
