"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { COUNTRIES, DAY_OPTIONS } from "@/lib/constants";
import { tCountry } from "@/lib/i18n";

type SimTab = "esim" | "physical";

export default function HeroQuickSearch() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [tab, setTab] = useState<SimTab>("esim");
  const [countryCode, setCountryCode] = useState("");
  const [days, setDays] = useState("");

  const countries = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        ...c,
        label: tCountry(locale, c.code),
      })),
    [locale]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("simType", tab);
    if (countryCode) params.set("countryCode", countryCode);
    if (days) params.set("days", days);
    router.push(`/tra-cuu?${params.toString()}`);
  }

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl sm:p-5">
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("esim")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === "esim"
                ? "bg-[#1d6be8] text-white shadow-md shadow-[#1d6be8]/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            eSIM
          </button>
          <button
            type="button"
            onClick={() => setTab("physical")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === "physical"
                ? "bg-[#1d6be8] text-white shadow-md shadow-[#1d6be8]/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            SIM
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
            >
              <option value="">{t("home.selectCountries")}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>

            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20 sm:w-44"
            >
              <option value="">{t("home.selectDays")}</option>
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={String(d)}>
                  {d} {t("common.days")}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="min-h-12 shrink-0 rounded-full bg-[#1d6be8] px-8 text-sm font-extrabold text-white shadow-lg shadow-[#1d6be8]/30 transition hover:bg-[#1558c0]"
            >
              {t("common.buyNow")}
            </button>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/huong-dan"
              className="text-sm font-semibold text-[#1d6be8] hover:underline"
            >
              {t("home.checkEsimSupport")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
