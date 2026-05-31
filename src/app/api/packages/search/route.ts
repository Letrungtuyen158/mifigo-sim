import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import {
  countryNameToCode,
  mapPackageTypeToApi,
  mapRoleForDisplay,
  mapSearchResultFromApi,
  mapSimTypeToApi,
  mapSortToApi,
} from "@/lib/api/mappers";
import { decodeJwtPayload } from "@/lib/api/auth-token";
import { PACKAGE_PAGE_SIZE } from "@/lib/constants";
import { REGION_API_NAMES } from "@/lib/i18n/geo";

interface PaginatedApi<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = await getAccessToken();
    const payload = token ? decodeJwtPayload(token) : null;
    const role = mapRoleForDisplay(payload?.role);

    const quantity = Number(searchParams.get("quantity") || "1") || 1;
    const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
    const pageSize = Math.min(
      50,
      Math.max(
        1,
        Number(searchParams.get("pageSize") || String(PACKAGE_PAGE_SIZE)) ||
          PACKAGE_PAGE_SIZE
      )
    );

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    params.set("quantity", String(quantity));
    params.set("sortBy", mapSortToApi(searchParams.get("sort") || "price_asc"));

    const countryCodeParam = searchParams.get("countryCode");
    const country = searchParams.get("country");
    const region = searchParams.get("region");
    const countryCode =
      countryCodeParam || countryNameToCode(country || undefined);
    if (countryCode) params.set("countryCode", countryCode);
    else if (country) params.set("search", country);
    if (region) {
      params.set("regionName", REGION_API_NAMES[region] || region);
    }

    const packageType = searchParams.get("packageType");
    if (packageType) params.set("packageType", mapPackageTypeToApi(packageType));

    const simType = searchParams.get("simType");
    if (simType) params.set("simType", mapSimTypeToApi(simType));

    const dataGbParam = searchParams.get("dataGb");
    if (dataGbParam === "unlimited") {
      params.set("packageType", "unlimited");
    } else if (dataGbParam) {
      params.set("dataAmountGb", dataGbParam);
    }

    const daysParam = searchParams.get("days");
    if (daysParam) params.set("durationDays", daysParam);

    const q = searchParams.get("q");
    if (q) params.set("search", q);

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const data = await apiRequest<PaginatedApi<Record<string, unknown>>>(
      `/public/packages/search?${params.toString()}`,
      { token }
    );

    const results = (data.items || []).map(mapSearchResultFromApi);
    const prices = results.map((r) => r.unitPrice);
    const priceBounds =
      prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 0 };

    return NextResponse.json({
      success: true,
      role,
      data: results,
      total: data.total,
      page: data.page,
      pageSize: data.limit,
      totalPages: data.totalPages,
      priceBounds,
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể tải gói cước");
    return NextResponse.json({ success: false, message }, { status });
  }
}
