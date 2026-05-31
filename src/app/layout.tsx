import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import SeoScripts from "@/components/SeoScripts";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { getPublicBrand } from "@/lib/brand";
import { buildSiteMetadata, getPublicSeoSettings } from "@/lib/seo-settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [seo, brand] = await Promise.all([getPublicSeoSettings(), getPublicBrand()]);
  return buildSiteMetadata(seo, brand);
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [brand, seo] = await Promise.all([getPublicBrand(), getPublicSeoSettings()]);

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <Providers brand={brand}>
          <SeoScripts googleAnalyticsId={seo.googleAnalyticsId} />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
