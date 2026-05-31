import {
  mapAdminPackageListItem,
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
import type {
  ChannelPricing,
  PackagePricingRow,
  Supplier,
  SupplierPackage,
} from "@/lib/types";

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

/** GET /admin/packages — list đã gồm salePrice, costPrice, profit */
export async function fetchAdminPackagesWithPricing(
  page = 1,
  limit = ADMIN_LIST_LIMIT,
  extra?: Record<string, string | number | undefined>
): Promise<AdminPaginated<PackagePricingRow>> {
  const data = await fetchAdminPaginated<JsonDoc>(
    "/api/admin/packages",
    page,
    limit,
    extra
  );
  return {
    items: data.items.map(mapAdminPackageListItem),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

/** GET /admin/packages/:id — chi tiết 1 gói + giá */
export async function fetchAdminPackageDetail(
  packageId: string,
  channel = "retail",
  quantity = 1
): Promise<PackagePricingRow> {
  const qs = buildAdminListQuery(1, 1, { channel, quantity });
  const res = await fetch(`/api/admin/packages/${packageId}?${qs}`);
  const data = await readJson<JsonDoc>(res);
  return mapAdminPackageListItem(data);
}

/** GET /admin/packages/:id/supplier-prices — chỉ dùng ở trang chi tiết giá nhập */
export async function fetchSupplierPriceRowsForPackage(
  packageId: string,
  page = 1,
  limit = ADMIN_LIST_LIMIT
): Promise<AdminPaginated<SupplierPackage>> {
  const [pkgRes, pricesRes] = await Promise.all([
    fetch(`/api/admin/packages/${packageId}`),
    fetch(
      `/api/admin/packages/${packageId}/supplier-prices?${buildAdminListQuery(page, limit)}`
    ),
  ]);

  const pkgData = await readJson<JsonDoc>(pkgRes);
  const pkgDoc = (pkgData.package || pkgData) as JsonDoc;
  const pricePayload = await readJson<JsonDoc[] | { items: JsonDoc[] }>(pricesRes);
  const priceItems = paginatedItems<JsonDoc>(pricePayload);

  const items = priceItems.map((price) => ({
    ...mapSupplierPriceRow(price, pkgDoc),
    id: String(price._id || price.id),
    packageMongoId: packageId,
  }));

  if (Array.isArray(pricePayload)) {
    return {
      items,
      total: items.length,
      page,
      limit,
      totalPages: 1,
    };
  }

  const p = pricePayload as Record<string, unknown>;
  return {
    items,
    total: Number(p.total ?? items.length),
    page: Number(p.page ?? page),
    limit: Number(p.limit ?? limit),
    totalPages: Number(p.totalPages ?? 1),
  };
}

/** GET /admin/sale-price-rules?packageId= — trang chi tiết giá bán */
export async function fetchChannelPricingForPackage(
  packageId: string
): Promise<ChannelPricingRow> {
  const qs = buildAdminListQuery(1, ADMIN_LIST_LIMIT, { packageId });
  const [rulesRes, pkgRes] = await Promise.all([
    fetch(`/api/admin/sale-price-rules?${qs}`),
    fetchAdminPackageDetail(packageId, "retail", 1),
  ]);
  const rules = paginatedItems<JsonDoc>(await readJson(rulesRes));
  const pricing = mapSaleRulesToPricing(packageId, rules);
  return {
    ...pricing,
    packageName: pkgRes.name,
    costPrice: pkgRes.costPrice ?? 0,
  };
}

/** GET /admin/suppliers */
export async function fetchAdminSuppliers(limit = ADMIN_LIST_LIMIT): Promise<Supplier[]> {
  const rows = await fetchAdminListItems<JsonDoc>("/api/admin/suppliers", limit);
  return rows.map(mapSupplierFromApi);
}

/** Dropdown gói */
export async function fetchPackageSelectOptions(limit = ADMIN_LIST_LIMIT) {
  const page = await fetchAdminPaginated<JsonDoc>("/api/admin/packages", 1, limit);
  return page.items.map((item) => {
    const row = mapAdminPackageListItem(item);
    return { id: row.packageId, label: row.name };
  });
}

export async function fetchBestSupplierComparison(
  packageId: string,
  quantity = 1,
  channel = "anonymous"
) {
  const qs = buildAdminListQuery(1, 1, { quantity, channel });
  const res = await fetch(`/api/admin/packages/${packageId}/best-supplier?${qs}`);
  return readJson<Record<string, unknown>>(res);
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
