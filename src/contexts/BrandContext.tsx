"use client";

import { createContext, useContext } from "react";
import { DEFAULT_BRAND, type ResolvedBrand } from "@/lib/brand";

const BrandContext = createContext<ResolvedBrand>(DEFAULT_BRAND);

export function BrandProvider({
  brand,
  children,
}: {
  brand: ResolvedBrand;
  children: React.ReactNode;
}) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}
