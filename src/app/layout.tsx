import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AGMA TEC — Digital Transformation",
  description:
    "AGMA TEC is a digital transformation company. We design, build and scale enterprise software, cloud platforms and data & AI products that connect every part of your business.",
  keywords: [
    "AGMA TEC",
    "Digital Transformation",
    "Software Development",
    "Cloud",
    "Data & AI",
    "Enterprise Software",
  ],
  authors: [{ name: "AGMA TEC" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AGMA TEC — Digital Transformation",
    description:
      "We build the software that transforms ambitious businesses.",
    siteName: "AGMA TEC",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050B16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${display.variable} ${sans.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0D1B30",
              border: "1px solid rgba(122,164,224,0.2)",
              color: "#E9F0FA",
            },
          }}
        />
      </body>
    </html>
  );
}
