import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
// Heavy display sans for headlines — matches the "Capturing your wedding's..." style
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
});

// Body/nav sans-sans (swap for whatever you're already using)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Capture Life",
  description: "Capturing the love, joy, and magic of your wedding day",
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