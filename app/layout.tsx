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
      "Not more disposable AI slides. Build presentations worth joining and remembering—with Codex, GPT-5.6, ChatGPT Sites, and Cloudflare.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "New Era Presentation",
      description: "AI made slides fast. We make them human.",
      type: "website",
      images: [{ url: socialImage, width: 1729, height: 910, alt: "New Era Presentation — OpenAI Build Week 2026" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "New Era Presentation",
      description: "AI made slides fast. We make them human.",
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
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
