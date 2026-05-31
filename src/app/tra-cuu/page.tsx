"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DestinationPills from "@/components/packages/DestinationPills";
import PackageFilterSidebar, {
  type SidebarFilterValues,
} from "@/components/packages/PackageFilterSidebar";
import PackageResultList from "@/components/packages/PackageResultList";
import Pagination from "@/components/ui/Pagination";
import { useTranslation } from "@/contexts/LanguageContext";
import { addToCart } from "@/lib/cart";
import { PACKAGE_PAGE_SIZE } from "@/lib/constants";
import { buildTraCuuUrl } from "@/lib/searchUrl";
import type { PackageSearchResult } from "@/lib/types";

function TraCuuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [results, setResults] = useState<PackageSearchResult[]>([]);
  const [role, setRole] = useState("guest");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PACKAGE_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });

  const simType = searchParams.get("simType") || "esim";
  const isEsim = simType !== "physical";
  const listQuantity = Math.min(
    99,
    Math.max(1, Number(searchParams.get("quantity") || "1") || 1)
  );

  const sidebarInitial = useMemo<SidebarFilterValues>(
    () => ({
      sort: searchParams.get("sort") || "price_asc",
      packageType: searchParams.get("packageType") || "",
      dataGb: searchParams.get("dataGb") || "",
      days: searchParams.get("days") || "",
      simType: searchParams.get("simType") || "",
      quantity: searchParams.get("quantity") || "1",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    setSearchText(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const qs = searchParams.toString();
    setLoading(true);
    void fetch(`/api/packages/search?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.data || []);
        setRole(d.role || "guest");
        setPagination({
          page: d.page ?? 1,
          pageSize: d.pageSize ?? PACKAGE_PAGE_SIZE,
          total: d.total ?? 0,
          totalPages: d.totalPages ?? 1,
        });
        if (d.priceBounds) {
          setPriceBounds(d.priceBounds);
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  function applySidebarFilters(values: SidebarFilterValues) {
    router.push(
      buildTraCuuUrl(searchParams, {
        sort: values.sort !== "price_asc" ? values.sort : undefined,
        packageType: values.packageType || undefined,
        dataGb: values.dataGb || undefined,
        days: values.days || undefined,
        simType: values.simType || undefined,
        quantity: values.quantity !== "1" ? values.quantity : undefined,
        minPrice:
          values.minPrice && Number(values.minPrice) > priceBounds.min
            ? values.minPrice
            : undefined,
        maxPrice:
          values.maxPrice && Number(values.maxPrice) < priceBounds.max
            ? values.maxPrice
            : undefined,
        page: undefined,
      })
    );
  }

  function resetSidebarFilters() {
    router.push(
      buildTraCuuUrl(searchParams, {
        sort: undefined,
        packageType: undefined,
        dataGb: undefined,
        days: undefined,
        simType: undefined,
        quantity: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        q: undefined,
        page: undefined,
      })
    );
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(
      buildTraCuuUrl(searchParams, {
        q: searchText.trim() || undefined,
        page: undefined,
      })
    );
  }

  return (
    <div className="container-page py-6 lg:py-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-[#1d6be8]">
          {t("search.breadcrumbHome")}
        </Link>
        <span className="mx-2">›</span>
        <span className="font-medium text-slate-700">
          {isEsim ? "eSIM" : t("simType.physical")}
        </span>
      </nav>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 sm:text-3xl">
          {isEsim ? t("search.esimTravel") : t("search.physicalTravel")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
          {isEsim ? t("search.esimDesc") : t("search.physicalDesc")}
        </p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <DestinationPills />
        </Suspense>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full min-w-0 shrink-0 lg:w-72">
          <PackageFilterSidebar
            initial={sidebarInitial}
            priceBounds={priceBounds}
            onApply={applySidebarFilters}
            onReset={resetSidebarFilters}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <form
            onSubmit={handleSearchSubmit}
            className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("search.searchPlaceholder", {
                  total: pagination.total,
                })}
                className="input-field py-3 pl-4 pr-4"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0 px-6">
              {t("common.search")}
            </button>
          </form>

          <p className="mb-4 text-sm text-slate-600">
            {t("search.pageInfo", {
              page: pagination.page,
              totalPages: pagination.totalPages,
              count: results.length,
              total: pagination.total,
            })}
          </p>

          {loading ? (
            <div className="card p-8 text-center text-slate-500">
              {t("search.loadingResults")}
            </div>
          ) : (
            <>
              <PackageResultList
                results={results}
                role={role}
                defaultQuantity={listQuantity}
                onAdd={(item, quantity) => {
                  addToCart({
                    packageId: item.package.id,
                    packageName: item.package.name,
                    country: item.package.country,
                    simType: item.package.simType,
                    unitPrice: item.unitPrice,
                    quantity,
                  });
                  toast.success(t("search.addedToCart"));
                }}
              />
              <Pagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                totalPages={pagination.totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TraCuuPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="container-page py-8">{t("common.loading")}</div>}>
      <TraCuuContent />
    </Suspense>
  );
}
