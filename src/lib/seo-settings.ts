import { apiRequest } from "@/lib/api/client";
import { BRAND } from "@/lib/constants";
import type { ResolvedBrand } from "@/lib/brand";

export type PublicSeoSettings = {
  siteName?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string[];
  defaultOgImage?: string;
  googleAnalyticsId?: string;
};

export type ResolvedSeo = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  googleAnalyticsId: string;
};

const DEFAULT_SEO: ResolvedSeo = {
  siteName: BRAND.name,
  defaultTitle: `${BRAND.name} — Travel SIM/eSIM`,
  defaultDescription:
    "Tìm gói SIM/eSIM du lịch theo quốc gia, đặt hàng nhanh, quản lý giá nhà cung cấp.",
  defaultKeywords: [],
  defaultOgImage: "",
  googleAnalyticsId: "",
};

export function resolveSeo(raw?: PublicSeoSettings | null): ResolvedSeo {
  return {
    siteName: raw?.siteName?.trim() || DEFAULT_SEO.siteName,
    defaultTitle: raw?.defaultTitle?.trim() || DEFAULT_SEO.defaultTitle,
    defaultDescription: raw?.defaultDescription?.trim() || DEFAULT_SEO.defaultDescription,
    defaultKeywords: raw?.defaultKeywords?.length ? raw.defaultKeywords : DEFAULT_SEO.defaultKeywords,
    defaultOgImage: raw?.defaultOgImage?.trim() || DEFAULT_SEO.defaultOgImage,
    googleAnalyticsId: raw?.googleAnalyticsId?.trim() || DEFAULT_SEO.googleAnalyticsId,
  };
}

export async function getPublicSeoSettings(): Promise<ResolvedSeo> {
  try {
    const data = await apiRequest<PublicSeoSettings>("/public/seo/settings");
    return resolveSeo(data);
  } catch {
    return DEFAULT_SEO;
  }
}

export function buildSiteMetadata(seo: ResolvedSeo, brand: ResolvedBrand) {
  const title = seo.defaultTitle || `${brand.name} — Travel SIM/eSIM`;
  const description = seo.defaultDescription;
  const siteName = seo.siteName || brand.name;
  const ogImage = seo.defaultOgImage || (isRemoteLogo(brand.logoUrl) ? brand.logoUrl : undefined);

  return {
    title,
    description,
    keywords: seo.defaultKeywords.length ? seo.defaultKeywords : undefined,
    openGraph: {
      title,
      description,
      siteName,
      type: "website" as const,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    icons: isRemoteLogo(brand.logoUrl)
      ? { icon: brand.logoUrl, apple: brand.logoUrl }
      : { icon: "/logo.svg", apple: "/logo.svg" },
  };
}

function isRemoteLogo(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
