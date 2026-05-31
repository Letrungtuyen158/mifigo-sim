"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminWriteGate from "@/components/admin/AdminWriteGate";
import StaffReadOnlyBanner from "@/components/admin/StaffReadOnlyBanner";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  fetchCustomerGroupSelectOptions,
  fetchPackageSelectOptions,
  type SelectOption,
} from "@/lib/admin-selects";
import {
  docId,
  inputClass,
  mongoIdString,
  refId,
  refName,
  adminPageHeaderClass,
  adminTableWrapClass,
} from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminPaginated } from "@/lib/admin-list";
import { formatVnd } from "@/lib/format";

const CHANNELS = ["anonymous", "retail", "agent", "collaborator", "vip"] as const;

type SaleRuleRow = {
  id: string;
  packageId: string;
  packageName?: string;
  channel: string;
  salePrice: number;
  isActive: boolean;
  customerGroupId?: string;
};

function firstTierPrice(rule: Record<string, unknown>): number {
  const tiers = (rule.tiers as Array<Record<string, unknown>> | undefined) || [];
  return Number(tiers[0]?.salePrice || 0);
}

export default function AdminSalePriceRulesPage() {
  const [page, setPage] = useState(1);
  const [rules, setRules] = useState<SaleRuleRow[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
    limit: ADMIN_LIST_LIMIT,
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [packageOptions, setPackageOptions] = useState<SelectOption[]>([]);
  const [groupOptions, setGroupOptions] = useState<SelectOption[]>([]);
  const [newRule, setNewRule] = useState({
    packageId: "",
    channel: "anonymous" as (typeof CHANNELS)[number],
    customerGroupId: "",
    salePrice: 0,
    isActive: true,
  });

  useEffect(() => {
    void Promise.all([fetchPackageSelectOptions(), fetchCustomerGroupSelectOptions()])
      .then(([pkgs, groups]) => {
        setPackageOptions(pkgs);
        setGroupOptions(groups);
      })
      .catch(() => toast.error("Lỗi tải danh sách gói/nhóm khách"));
  }, []);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await fetchAdminPaginated<Record<string, unknown>>(
        "/api/admin/sale-price-rules",
        p,
        ADMIN_LIST_LIMIT
      );
      setRules(
        data.items.map((r) => ({
          id: docId(r),
          packageId: refId(r.packageId),
          packageName: refName(r.packageId) || undefined,
          channel: String(r.channel || ""),
          salePrice: firstTierPrice(r),
          isActive: r.isActive !== false,
          customerGroupId: r.customerGroupId ? refId(r.customerGroupId) : undefined,
        }))
      );
      setMeta({
        total: data.total,
        totalPages: data.totalPages,
        limit: data.limit,
        page: data.page,
      });
      setPage(data.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải quy tắc giá");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  function packageLabel(row: SaleRuleRow) {
    if (row.packageName) return row.packageName;
    const fromList = packageOptions.find((p) => p.id === row.packageId)?.label;
    if (fromList) return fromList;
    return row.packageId ? row.packageId.slice(-8) : "—";
  }

  async function createSaleRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newRule.packageId) return toast.error("Chọn gói cước");
    if (newRule.salePrice <= 0) return toast.error("Nhập giá bán hợp lệ");

    const body: Record<string, unknown> = {
      packageId: newRule.packageId,
      channel: newRule.channel,
      isActive: newRule.isActive,
      tiers: [{ minQuantity: 1, maxQuantity: null, salePrice: newRule.salePrice }],
    };
    if (newRule.customerGroupId) body.customerGroupId = newRule.customerGroupId;

    const res = await fetch("/api/admin/sale-price-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { message?: string };
    if (!res.ok) return toast.error(json.message || "Tạo rule thất bại");
    toast.success("Đã tạo sale-price-rule");
    setNewRule({
      packageId: "",
      channel: "anonymous",
      customerGroupId: "",
      salePrice: 0,
      isActive: true,
    });
    void load(1);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className={adminPageHeaderClass}>
        <div>
          <h1 className="text-2xl font-black">Giá bán (sale-price-rules)</h1>
          <p className="text-sm text-slate-600">
            API: <code className="text-xs">GET/POST /admin/sale-price-rules</code>. Cần ít nhất một rule{" "}
            <code className="text-xs">anonymous</code> + <code className="text-xs">isActive</code> để gói hiện
            trên search public.
          </p>
        </div>
      </div>

      <StaffReadOnlyBanner />

      <AdminWriteGate>
      <form
        onSubmit={(e) => void createSaleRule(e)}
        className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
      >
        <h2 className="font-bold sm:col-span-2 lg:col-span-6">Tạo sale-price-rule</h2>
        <label className="block text-sm lg:col-span-2">
          <span className="mb-1 block font-semibold">Gói cước</span>
          <select
            className={inputClass}
            value={newRule.packageId}
            required
            onChange={(e) => setNewRule({ ...newRule, packageId: e.target.value })}
          >
            <option value="">— Chọn gói —</option>
            {packageOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Kênh bán</span>
          <select
            className={inputClass}
            value={newRule.channel}
            onChange={(e) =>
              setNewRule({ ...newRule, channel: e.target.value as (typeof CHANNELS)[number] })
            }
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Nhóm khách</span>
          <select
            className={inputClass}
            value={newRule.customerGroupId}
            onChange={(e) => setNewRule({ ...newRule, customerGroupId: e.target.value })}
          >
            <option value="">— Không —</option>
            {groupOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Giá bán (VND)</span>
          <input
            className={inputClass}
            type="number"
            min={1}
            placeholder="150000"
            value={newRule.salePrice || ""}
            onChange={(e) => setNewRule({ ...newRule, salePrice: Number(e.target.value) })}
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newRule.isActive}
              onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
            />
            Kích hoạt
          </label>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Tạo rule
          </button>
        </div>
      </form>
      </AdminWriteGate>

      <div className={`card ${adminTableWrapClass} p-4`}>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : (
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Gói</th>
                <th className="px-3 py-2">Kênh</th>
                <th className="px-3 py-2">Giá (tier 1)</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    Chưa có quy tắc giá — tạo rule phía trên.
                  </td>
                </tr>
              ) : (
                rules.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{packageLabel(row)}</td>
                    <td className="px-3 py-2">{row.channel}</td>
                    <td className="px-3 py-2 font-semibold text-[#1d6be8]">
                      {formatVnd(row.salePrice)}
                    </td>
                    <td className="px-3 py-2">{row.isActive ? "✓" : "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/gia-ban/${mongoIdString(row.packageId)}`}
                        className="text-sm font-semibold text-[#1d6be8] hover:underline"
                      >
                        Chỉnh bậc giá →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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
    </div>
  );
}
