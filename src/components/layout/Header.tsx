"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import CartLink from "@/components/layout/CartLink";
import BrandLogo from "@/components/layout/BrandLogo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuthRole } from "@/hooks/useAuthRole";
import {
  canAccessAdminPanel,
  isCustomerRole,
  shouldShowStorefrontCheckout,
} from "@/lib/roles";

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { role } = useAuthRole();
  const [open, setOpen] = useState(false);

  const NAV = useMemo(
    () => [
      { href: "/", label: t("common.home") },
      { href: "/tra-cuu", label: t("common.searchPackages") },
      { href: "/huong-dan", label: t("common.guide") },
      { href: "/esim-vn", label: t("common.esimVn") },
    ],
    [t]
  );

  const showCart = shouldShowStorefrontCheckout(role);
  const showMyOrders = isCustomerRole(role);
  const showAdminLink = canAccessAdminPanel(role);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-3 py-3">
        <BrandLogo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[#1d6be8]/10 text-[#1d6be8]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {showCart ? <CartLink /> : null}
          <Link href="/tra-cuu?simType=esim" className="btn-primary h-10 px-5">
            {t("common.buyEsim")}
          </Link>
          {showAdminLink ? (
            <Link
              href="/admin"
              className="rounded-md border px-4 py-2 text-sm font-semibold"
            >
              {t("common.admin")}
            </Link>
          ) : null}
          {showMyOrders ? (
            <Link
              href="/don-hang-cua-toi"
              className="rounded-md border px-4 py-2 text-sm font-semibold"
            >
              {t("auth.myOrders")}
            </Link>
          ) : null}
          {role === "guest" ? (
            <Link href="/dang-nhap" className="btn-accent h-10 px-5">
              {t("common.login")}
            </Link>
          ) : (
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm font-semibold"
              onClick={() => {
                void fetch("/api/auth/logout", { method: "POST" }).then(() =>
                  window.location.reload()
                );
              }}
            >
              {t("common.logout")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          {showCart ? <CartLink /> : null}
          <button
            type="button"
            className="rounded-lg border px-3 py-2"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("common.menu")}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/tra-cuu?simType=esim"
              className="btn-primary mt-2 text-center"
              onClick={() => setOpen(false)}
            >
              {t("common.buyEsim")}
            </Link>
            {showAdminLink ? (
              <Link
                href="/admin"
                className="rounded-md border px-3 py-2 text-center text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                {t("common.admin")}
              </Link>
            ) : null}
            {showMyOrders ? (
              <Link
                href="/don-hang-cua-toi"
                className="rounded-md border px-3 py-2 text-center text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                {t("auth.myOrders")}
              </Link>
            ) : null}
            {role === "guest" ? (
              <Link
                href="/dang-nhap"
                className="btn-accent text-center"
                onClick={() => setOpen(false)}
              >
                {t("common.login")}
              </Link>
            ) : (
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm font-semibold"
                onClick={() => {
                  void fetch("/api/auth/logout", { method: "POST" }).then(() =>
                    window.location.reload()
                  );
                }}
              >
                {t("common.logout")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
