import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sentinel — AI Governance Platform",
  description:
    "Trustworthy, Explainable, and Compliant AI Governance for Enterprise. Detect, mitigate, and audit bias in ML models in real-time.",
  keywords: [
    "AI Governance",
    "Bias Detection",
    "Fairness",
    "Machine Learning",
    "Audit",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
