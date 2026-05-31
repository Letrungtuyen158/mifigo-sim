/** Region keys → API regionName (Vietnamese, matches seed data) */
export const REGION_API_NAMES: Record<string, string> = {
  africa: "Châu Phi",
  asia: "Châu Á",
  europe: "Châu Âu",
  americas: "Châu Mỹ",
  oceania: "Châu Đại Dương",
  global: "Toàn cầu",
};

export const COUNTRY_CODES = [
  "JP", "KR", "TH", "SG", "CN", "TW", "VN", "EU", "US", "AU",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];
