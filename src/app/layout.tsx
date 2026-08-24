import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: "SCOMS v4.0 | Enterprise Platform",
  description: "Secure Cleaning Operations Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} bg-cloud text-ink-navy antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
