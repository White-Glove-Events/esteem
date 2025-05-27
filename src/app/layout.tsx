import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "circles – effortless team accountability",
  description:
    "Circles makes team accountability effortless. Set daily goals, track progress, and get clear, supportive feedback—so everyone grows, together.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "circles – effortless team accountability",
    description:
      "Circles makes team accountability effortless. Set daily goals, track progress, and get clear, supportive feedback—so everyone grows, together.",
    url: "https://getcircles.io",
    siteName: "circles",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "circles logo and value proposition",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "circles – effortless team accountability",
    description:
      "Circles makes team accountability effortless. Set daily goals, track progress, and get clear, supportive feedback—so everyone grows, together.",
    images: ["/opengraph-image.png"],
    creator: "@getcirclesio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
