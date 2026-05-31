import { apiRequest } from "@/lib/api/client";
import { BRAND } from "@/lib/constants";

export type PublicBrand = {
  name?: string;
  logoUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  companyAddress?: string;
  websiteUrl?: string;
};

export type ResolvedBrand = {
  name: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  websiteUrl: string;
};

export const DEFAULT_BRAND: ResolvedBrand = {
  name: BRAND.name,
  logoUrl: "/logo.svg",
  supportEmail: "support@mifigo.vn",
  supportPhone: "0964.596.973",
  companyAddress: "",
  websiteUrl: "",
};

export function resolveBrand(raw?: PublicBrand | null): ResolvedBrand {
  return {
    name: raw?.name?.trim() || DEFAULT_BRAND.name,
    logoUrl: raw?.logoUrl?.trim() || DEFAULT_BRAND.logoUrl,
    supportEmail: raw?.supportEmail?.trim() || DEFAULT_BRAND.supportEmail,
    supportPhone: raw?.supportPhone?.trim() || DEFAULT_BRAND.supportPhone,
    companyAddress: raw?.companyAddress?.trim() || DEFAULT_BRAND.companyAddress,
    websiteUrl: raw?.websiteUrl?.trim() || DEFAULT_BRAND.websiteUrl,
  };
}

export async function getPublicBrand(): Promise<ResolvedBrand> {
  try {
    const data = await apiRequest<{ brand?: PublicBrand }>("/public/system-settings");
    return resolveBrand(data.brand);
  } catch {
    return DEFAULT_BRAND;
  }
}

export function isRemoteLogo(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
