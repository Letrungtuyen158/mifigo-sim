export type Locale = "vi" | "en" | "zh";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_STORAGE_KEY = "mifigo_sim_locale";

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}
