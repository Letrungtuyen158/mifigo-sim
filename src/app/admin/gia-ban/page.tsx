"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatVnd } from "@/lib/format";
import type { ChannelPricing, SupplierPackage } from "@/lib/types";

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<ChannelPricing[]>([]);
  const [packages, setPackages] = useState<SupplierPackage[]>([]);

  useEffect(() => {
    void fetch("/api/admin/store")
      .then((r) => r.json())
      .then((d) => {
        setPricing(d.data.pricing || []);
        setPackages(d.data.packages || []);
      });
  }, []);

  function updatePricing(id: string, field: keyof ChannelPricing, value: number) {
    setPricing((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  async function save() {
    const res = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricing }),
    });
    if (!res.ok) {
      toast.error("Lưu thất bại");
      return;
    }
    toast.success("Đã lưu giá bán kênh");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Giá bán kênh</h1>
          <p className="text-sm text-slate-600">
            Giá lẻ + 3 bậc giá đại lý theo số lượng.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => void save()}>
          Lưu thay đổi
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-[980px] text-sm">
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
            {pricing.map((p) => {
              const pkg = packages.find((x) => x.id === p.packageId);
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{pkg?.name}</div>
                    <div className="text-xs text-slate-500">
                      Nhập: {formatVnd(pkg?.costPrice || 0)}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
