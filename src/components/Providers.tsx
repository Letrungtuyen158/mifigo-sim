"use client";

import { BrandProvider } from "@/contexts/BrandContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { ResolvedBrand } from "@/lib/brand";

export default function Providers({
  brand,
  children,
}: {
  brand: ResolvedBrand;
  children: React.ReactNode;
}) {
  return (
    <BrandProvider brand={brand}>
      <LanguageProvider>{children}</LanguageProvider>
    </BrandProvider>
  );
}
