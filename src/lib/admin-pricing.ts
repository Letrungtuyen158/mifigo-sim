import {
  mapSaleRulesToPricing,
  mapSupplierFromApi,
  mapSupplierPriceRow,
  pricingToAgentTiers,
} from "@/lib/api/mappers";
import {
  ADMIN_LIST_LIMIT,
  fetchAdminListItems,
  fetchAdminPaginated,
  paginatedItems,
} from "@/lib/admin-list";
import type { ChannelPricing, Supplier, SupplierPackage } from "@/lib/types";

type JsonDoc = Record<string, unknown>;

const LOOKUP_LIMIT = 100;

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

async function fetchPackageSupplierPrices(packageId: string): Promise<JsonDoc[]> {
  const res = await fetch(
    `/api/admin/packages/${packageId}/supplier-prices?limit=${LOOKUP_LIMIT}`
  );
  const data = await readJson<JsonDoc[] | { items: JsonDoc[] }>(res);
  return paginatedItems<JsonDoc>(data);
}

/** GET /api/admin/suppliers */
export async function fetchAdminSuppliers(limit = LOOKUP_LIMIT): Promise<Supplier[]> {
  const rows = await fetchAdminListItems<JsonDoc>("/api/admin/suppliers", limit);
  return rows.map(mapSupplierFromApi);
}

/** GET /api/admin/packages + /api/admin/packages/:id/supplier-prices */
export async function fetchSupplierPriceRows(
  maxPackages = LOOKUP_LIMIT
): Promise<SupplierPackage[]> {
  const packagesPage = await fetchAdminPaginated<JsonDoc>(
    "/api/admin/packages",
    1,
    maxPackages
  );

  const nested = await Promise.all(
    packagesPage.items.map(async (pkg) => {
      const mongoId = packageIdOf(pkg);
      if (!mongoId) return [];
      const prices = await fetchPackageSupplierPrices(mongoId);
      return prices.map((price) => ({
        ...mapSupplierPriceRow(price, pkg),
        id: String(price._id || price.id),
        packageMongoId: mongoId,
      }));
    })
  );

  return nested.flat();
}

/** GET /api/admin/sale-price-rules */
export async function fetchChannelPricing(
  maxRules = LOOKUP_LIMIT
): Promise<ChannelPricing[]> {
  const res = await fetch(
    `/api/admin/sale-price-rules?page=1&limit=${Math.min(LOOKUP_LIMIT, maxRules)}`
  );
  const data = await readJson<JsonDoc[] | { items: JsonDoc[] }>(res);
  const rules = paginatedItems<JsonDoc>(data);

  const rulesByPackage = new Map<string, JsonDoc[]>();
  for (const rule of rules) {
    const pid = String((rule.packageId as JsonDoc)?._id || rule.packageId || "");
    if (!pid) continue;
    const list = rulesByPackage.get(pid) || [];
    list.push(rule);
    rulesByPackage.set(pid, list);
  }

  return [...rulesByPackage.entries()].map(([packageId, list]) =>
    mapSaleRulesToPricing(packageId, list)
  );
}

/** Dropdown gói — GET /api/admin/packages */
export async function fetchPackageSelectOptions(limit = LOOKUP_LIMIT) {
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

export { ADMIN_LIST_LIMIT, LOOKUP_LIMIT as ADMIN_PRICING_LOOKUP_LIMIT };
