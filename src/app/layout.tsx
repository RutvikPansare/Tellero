import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tellero — The WhatsApp Revenue Engine for Indian D2C Brands",
  description:
    "Cut COD returns by 40%, recover abandoned carts automatically, and grow repeat revenue — all on WhatsApp. Built for Indian D2C brands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
