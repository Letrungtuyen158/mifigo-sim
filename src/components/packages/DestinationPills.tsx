"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DESTINATION_PILLS } from "@/lib/constants";
import { buildTraCuuUrl } from "@/lib/searchUrl";

export default function DestinationPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCountry = searchParams.get("country") || "";
  const activeRegion = searchParams.get("region") || "";

  function selectPill(pill: (typeof DESTINATION_PILLS)[number]) {
    if (pill.id === "all") {
      router.push(
        buildTraCuuUrl(searchParams, { country: undefined, region: undefined })
      );
      return;
    }

    if ("region" in pill && pill.region) {
      router.push(
        buildTraCuuUrl(searchParams, {
          region: pill.region,
          country: undefined,
        })
      );
      return;
    }

    if ("country" in pill && pill.country) {
      router.push(
        buildTraCuuUrl(searchParams, {
          country: pill.country,
          region: undefined,
        })
      );
    }
  }

  function isActive(pill: (typeof DESTINATION_PILLS)[number]) {
    if (pill.id === "all") return !activeCountry && !activeRegion;
    if ("region" in pill && pill.region) return activeRegion === pill.region;
    if ("country" in pill && pill.country) return activeCountry === pill.country;
    return false;
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-2">
        {DESTINATION_PILLS.map((pill) => {
          const active = isActive(pill);
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => selectPill(pill)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
