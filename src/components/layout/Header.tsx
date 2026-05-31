"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CartLink from "@/components/layout/CartLink";
import BrandLogo from "@/components/layout/BrandLogo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "@/contexts/LanguageContext";

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [role, setRole] = useState<string>("guest");
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

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setRole(d.role ?? "guest"));
  }, [pathname]);

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
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
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
          <CartLink />
          <Link
            href="/tra-cuu?simType=esim"
            className="inline-flex h-10 items-center rounded-full bg-[#1d6be8] px-5 text-sm font-extrabold text-white shadow-md shadow-[#1d6be8]/30 transition hover:bg-[#1558c0]"
          >
            {t("common.buyEsim")}
          </Link>
          {role === "admin" && (
            <Link href="/admin" className="rounded-full border px-4 py-2 text-sm font-semibold">
              {t("common.admin")}
            </Link>
          )}
          {role !== "guest" && role !== "admin" && (
            <Link
              href="/don-hang-cua-toi"
              className="rounded-full border px-4 py-2 text-sm font-semibold"
            >
              {t("auth.myOrders")}
            </Link>
          )}
          {role === "guest" ? (
            <Link
              href="/dang-nhap"
              className="inline-flex h-10 items-center rounded-full bg-[#f97316] px-5 text-sm font-extrabold text-white shadow-md shadow-[#f97316]/30 transition hover:bg-[#ea580c]"
            >
              {t("common.login")}
            </Link>
          ) : (
            <button
              type="button"
              className="rounded-full border px-4 py-2 text-sm font-semibold"
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
          <CartLink />
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
            <Link href="/dang-nhap" className="btn-accent text-center" onClick={() => setOpen(false)}>
              {t("common.login")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
