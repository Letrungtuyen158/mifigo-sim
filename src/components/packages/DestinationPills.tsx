"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { COUNTRIES, REGIONS } from "@/lib/constants";
import { tCountry, tRegion } from "@/lib/i18n";
import { buildTraCuuUrl } from "@/lib/searchUrl";

export default function DestinationPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();

  const activeCountryCode = searchParams.get("countryCode") || "";
  const activeRegion = searchParams.get("region") || "";

  const pills = useMemo(
    () => [
      { id: "all", label: t("common.all") },
      ...REGIONS.map((region) => ({
        id: `region-${region}`,
        label: tRegion(locale, region),
        region,
      })),
      ...COUNTRIES.map((c) => ({
        id: c.code,
        label: tCountry(locale, c.code),
        countryCode: c.code,
        flag: c.flag,
      })),
    ],
    [locale, t]
  );

  function selectPill(pill: (typeof pills)[number]) {
    if (pill.id === "all") {
      router.push(
        buildTraCuuUrl(searchParams, {
          countryCode: undefined,
          country: undefined,
          region: undefined,
        })
      );
      return;
    }

    if ("region" in pill && pill.region) {
      router.push(
        buildTraCuuUrl(searchParams, {
          region: pill.region,
          countryCode: undefined,
          country: undefined,
        })
      );
      return;
    }

    if ("countryCode" in pill && pill.countryCode) {
      router.push(
        buildTraCuuUrl(searchParams, {
          countryCode: pill.countryCode,
          country: undefined,
          region: undefined,
        })
      );
    }
  }

  function isActive(pill: (typeof pills)[number]) {
    if (pill.id === "all") return !activeCountryCode && !activeRegion;
    if ("region" in pill && pill.region) return activeRegion === pill.region;
    if ("countryCode" in pill && pill.countryCode)
      return activeCountryCode === pill.countryCode;
    return false;
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-2">
        {pills.map((pill) => {
          const active = isActive(pill);
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => selectPill(pill)}
              className={`chip shrink-0 gap-1.5 border px-4 py-2 ${
                active
                  ? "border-[#1d6be8] bg-blue-50 text-[#1d6be8]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {pill.id === "all" ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ) : null}
              {"flag" in pill && pill.flag ? (
                <span aria-hidden>{pill.flag}</span>
              ) : null}
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
