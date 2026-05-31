"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { formatVnd } from "@/lib/format";
import { tCountry } from "@/lib/i18n";
import {
  POPULAR_COUNTRIES,
  POPULAR_REGION_TABS,
  type PopularRegionTab,
} from "@/lib/popularCountries";

export default function PopularCountriesSection() {
  const { t, locale } = useTranslation();
  const [tab, setTab] = useState<PopularRegionTab>("asia");
  const items = POPULAR_COUNTRIES[tab];

  const tabs = useMemo(
    () =>
      POPULAR_REGION_TABS.map((item) => ({
        ...item,
        label: t(`popularRegion.${item.id}`),
      })),
    [t]
  );

  return (
    <section className="container-page pb-16">
      <h2 className="text-center text-2xl font-black text-slate-900 sm:text-[26px]">
        {t("home.popularCountries")}
      </h2>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
              tab === item.id
                ? "border-[#1d6be8] bg-[#1d6be8] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const href =
            item.priceLabelKey === "contact"
              ? "/tra-cuu"
              : item.countryCode
                ? `/tra-cuu?countryCode=${item.countryCode}&simType=esim`
                : item.regionKey
                  ? `/tra-cuu?region=${item.regionKey}&simType=esim`
                  : "/tra-cuu?simType=esim";

          const priceText = item.priceLabelKey
            ? t(`common.${item.priceLabelKey}`)
            : item.priceFrom != null
              ? t("common.fromPrice", { price: formatVnd(item.priceFrom) })
              : t("common.searchPackagesLink");

          return (
            <Link
              key={`${tab}-${item.nameKey}`}
              href={href}
              className="card flex items-center gap-3 p-3 transition hover:border-[#1d6be8]/40 hover:shadow-md sm:p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[28px] leading-none sm:text-[32px]">
                {item.flag}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-slate-900">
                  {item.countryCode
                    ? tCountry(locale, item.countryCode)
                    : t(`popularCountry.${item.nameKey}`)}
                </div>
                <div className="mt-0.5 text-xs font-bold text-[#1d6be8]">{priceText}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
