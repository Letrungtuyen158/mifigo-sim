import en from "./locales/en";
import vi from "./locales/vi";
import zh from "./locales/zh";
import type { Locale, TranslationDict } from "./types";

export * from "./types";
export * from "./geo";

const dictionaries: Record<Locale, TranslationDict> = { vi, en, zh };

export function getDictionary(locale: Locale): TranslationDict {
  return dictionaries[locale] ?? dictionaries.vi;
}

function resolve(obj: TranslationDict, path: string): string | undefined {
  const parts = path.split(".");
  let current: string | TranslationDict | undefined = obj;
  for (const part of parts) {
    if (!current || typeof current === "string") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = getDictionary(locale);
  let text = resolve(dict, key) ?? resolve(dictionaries.vi, key) ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function tCountry(locale: Locale, code: string): string {
  return translate(locale, `country.${code}`) || code;
}

export function tRegion(locale: Locale, key: string): string {
  return translate(locale, `region.${key}`) || key;
}

export function tPopularRegion(locale: Locale, key: string): string {
  return translate(locale, `popularRegion.${key}`) || key;
}

export function tOrderStatus(locale: Locale, status: string): string {
  return translate(locale, `orderStatus.${status}`) || status;
}

export function tSimType(locale: Locale, type: string): string {
  if (type === "esim") return translate(locale, "simType.esim");
  return translate(locale, "simType.physical");
}

export function tPackageType(locale: Locale, type: string): string {
  return translate(locale, `packageType.${type}`) || type;
}

export function tDataGb(locale: Locale, gb: number | null): string {
  if (gb == null) return translate(locale, "format.unlimited");
  return `${gb} GB`;
}

export function tSortOption(locale: Locale, value: string): string {
  const map: Record<string, string> = {
    price_asc: "sort.priceAsc",
    price_desc: "sort.priceDesc",
    days_asc: "sort.daysAsc",
    days_desc: "sort.daysDesc",
    data_asc: "sort.dataAsc",
    data_desc: "sort.dataDesc",
  };
  return translate(locale, map[value] || value);
}
