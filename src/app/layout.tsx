import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Header} from "@/widgets/header";
import {Footer} from "@/widgets/footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreshMarket - Продукты премиум качества",
  description: "Лучшие продукты для вашего стола. Свежие овощи, фрукты, мясо и молочные продукты.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} flex flex-col font-inter min-h-screen bg-[#f5f5f5] antialiased`}>
      <Header />
        {children}
      </body>
      <Footer />
    </html>
  );
}
