import Link from "next/link";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest } from "@/lib/api/client";
import { mapOrderFromApi } from "@/lib/api/mappers";
import { formatVnd } from "@/lib/format";

interface Paginated<T> {
  items: T[];
  total: number;
}

export default async function AdminDashboardPage() {
  const token = await getAccessToken();

  const empty = {
    packageCount: 0,
    supplierCount: 0,
    pendingOrders: 0,
    esimCount: 0,
    inventoryCount: 0,
    recentOrders: [] as ReturnType<typeof mapOrderFromApi>[],
  };

  if (!token) {
    return (
      <div className="card p-6 text-slate-600">
        Vui lòng đăng nhập admin để xem tổng quan.
      </div>
    );
  }

  let stats = empty;

  try {
    const [suppliersPage, packages, ordersPending, ordersReview, inventory, esimInventory, recent] =
      await Promise.all([
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/suppliers?limit=1",
          { token }
        ),
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/packages?limit=1",
          { token }
        ),
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/orders?status=pending_payment&limit=1",
          { token }
        ),
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/orders?paymentStatus=pending_review&limit=1",
          { token }
        ),
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/sim-inventory?limit=1",
          { token }
        ),
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/sim-inventory?simType=esim&limit=1",
          { token }
        ),
        apiRequest<Paginated<Record<string, unknown>>>(
          "/admin/orders?limit=5",
          { token }
        ),
      ]);

    stats = {
      packageCount: packages.total,
      supplierCount: suppliersPage.total,
      pendingOrders: ordersPending.total + ordersReview.total,
      esimCount: esimInventory.total,
      inventoryCount: inventory.total,
      recentOrders: (recent.items || []).map((o) => mapOrderFromApi(o)),
    };
  } catch {
    stats = empty;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Tổng quan</h1>
        <p className="text-sm text-slate-600">
          Quản lý giá nhập NCC, giá bán kênh, đơn hàng và kho SIM/eSIM.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {[
          ["Gói cước", stats.packageCount, "/admin/goi-he-thong"],
          ["Nhà cung cấp", stats.supplierCount, "/admin/nha-cung-cap"],
          ["Chờ duyệt CK", stats.pendingOrders, "/admin/don-hang?queue=pending_review"],
          ["Kho SIM/eSIM", stats.inventoryCount, "/admin/kho-sim"],
          ["eSIM trong kho", stats.esimCount, "/admin/kho-sim?simType=esim"],
        ].map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="card p-5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-1 text-3xl font-black text-[#1d6be8]">{value}</div>
          </Link>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-bold">Đơn hàng gần đây</h2>
        <div className="mt-4 space-y-2 text-sm">
          {stats.recentOrders.map((o) => (
            <div key={o.id} className="flex flex-col gap-1 border-b py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="admin-break-text min-w-0">
                {o.code} · {o.customerName}
              </span>
              <span className="shrink-0 font-semibold">{formatVnd(o.total)}</span>
            </div>
          ))}
          {stats.recentOrders.length === 0 && (
            <div className="text-slate-500">Chưa có đơn hàng.</div>
          )}
        </div>
      </div>
    </div>
  );
}
