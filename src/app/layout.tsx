import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const beVietnam = localFont({
  variable: "--font-body",
  src: [
    {
      path: "../fonts/BeVietnamPro/BeVietnamPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/BeVietnamPro/BeVietnamPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/BeVietnamPro/BeVietnamPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MB Life — Key Moment",
  description: "Employee recognition display for MB Life event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
