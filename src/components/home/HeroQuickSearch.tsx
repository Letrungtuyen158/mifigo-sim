"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { COUNTRIES, DAY_OPTIONS } from "@/lib/constants";
import { tCountry } from "@/lib/i18n";

type SimTab = "esim" | "physical";

const fieldClass =
  "min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20";

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
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-md sm:p-5">
        <div className="mb-4 inline-flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setTab("esim")}
            className={`chip px-4 py-2 ${
              tab === "esim"
                ? "bg-[#1d6be8] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:bg-white"
            }`}
          >
            eSIM
          </button>
          <button
            type="button"
            onClick={() => setTab("physical")}
            className={`chip px-4 py-2 ${
              tab === "physical"
                ? "bg-[#1d6be8] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:bg-white"
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
              className={`${fieldClass} flex-1`}
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
              className={`${fieldClass} sm:w-44`}
            >
              <option value="">{t("home.selectDays")}</option>
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={String(d)}>
                  {d} {t("common.days")}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-primary min-h-11 shrink-0 px-8">
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
