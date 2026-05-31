"use client";

import Link from "next/link";
import HeroQuickSearch from "@/components/home/HeroQuickSearch";
import OrderStepsSection from "@/components/home/OrderStepsSection";
import PopularCountriesSection from "@/components/home/PopularCountriesSection";
import { useBrand } from "@/contexts/BrandContext";
import { useTranslation } from "@/contexts/LanguageContext";

export default function HomePageContent() {
  const { t } = useTranslation();
  const brand = useBrand();

  return (
    <div>
      <section className="relative overflow-hidden pb-16 pt-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-travel.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#ecf3fb]/92 via-[#ecf3fb]/78 to-[#ecf3fb]/96"
          aria-hidden
        />

        <div className="container-page relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {brand.name}
              <span className="text-[#1d6be8]"> eSIM</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-700 sm:text-xl">
              {t("home.heroTitle")}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> — </span>
              {t("home.heroSubtitle")}
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-8 max-w-4xl">
          <HeroQuickSearch />
        </div>
      </section>

      <section className="container-page pb-12 pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: t("home.quickIntro"),
              desc: t("home.quickIntroDesc"),
              href: "/tra-cuu",
            },
            {
              title: t("home.guideCard"),
              desc: t("home.guideCardDesc"),
              href: "/huong-dan",
            },
            {
              title: t("home.cartCard"),
              desc: t("home.cartCardDesc"),
              href: "/dat-hang",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              <span className="mt-4 inline-block text-sm font-bold text-[#1d6be8]">
                {t("common.seeMore")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <PopularCountriesSection />
      <OrderStepsSection />
    </div>
  );
}
