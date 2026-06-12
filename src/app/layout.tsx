import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sirrond — Form Scanner",
  description: "Scan work experience forms into structured data",
  appleWebApp: { capable: true, title: "Sirrond" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <Nav />
        <main className="mx-auto max-w-lg px-4 py-6 pb-24">{children}</main>
      </body>
    </html>
  );
}
