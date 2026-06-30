import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digi Khata",
  description: "Digital ledger for shopkeepers — manage customers, track udhaar, and record transactions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} pb-14 md:pb-0`}>
        {children}
        <BottomNav />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
