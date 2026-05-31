"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchChannelPricingForPackage,
  saveChannelPricing,
  type ChannelPricingRow,
} from "@/lib/admin-pricing";
import { adminPageHeaderClass, inputClass } from "@/lib/admin-utils";
import { formatVnd } from "@/lib/format";
import type { ChannelPricing } from "@/lib/types";

export default function AdminChannelPricingDetailPage() {
  const params = useParams<{ packageId: string }>();
  const packageId = params.packageId;
  const [pricing, setPricing] = useState<ChannelPricingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchChannelPricingForPackage(packageId);
      setPricing(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải giá bán");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField(field: keyof ChannelPricing, value: number) {
    setPricing((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function save() {
    if (!pricing) return;
    setSaving(true);
    try {
      await saveChannelPricing(pricing);
      toast.success("Đã lưu giá bán kênh");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !pricing) {
    return <div className="py-10 text-sm text-slate-500">Đang tải…</div>;
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <Link href="/admin/gia-ban" className="text-sm font-semibold text-[#1d6be8] hover:underline">
            ← Danh sách giá bán
          </Link>
          <h1 className="mt-2 text-2xl font-black">{pricing.packageName}</h1>
          <p className="text-sm text-slate-600">
            Nhập: {formatVnd(pricing.costPrice)} ·{" "}
            <code className="text-xs">GET /admin/sale-price-rules?packageId=…</code>
          </p>
        </div>
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="card overflow-x-auto p-4">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2">Giá lẻ</th>
              <th className="px-3 py-2">≥SL1 / Giá1</th>
              <th className="px-3 py-2">≥SL2 / Giá2</th>
              <th className="px-3 py-2">≥SL3 / Giá3</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-3 py-2">
                <input
                  type="number"
                  className="w-28 rounded border px-2 py-1"
                  value={pricing.retailPrice}
                  onChange={(e) => updateField("retailPrice", Number(e.target.value))}
                />
              </td>
              {(
                [
                  ["agentTier1Qty", "agentTier1Price"],
                  ["agentTier2Qty", "agentTier2Price"],
                  ["agentTier3Qty", "agentTier3Price"],
                ] as const
              ).map(([qtyKey, priceKey]) => (
                <td key={qtyKey} className="px-3 py-2">
                  <div className="flex gap-1">
                    <input
                      type="number"
                      className="w-16 rounded border px-2 py-1"
                      value={pricing[qtyKey]}
                      onChange={(e) => updateField(qtyKey, Number(e.target.value))}
                    />
                    <input
                      type="number"
                      className="w-24 rounded border px-2 py-1"
                      value={pricing[priceKey]}
                      onChange={(e) => updateField(priceKey, Number(e.target.value))}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
