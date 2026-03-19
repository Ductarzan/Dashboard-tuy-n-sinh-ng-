import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700", "900"],
  variable: "--font-serif"
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Dashboard Tuyển Sinh",
  description: "Dashboard online tổng hợp dữ liệu tuyển sinh từ Google Sheets"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${merriweather.variable} ${sourceSans3.variable}`}>
      <body>{children}</body>
    </html>
  );
}
