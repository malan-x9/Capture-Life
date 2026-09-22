import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";

// Display font for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
});

// Body and navigation font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Capture Life | Find Your Perfect Photographer",
    template: "%s | Capture Life",
  },

  description:
    "Discover talented photographers, explore portfolios, check availability, and book the perfect photographer for your special moments with Capture Life.",

  keywords: [
    "photographers",
    "wedding photographers",
    "photography",
    "wedding photography",
    "photographer booking",
    "Capture Life",
  ],

  authors: [{ name: "Capture Life" }],

  creator: "Capture Life",

  openGraph: {
    title: "Capture Life | Find Your Perfect Photographer",
    description:
      "Discover talented photographers, explore portfolios, check availability, and book the perfect photographer for your special moments.",
    siteName: "Capture Life",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Capture Life | Find Your Perfect Photographer",
    description:
      "Discover photographers, explore portfolios, check availability, and book your perfect photographer.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}