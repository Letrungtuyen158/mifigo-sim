export const BRAND = {
  name: "Mifigo SIM",
  tagline: "Sim & eSIM du lịch — tìm gói, đặt hàng, xuất bill nhanh",
  primary: "#1d6be8",
  accent: "#f97316",
};

export const COUNTRIES = [
  { code: "JP", name: "Nhật Bản", flag: "🇯🇵", region: "Châu Á" },
  { code: "KR", name: "Hàn Quốc", flag: "🇰🇷", region: "Châu Á" },
  { code: "TH", name: "Thái Lan", flag: "🇹🇭", region: "Châu Á" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "Châu Á" },
  { code: "CN", name: "Trung Quốc", flag: "🇨🇳", region: "Châu Á" },
  { code: "TW", name: "Đài Loan", flag: "🇹🇼", region: "Châu Á" },
  { code: "VN", name: "Việt Nam", flag: "🇻🇳", region: "Châu Á" },
  { code: "EU", name: "Châu Âu", flag: "🇪🇺", region: "Châu Âu" },
  { code: "US", name: "Mỹ", flag: "🇺🇸", region: "Châu Mỹ" },
  { code: "AU", name: "Úc", flag: "🇦🇺", region: "Châu Đại Dương" },
] as const;

export const PACKAGE_TYPES = [
  { value: "daily", label: "Data theo ngày" },
  { value: "total", label: "Tổng dung lượng" },
  { value: "unlimited", label: "Không giới hạn" },
] as const;

export const DATA_GB_OPTIONS = [1, 3, 5, 10, 20, 30, 50] as const;

export const DAY_OPTIONS = [3, 5, 7, 10, 14, 20, 30] as const;

export const PACKAGE_PAGE_SIZE = 12;

export const REGIONS = [
  "Châu Phi",
  "Châu Á",
  "Châu Âu",
  "Châu Mỹ",
  "Châu Đại Dương",
  "Toàn cầu",
] as const;

export const DESTINATION_PILLS = [
  { id: "all", label: "Tất cả" },
  ...REGIONS.map((region) => ({ id: `region-${region}`, label: region, region })),
  ...COUNTRIES.map((c) => ({
    id: c.code,
    label: c.name,
    country: c.name,
    flag: c.flag,
  })),
] as const;

export const SORT_OPTIONS = [
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
  { value: "days_asc", label: "Số ngày ít → nhiều" },
  { value: "days_desc", label: "Số ngày nhiều → ít" },
  { value: "data_asc", label: "Dung lượng ít → nhiều" },
  { value: "data_desc", label: "Dung lượng nhiều → ít" },
] as const;

export const SESSION_COOKIE = "mifigo_sim_session";
export const TOKEN_COOKIE = "mifigo_sim_token";
