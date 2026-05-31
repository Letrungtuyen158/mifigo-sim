"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { ADMIN_LIST_LIMIT, fetchAdminPackagesWithPricing } from "@/lib/admin-pricing";
import { adminPageHeaderClass, adminTableWrapClass, inputClass } from "@/lib/admin-utils";
import { formatDataGb, formatSimType, formatVnd } from "@/lib/format";
import type { PackagePricingRow } from "@/lib/types";

export default function AdminChannelPricingListPage() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PackagePricingRow[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    packageId: "",
    channel: "retail",
    salePrice: 0,
  });

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await fetchAdminPackagesWithPricing(p, ADMIN_LIST_LIMIT, {
        channel: "retail",
        quantity: 1,
      });
      setRows(data.items);
      setMeta({
        total: data.total,
        totalPages: data.totalPages,
        limit: data.limit,
        page: data.page,
      });
      setPage(data.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải giá bán");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  async function createSaleRule(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/sale-price-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: newRule.packageId,
        channel: newRule.channel,
        tiers: [{ minQuantity: 1, maxQuantity: null, salePrice: newRule.salePrice }],
      }),
    });
    if (!res.ok) return toast.error("Tạo rule thất bại");
    toast.success("Đã tạo sale-price-rule");
    void load(page);
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <h1 className="text-2xl font-black">Giá bán kênh</h1>
          <p className="text-sm text-slate-600">
            List từ <code className="text-xs">GET /admin/packages?channel=retail</code>.
            Chỉnh bậc giá đại lý ở trang chi tiết.
          </p>
        </div>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : (
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Gói</th>
                <th className="px-3 py-2">Giá nhập</th>
                <th className="px-3 py-2">Giá bán (lẻ)</th>
                <th className="px-3 py-2">Lợi nhuận</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.packageId} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-500">
                      {row.country} · {formatSimType(row.simType)} ·{" "}
                      {formatDataGb(row.dataGb)} · {row.days} ngày
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {row.costPrice != null ? formatVnd(row.costPrice) : "—"}
                  </td>
                  <td className="px-3 py-2 font-semibold text-[#1d6be8]">
                    {row.salePrice != null ? formatVnd(row.salePrice) : "—"}
                  </td>
                  <td
                    className={`px-3 py-2 font-semibold ${
                      (row.profit ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {row.profit != null ? formatVnd(row.profit) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/gia-ban/${row.packageId}`}
                      className="text-sm font-semibold text-[#1d6be8] hover:underline"
                    >
                      Chỉnh giá →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <AdminPagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>

      <form onSubmit={(e) => void createSaleRule(e)} className="card max-w-lg space-y-3 p-4">
        <h2 className="font-bold">Tạo sale-price-rule mới</h2>
        <input
          className={inputClass}
          placeholder="packageId (Mongo)"
          value={newRule.packageId}
          onChange={(e) => setNewRule({ ...newRule, packageId: e.target.value })}
        />
        <select
          className={inputClass}
          value={newRule.channel}
          onChange={(e) => setNewRule({ ...newRule, channel: e.target.value })}
        >
          {["anonymous", "retail", "agent", "collaborator", "vip"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          type="number"
          placeholder="Giá bán"
          value={newRule.salePrice}
          onChange={(e) => setNewRule({ ...newRule, salePrice: Number(e.target.value) })}
        />
        <button type="submit" className="btn-primary">
          Tạo rule
        </button>
      </form>
    </div>
  );
}
