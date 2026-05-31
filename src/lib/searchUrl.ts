import type { PackageSort } from "./types";

export function buildTraCuuUrl(
  current: URLSearchParams,
  updates: Record<string, string | undefined>
) {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (!value) params.delete(key);
    else params.set(key, value);
  }

  if ("country" in updates || "region" in updates) {
    params.delete("page");
  }

  const qs = params.toString();
  return qs ? `/tra-cuu?${qs}` : "/tra-cuu";
}

export function sortPackages<T extends { unitPrice: number; package: { days: number; dataGb: number | null } }>(
  items: T[],
  sort: PackageSort
): T[] {
  const sorted = [...items];

  switch (sort) {
    case "price_desc":
      sorted.sort((a, b) => b.unitPrice - a.unitPrice);
      break;
    case "days_asc":
      sorted.sort((a, b) => a.package.days - b.package.days);
      break;
    case "days_desc":
      sorted.sort((a, b) => b.package.days - a.package.days);
      break;
    case "data_asc":
      sorted.sort(
        (a, b) => (a.package.dataGb ?? 999) - (b.package.dataGb ?? 999)
      );
      break;
    case "data_desc":
      sorted.sort(
        (a, b) => (b.package.dataGb ?? 0) - (a.package.dataGb ?? 0)
      );
      break;
    default:
      sorted.sort((a, b) => a.unitPrice - b.unitPrice);
  }

  return sorted;
}
