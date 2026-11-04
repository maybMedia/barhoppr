import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/page-transition";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarHoppr",
  description:
    "Find your favourite drink, discover a great local, and share the good times. Your next round starts with BarHoppr.",
  icons: {
    icon: [{ url: "/brand/barhoppr-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('barhoppr-theme');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${display.variable} antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <PageTransition>
              <a href="#main-content" className="skip-link">
                Skip to content
              </a>
              <Navbar />
              {children}
              <Footer />
            </PageTransition>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
