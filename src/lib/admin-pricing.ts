import {
  mapSaleRulesToPricing,
  mapSupplierFromApi,
  mapSupplierPriceRow,
  pricingToAgentTiers,
} from "@/lib/api/mappers";
import {
  ADMIN_LIST_LIMIT,
  buildAdminListQuery,
  fetchAdminListItems,
  fetchAdminPaginated,
  paginatedItems,
  type AdminPaginated,
} from "@/lib/admin-list";
import type { ChannelPricing, Supplier, SupplierPackage } from "@/lib/types";

type JsonDoc = Record<string, unknown>;

export type ChannelPricingRow = ChannelPricing & {
  packageName: string;
  costPrice: number;
};

async function readJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as { success?: boolean; data?: unknown; message?: string };
  if (!res.ok) {
    throw new Error(typeof json.message === "string" ? json.message : "Lỗi tải dữ liệu");
  }
  return json.data as T;
}

function packageIdOf(doc: JsonDoc) {
  return String(doc._id || doc.id || "");
}

async function fetchPackageSupplierPrices(
  packageId: string,
  page = 1,
  limit = ADMIN_LIST_LIMIT
): Promise<JsonDoc[]> {
  const qs = buildAdminListQuery(page, limit);
  const res = await fetch(`/api/admin/packages/${packageId}/supplier-prices?${qs}`);
  const data = await readJson<JsonDoc[] | { items: JsonDoc[] }>(res);
  return paginatedItems<JsonDoc>(data);
}

async function fetchSalePriceRulesForPackage(
  packageId: string,
  limit = ADMIN_LIST_LIMIT
): Promise<JsonDoc[]> {
  const qs = buildAdminListQuery(1, limit, { packageId });
  const res = await fetch(`/api/admin/sale-price-rules?${qs}`);
  const data = await readJson<JsonDoc[] | { items: JsonDoc[] }>(res);
  return paginatedItems<JsonDoc>(data);
}

/** GET /api/admin/suppliers */
export async function fetchAdminSuppliers(limit = ADMIN_LIST_LIMIT): Promise<Supplier[]> {
  const rows = await fetchAdminListItems<JsonDoc>("/api/admin/suppliers", limit);
  return rows.map(mapSupplierFromApi);
}

/**
 * Một trang gói + giá nhập NCC tương ứng.
 * Tránh gọi supplier-prices cho toàn bộ catalog (N+1 × limit=100).
 */
export async function fetchSupplierPriceRows(
  page = 1,
  limit = ADMIN_LIST_LIMIT
): Promise<AdminPaginated<SupplierPackage>> {
  const packagesPage = await fetchAdminPaginated<JsonDoc>(
    "/api/admin/packages",
    page,
    limit
  );

  const nested = await Promise.all(
    packagesPage.items.map(async (pkg) => {
      const mongoId = packageIdOf(pkg);
      if (!mongoId) return [];
      const prices = await fetchPackageSupplierPrices(mongoId, 1, limit);
      return prices.map((price) => ({
        ...mapSupplierPriceRow(price, pkg),
        id: String(price._id || price.id),
        packageMongoId: mongoId,
      }));
    })
  );

  return {
    items: nested.flat(),
    total: packagesPage.total,
    page: packagesPage.page,
    limit: packagesPage.limit,
    totalPages: packagesPage.totalPages,
  };
}

/** Giá bán kênh theo trang gói — 1 trang packages + rules/cost cho từng gói trên trang. */
export async function fetchChannelPricingPage(
  page = 1,
  limit = ADMIN_LIST_LIMIT
): Promise<AdminPaginated<ChannelPricingRow>> {
  const packagesPage = await fetchAdminPaginated<JsonDoc>(
    "/api/admin/packages",
    page,
    limit
  );

  const items = await Promise.all(
    packagesPage.items.map(async (pkg) => {
      const mongoId = packageIdOf(pkg);
      const [rules, prices] = await Promise.all([
        fetchSalePriceRulesForPackage(mongoId, limit),
        fetchPackageSupplierPrices(mongoId, 1, 1),
      ]);
      const pricing = mapSaleRulesToPricing(mongoId, rules);
      const costPrice = prices.length ? Number(prices[0].costPrice || 0) : 0;
      return {
        ...pricing,
        packageName: String(pkg.name || pkg.slug || mongoId),
        costPrice,
      };
    })
  );

  return {
    items,
    total: packagesPage.total,
    page: packagesPage.page,
    limit: packagesPage.limit,
    totalPages: packagesPage.totalPages,
  };
}

/** @deprecated Dùng fetchChannelPricingPage với phân trang */
export async function fetchChannelPricing(
  page = 1,
  limit = ADMIN_LIST_LIMIT
): Promise<ChannelPricing[]> {
  const data = await fetchChannelPricingPage(page, limit);
  return data.items;
}

/** Dropdown gói — GET /api/admin/packages */
export async function fetchPackageSelectOptions(limit = ADMIN_LIST_LIMIT) {
  const page = await fetchAdminPaginated<JsonDoc>("/api/admin/packages", 1, limit);
  return page.items.map((pkg) => ({
    id: packageIdOf(pkg),
    label: String(pkg.name || pkg.slug || pkg._id),
  }));
}

/** PUT /api/admin/supplier-package-prices/:id */
export async function saveSupplierPriceRows(
  rows: Array<Pick<SupplierPackage, "id" | "costPrice">>
) {
  const results = await Promise.all(
    rows.map((row) =>
      fetch(`/api/admin/supplier-package-prices/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ costPrice: row.costPrice }),
      })
    )
  );
  if (results.some((r) => !r.ok)) {
    throw new Error("Lưu thất bại");
  }
}

/** PUT /api/admin/sale-price-rules/:id */
export async function saveChannelPricing(pricing: ChannelPricing[]) {
  const results = await Promise.all(
    pricing.map((p) =>
      fetch(`/api/admin/sale-price-rules/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiers: [
            { minQuantity: 1, maxQuantity: null, salePrice: p.retailPrice },
            ...pricingToAgentTiers(p),
          ],
        }),
      })
    )
  );
  if (results.some((r) => !r.ok)) {
    throw new Error("Lưu thất bại");
  }
}

export { ADMIN_LIST_LIMIT };
