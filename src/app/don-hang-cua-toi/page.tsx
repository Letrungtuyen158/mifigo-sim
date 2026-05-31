"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { tOrderStatus } from "@/lib/i18n";
import { formatVnd } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useAuthRole } from "@/hooks/useAuthRole";
import { canAccessAdminPanel, isCustomerRole } from "@/lib/roles";
import { useRouter } from "next/navigation";

export default function DonHangCuaToiPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { role, loading: authLoading } = useAuthRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (canAccessAdminPanel(role)) {
      router.replace("/admin");
      return;
    }
    if (!isCustomerRole(role) && role !== "guest") {
      router.replace("/tra-cuu");
    }
  }, [authLoading, role, router]);

  useEffect(() => {
    if (authLoading || !isCustomerRole(role)) return;
    void fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .finally(() => setLoading(false));
  }, [authLoading, role]);

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">{t("orders.myOrders")}</h1>
      <p className="mt-2 text-slate-600">{t("orders.myOrdersHint")}</p>

      {loading ? (
        <p className="mt-8 text-slate-500">{t("order.loading")}</p>
      ) : orders.length === 0 ? (
        <div className="card mt-6 p-6 text-slate-600">
          {t("orders.empty")}{" "}
          <Link href="/tra-cuu" className="font-bold text-[#1d6be8]">
            {t("cart.searchFirst")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/don-hang/${order.code}`}
              className="card block p-4 transition hover:border-[#1d6be8]/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold">{order.code}</div>
                  <div className="text-sm text-slate-600">
                    {tOrderStatus(locale, order.status)} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString(
                      locale === "vi" ? "vi-VN" : locale === "zh" ? "zh-CN" : "en-US"
                    )}
                  </div>
                </div>
                <div className="text-lg font-black text-[#1d6be8]">
                  {formatVnd(order.total)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
