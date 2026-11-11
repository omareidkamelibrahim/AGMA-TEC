import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Navbar } from "@/components/agma/navbar";
import { Footer } from "@/components/agma/footer";
import { Providers } from "@/components/agma/providers";
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
  title: {
    default: "AGMA TEC — Enterprise Technology Solutions & Business Software",
    template: "%s — AGMA TEC",
  },
  description:
    "AGMA TEC delivers integrated enterprise technology solutions and its own software products — AGMA ERP, AGMA CAFM and AGMA CATERING — helping organizations streamline operations, improve efficiency and accelerate digital transformation.",
  keywords: [
    "AGMA TEC",
    "Enterprise Technology Solutions",
    "AGMA ERP",
    "AGMA CAFM",
    "AGMA CATERING",
    "Enterprise Resource Planning",
    "Facility Management Software",
    "Catering Management System",
    "Digital Transformation",
  ],
  authors: [{ name: "AGMA TEC" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AGMA TEC — Enterprise Technology Solutions",
    description:
      "Integrated enterprise solutions — AGMA ERP, AGMA CAFM and AGMA CATERING — developed, implemented and supported by AGMA TEC.",
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
        <Providers>
          <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
