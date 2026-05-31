export type PopularRegionTab = "asia" | "europe" | "americas" | "global";

export interface PopularCountryItem {
  nameKey: string;
  flag: string;
  priceFrom?: number;
  priceLabelKey?: "contact";
  countryCode?: string;
  regionKey?: string;
}

export const POPULAR_REGION_TABS: { id: PopularRegionTab; label: string }[] = [
  { id: "asia", label: "Châu Á" },
  { id: "europe", label: "Châu Âu" },
  { id: "americas", label: "Châu Mỹ" },
  { id: "global", label: "Toàn cầu" },
];

export const POPULAR_COUNTRIES: Record<PopularRegionTab, PopularCountryItem[]> = {
  asia: [
    { nameKey: "KR", flag: "🇰🇷", priceFrom: 350000, countryCode: "KR" },
    { nameKey: "JP", flag: "🇯🇵", priceFrom: 490000, countryCode: "JP" },
    { nameKey: "TH", flag: "🇹🇭", priceFrom: 290000, countryCode: "TH" },
    { nameKey: "CN", flag: "🇨🇳", priceFrom: 390000, countryCode: "CN" },
    { nameKey: "SG", flag: "🇸🇬", priceFrom: 390000, countryCode: "SG" },
    { nameKey: "HK", flag: "🇭🇰", priceFrom: 390000 },
    { nameKey: "MO", flag: "🇲🇴", priceFrom: 390000 },
    { nameKey: "TW", flag: "🇹🇼", priceFrom: 390000, countryCode: "TW" },
    { nameKey: "VN", flag: "🇻🇳", priceFrom: 390000, countryCode: "VN" },
    { nameKey: "MY", flag: "🇲🇾", priceFrom: 390000 },
    { nameKey: "ID", flag: "🇮🇩", priceFrom: 390000 },
    { nameKey: "PH", flag: "🇵🇭", priceFrom: 490000 },
    { nameKey: "IN", flag: "🇮🇳", priceFrom: 690000 },
    { nameKey: "AU", flag: "🇦🇺", priceFrom: 1190000, countryCode: "AU" },
    { nameKey: "NZ", flag: "🇳🇿", priceFrom: 990000 },
  ],
  europe: [
    { nameKey: "GB", flag: "🇬🇧", priceFrom: 990000 },
    { nameKey: "FR", flag: "🇫🇷", priceFrom: 1290000 },
    { nameKey: "DE", flag: "🇩🇪", priceFrom: 1290000 },
    { nameKey: "IT", flag: "🇮🇹", priceFrom: 1290000 },
    { nameKey: "ES", flag: "🇪🇸", priceFrom: 1290000 },
    { nameKey: "NL", flag: "🇳🇱", priceFrom: 1290000 },
    { nameKey: "SE", flag: "🇸🇪", priceFrom: 1290000 },
    { nameKey: "CH", flag: "🇨🇭", priceFrom: 1490000 },
    { nameKey: "PT", flag: "🇵🇹", priceFrom: 1290000 },
    { nameKey: "AT", flag: "🇦🇹", priceFrom: 1290000 },
  ],
  americas: [
    { nameKey: "US", flag: "🇺🇸", priceFrom: 890000, countryCode: "US" },
    { nameKey: "CA", flag: "🇨🇦", priceFrom: 790000 },
    { nameKey: "MX", flag: "🇲🇽", priceFrom: 990000 },
    { nameKey: "BR", flag: "🇧🇷", priceFrom: 1190000 },
    { nameKey: "AR", flag: "🇦🇷", priceFrom: 1190000 },
    { nameKey: "CL", flag: "🇨🇱", priceFrom: 1190000 },
    { nameKey: "CO", flag: "🇨🇴", priceFrom: 1190000 },
    { nameKey: "PE", flag: "🇵🇪", priceFrom: 1190000 },
  ],
  global: [
    { nameKey: "asiaRegion", flag: "🌏", priceFrom: 2390000, regionKey: "asia" },
    { nameKey: "europeRegion", flag: "🇪🇺", priceFrom: 1290000, regionKey: "europe" },
    { nameKey: "globalRegion", flag: "🌍", priceLabelKey: "contact", regionKey: "global" },
    { nameKey: "northAmerica", flag: "🇺🇸", priceFrom: 890000, countryCode: "US" },
    { nameKey: "southAmerica", flag: "🌎", priceFrom: 990000 },
    { nameKey: "middleEast", flag: "🌍", priceFrom: 790000 },
  ],
};
