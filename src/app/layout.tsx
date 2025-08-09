import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealerBarn - AI-Powered Platform for World Class Teams",
  description: "The end-to-end platform that world class teams use to build AI applications. Join our early access program.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/znz5jrg.css" />
      </head>
      <body className="antialiased" style={{ fontFamily: '"roc-grotesk", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
