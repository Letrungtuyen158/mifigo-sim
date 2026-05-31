"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_LIST_LIMIT,
  fetchChannelPricingPage,
  saveChannelPricing,
  type ChannelPricingRow,
} from "@/lib/admin-pricing";
import { adminPageHeaderClass, adminTableWrapClass, inputClass } from "@/lib/admin-utils";
import { formatVnd } from "@/lib/format";
import type { ChannelPricing } from "@/lib/types";

export default function AdminPricingPage() {
  const [page, setPage] = useState(1);
  const [pricing, setPricing] = useState<ChannelPricingRow[]>([]);
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
  const [newCost, setNewCost] = useState({
    packageId: "",
    supplierId: "",
    costPrice: 0,
  });

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await fetchChannelPricingPage(p);
      setPricing(data.items);
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

  function updatePricing(id: string, field: keyof ChannelPricing, value: number) {
    setPricing((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  async function save() {
    try {
      await saveChannelPricing(pricing);
      toast.success("Đã lưu giá bán kênh");
      void load(page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    }
  }

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

  async function createSupplierPrice(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/supplier-package-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCost),
    });
    if (!res.ok) return toast.error("Tạo giá NCC thất bại");
    toast.success("Đã tạo supplier-package-price");
    void load(page);
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <h1 className="text-2xl font-black">Giá bán kênh</h1>
          <p className="text-sm text-slate-600">
            Giá lẻ + 3 bậc giá đại lý (API sale-price-rules).
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={loading}
          onClick={() => void save()}
        >
          Lưu thay đổi
        </button>
      </div>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : (
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Gói</th>
                <th className="px-3 py-2">Giá lẻ</th>
                <th className="px-3 py-2">≥SL1 / Giá1</th>
                <th className="px-3 py-2">≥SL2 / Giá2</th>
                <th className="px-3 py-2">≥SL3 / Giá3</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.packageName || p.packageId}</div>
                    <div className="text-xs text-slate-500">
                      Nhập: {formatVnd(p.costPrice || 0)}
                    </div>
                  </td>
                  {(
                    [
                      ["retailPrice", null],
                      ["agentTier1Qty", "agentTier1Price"],
                      ["agentTier2Qty", "agentTier2Price"],
                      ["agentTier3Qty", "agentTier3Price"],
                    ] as const
                  ).map(([qtyKey, priceKey], idx) =>
                    idx === 0 ? (
                      <td key="retail" className="px-3 py-2">
                        <input
                          type="number"
                          className="w-28 rounded border px-2 py-1"
                          value={p.retailPrice}
                          onChange={(e) =>
                            updatePricing(p.id, "retailPrice", Number(e.target.value))
                          }
                        />
                      </td>
                    ) : (
                      <td key={String(qtyKey)} className="px-3 py-2">
                        <div className="flex gap-1">
                          <input
                            type="number"
                            className="w-16 rounded border px-2 py-1"
                            value={p[qtyKey]}
                            onChange={(e) =>
                              updatePricing(p.id, qtyKey, Number(e.target.value))
                            }
                          />
                          <input
                            type="number"
                            className="w-24 rounded border px-2 py-1"
                            value={p[priceKey!]}
                            onChange={(e) =>
                              updatePricing(p.id, priceKey!, Number(e.target.value))
                            }
                          />
                        </div>
                      </td>
                    )
                  )}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={(e) => void createSaleRule(e)} className="card space-y-3 p-4">
          <h2 className="font-bold">Tạo sale-price-rule</h2>
          <input className={inputClass} placeholder="packageId (Mongo)" value={newRule.packageId} onChange={(e) => setNewRule({ ...newRule, packageId: e.target.value })} />
          <select className={inputClass} value={newRule.channel} onChange={(e) => setNewRule({ ...newRule, channel: e.target.value })}>
            {["anonymous", "retail", "agent", "collaborator", "vip"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input className={inputClass} type="number" placeholder="Giá bán" value={newRule.salePrice} onChange={(e) => setNewRule({ ...newRule, salePrice: Number(e.target.value) })} />
          <button type="submit" className="btn-primary">Tạo rule</button>
        </form>
        <form onSubmit={(e) => void createSupplierPrice(e)} className="card space-y-3 p-4">
          <h2 className="font-bold">Tạo supplier-package-price</h2>
          <input className={inputClass} placeholder="packageId" value={newCost.packageId} onChange={(e) => setNewCost({ ...newCost, packageId: e.target.value })} />
          <input className={inputClass} placeholder="supplierId" value={newCost.supplierId} onChange={(e) => setNewCost({ ...newCost, supplierId: e.target.value })} />
          <input className={inputClass} type="number" placeholder="costPrice" value={newCost.costPrice} onChange={(e) => setNewCost({ ...newCost, costPrice: Number(e.target.value) })} />
          <button type="submit" className="btn-primary">Tạo giá nhập</button>
        </form>
      </div>
    </div>
  );
}
