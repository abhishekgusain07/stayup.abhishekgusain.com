import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "../components/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayUp - Global Website Uptime Monitoring & Performance Analytics",
  description: "Monitor your websites 24/7 with StayUp's global uptime monitoring. Get instant alerts, performance analytics, and status pages. 99.9% uptime guarantee with monitoring from 15+ global locations.",
  keywords: "uptime monitoring, website monitoring, performance monitoring, website uptime, downtime alerts, website performance, global monitoring, uptime checker, website status, performance analytics",
  authors: [{ name: "StayUp" }],
  creator: "StayUp",
  publisher: "StayUp",
  category: "Technology",
  classification: "Website Monitoring Service",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      me: ["https://stayup.abhishekgusain.com", "mailto:hello@stayup.abhishekgusain.com"],
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stayup.abhishekgusain.com",
    siteName: "StayUp - Website Uptime Monitoring",
    title: "StayUp - Global Website Uptime Monitoring & Performance Analytics",
    description: "Monitor your websites 24/7 with StayUp's global uptime monitoring. Get instant alerts, performance analytics, and status pages. 99.9% uptime guarantee.",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "StayUp - Website Uptime Monitoring Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StayUp - Global Website Uptime Monitoring",
    description: "Monitor your websites 24/7 with global uptime monitoring. Get instant alerts and performance analytics. 99.9% uptime guarantee.",
    images: ["/banner.png"],
    creator: "@stayup",
    site: "@stayup",
  },
  alternates: {
    canonical: "https://stayup.abhishekgusain.com",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <PostHogProvider>
          <Toaster />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
