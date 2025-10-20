// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nomad UBI",
  description: "Proof → Score → UBI",
  openGraph: {
    title: "Nomad UBI",
    description: "Share your on-chain Nomad identity.",
    url: "https://你的域名",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pixel.variable} bg-black text-white`}>{children}</body>
    </html>
  );
}
