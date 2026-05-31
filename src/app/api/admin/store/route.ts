import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import {
  buildBankSettings,
  mapOrderFromApi,
  mapSaleRulesToPricing,
  mapSupplierFromApi,
  mapSupplierPriceRow,
  mapVnEsimFromApi,
  pricingToAgentTiers,
} from "@/lib/api/mappers";
import { getSessionUser } from "@/lib/auth";

type MongoDoc = Record<string, unknown>;

async function requireAdminToken() {
  const user = await getSessionUser();
  const token = await getAccessToken();
  if (!user || user.role !== "admin" || !token) return null;
  return token;
}

export async function GET() {
  try {
    const token = await requireAdminToken();
    if (!token) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    type Paginated<T> = { items: T[]; total: number };

    const [suppliersPage, packagesPage, saleRulesPage, ordersPage, inventoryPage] =
      await Promise.all([
        apiRequest<Paginated<MongoDoc>>("/admin/suppliers?limit=10", { token }),
        apiRequest<Paginated<MongoDoc>>("/admin/packages?limit=10", { token }),
        apiRequest<Paginated<MongoDoc>>("/admin/sale-price-rules?limit=10", {
          token,
        }),
        apiRequest<Paginated<MongoDoc>>("/admin/orders?limit=10", { token }),
        apiRequest<Paginated<MongoDoc>>("/admin/sim-inventory?limit=10", {
          token,
        }),
      ]);

    const suppliers = (suppliersPage.items || []).map(mapSupplierFromApi);
    const saleRules = saleRulesPage.items || [];

    const supplierPricesNested = await Promise.all(
      (packagesPage.items || []).map(async (pkg) => {
        const pricesPage = await apiRequest<Paginated<MongoDoc>>(
          `/admin/packages/${String(pkg._id)}/supplier-prices?limit=100`,
          { token }
        );
        return (pricesPage.items || []).map((price) => ({
          ...mapSupplierPriceRow(price, pkg),
          id: String(price._id),
          packageMongoId: String(pkg._id),
        }));
      })
    );
    const packages = supplierPricesNested.flat();

    const rulesByPackage = new Map<string, MongoDoc[]>();
    for (const rule of saleRules) {
      const packageId = String(
        (rule.packageId as MongoDoc)?._id || rule.packageId || ""
      );
      if (!packageId) continue;
      const list = rulesByPackage.get(packageId) || [];
      list.push(rule);
      rulesByPackage.set(packageId, list);
    }

    const uniquePackageIds = [
      ...new Set((packagesPage.items || []).map((p) => String(p._id))),
    ];
    const pricing = uniquePackageIds.map((packageId) =>
      mapSaleRulesToPricing(packageId, rulesByPackage.get(packageId) || [])
    );

    const orders = await Promise.all(
      (ordersPage.items || []).slice(0, 50).map(async (order) => {
        try {
          const detail = await apiRequest<{
            order: MongoDoc;
            items: MongoDoc[];
            payment?: MongoDoc | null;
          }>(`/admin/orders/${String(order._id)}`, { token });
          return mapOrderFromApi(detail.order, detail.items, detail.payment);
        } catch {
          return mapOrderFromApi(order);
        }
      })
    );

    const vnEsims = (inventoryPage.items || []).map(mapVnEsimFromApi);

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        packages,
        pricing,
        orders,
        vnEsims,
        settings: buildBankSettings(),
      },
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể tải dữ liệu admin");
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const token = await requireAdminToken();
    if (!token) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      suppliers?: Array<{ id: string; name: string; code: string; active: boolean; note?: string }>;
      packages?: Array<{ id: string; costPrice: number }>;
      pricing?: Array<{
        id: string;
        packageId: string;
        retailPrice: number;
        agentTier1Qty: number;
        agentTier1Price: number;
        agentTier2Qty: number;
        agentTier2Price: number;
        agentTier3Qty: number;
        agentTier3Price: number;
      }>;
    };

    if (body.suppliers) {
      await Promise.all(
        body.suppliers.map((s) =>
          apiRequest(`/admin/suppliers/${s.id}`, {
            method: "PUT",
            token,
            body: JSON.stringify({
              name: s.name,
              isActive: s.active,
              note: s.note,
            }),
          })
        )
      );
    }

    if (body.packages) {
      await Promise.all(
        body.packages.map((p) =>
          apiRequest(`/admin/supplier-package-prices/${p.id}`, {
            method: "PUT",
            token,
            body: JSON.stringify({ costPrice: p.costPrice }),
          })
        )
      );
    }

    if (body.pricing) {
      await Promise.all(
        body.pricing.map((p) =>
          apiRequest(`/admin/sale-price-rules/${p.id}`, {
            method: "PUT",
            token,
            body: JSON.stringify({
              tiers: [
                { minQuantity: 1, maxQuantity: null, salePrice: p.retailPrice },
                ...pricingToAgentTiers(p),
              ],
            }),
          })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, message } = toNextError(error, "Lưu thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
