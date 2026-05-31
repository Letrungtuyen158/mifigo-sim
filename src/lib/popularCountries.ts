export type PopularRegionTab = "asia" | "europe" | "americas" | "global";

export interface PopularCountryItem {
  name: string;
  flag: string;
  priceFrom?: number;
  priceLabel?: string;
  searchCountry?: string;
}

export const POPULAR_REGION_TABS: { id: PopularRegionTab; label: string }[] = [
  { id: "asia", label: "Châu Á" },
  { id: "europe", label: "Châu Âu" },
  { id: "americas", label: "Châu Mỹ" },
  { id: "global", label: "Toàn cầu" },
];

export const POPULAR_COUNTRIES: Record<PopularRegionTab, PopularCountryItem[]> = {
  asia: [
    { name: "Hàn Quốc", flag: "🇰🇷", priceFrom: 350000 },
    { name: "Nhật Bản", flag: "🇯🇵", priceFrom: 490000 },
    { name: "Thái Lan", flag: "🇹🇭", priceFrom: 290000 },
    { name: "Trung Quốc", flag: "🇨🇳", priceFrom: 390000 },
    { name: "Singapore", flag: "🇸🇬", priceFrom: 390000 },
    { name: "Hồng Kông", flag: "🇭🇰", priceFrom: 390000 },
    { name: "Macao", flag: "🇲🇴", priceFrom: 390000 },
    { name: "Đài Loan", flag: "🇹🇼", priceFrom: 390000 },
    { name: "Việt Nam", flag: "🇻🇳", priceFrom: 390000 },
    { name: "Malaysia", flag: "🇲🇾", priceFrom: 390000 },
    { name: "Indonesia", flag: "🇮🇩", priceFrom: 390000 },
    { name: "Philippines", flag: "🇵🇭", priceFrom: 490000 },
    { name: "Ấn Độ", flag: "🇮🇳", priceFrom: 690000 },
    { name: "Úc", flag: "🇦🇺", priceFrom: 1190000 },
    { name: "New Zealand", flag: "🇳🇿", priceFrom: 990000 },
  ],
  europe: [
    { name: "Anh", flag: "🇬🇧", priceFrom: 990000 },
    { name: "Pháp", flag: "🇫🇷", priceFrom: 1290000 },
    { name: "Đức", flag: "🇩🇪", priceFrom: 1290000 },
    { name: "Ý", flag: "🇮🇹", priceFrom: 1290000 },
    { name: "Tây Ban Nha", flag: "🇪🇸", priceFrom: 1290000 },
    { name: "Hà Lan", flag: "🇳🇱", priceFrom: 1290000 },
    { name: "Thụy Điển", flag: "🇸🇪", priceFrom: 1290000 },
    { name: "Thụy Sĩ", flag: "🇨🇭", priceFrom: 1490000 },
    { name: "Bồ Đào Nha", flag: "🇵🇹", priceFrom: 1290000 },
    { name: "Áo", flag: "🇦🇹", priceFrom: 1290000 },
  ],
  americas: [
    { name: "Mỹ", flag: "🇺🇸", priceFrom: 890000, searchCountry: "Mỹ" },
    { name: "Canada", flag: "🇨🇦", priceFrom: 790000 },
    { name: "Mexico", flag: "🇲🇽", priceFrom: 990000 },
    { name: "Brazil", flag: "🇧🇷", priceFrom: 1190000 },
    { name: "Argentina", flag: "🇦🇷", priceFrom: 1190000 },
    { name: "Chile", flag: "🇨🇱", priceFrom: 1190000 },
    { name: "Colombia", flag: "🇨🇴", priceFrom: 1190000 },
    { name: "Peru", flag: "🇵🇪", priceFrom: 1190000 },
  ],
  global: [
    { name: "Châu Á", flag: "🌏", priceFrom: 2390000, searchCountry: "Châu Á" },
    { name: "Châu Âu", flag: "🇪🇺", priceFrom: 1290000, searchCountry: "Châu Âu" },
    { name: "Toàn cầu", flag: "🌍", priceLabel: "Liên hệ", searchCountry: "Toàn cầu" },
    { name: "Bắc Mỹ", flag: "🇺🇸", priceFrom: 890000, searchCountry: "Mỹ" },
    { name: "Nam Mỹ", flag: "🌎", priceFrom: 990000, searchCountry: "Brazil" },
    { name: "Trung Đông", flag: "🌍", priceFrom: 790000, searchCountry: "UAE" },
  ],
};
