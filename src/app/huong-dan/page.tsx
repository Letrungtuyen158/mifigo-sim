"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

export default function HuongDanPage() {
  const { t } = useTranslation();

  const steps = [
    {
      step: t("guide.step", { n: 1 }),
      title: t("guide.step1Title"),
      body: t("guide.step1Body"),
      href: "/tra-cuu",
    },
    {
      step: t("guide.step", { n: 2 }),
      title: t("guide.step2Title"),
      body: t("guide.step2Body"),
      href: "/dat-hang",
    },
    {
      step: t("guide.step", { n: 3 }),
      title: t("guide.step3Title"),
      body: t("guide.step3Body"),
      href: "/dat-hang",
    },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-black text-slate-900">{t("guide.title")}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{t("guide.subtitle")}</p>

      <div className="mt-8 grid gap-4">
        {steps.map((item) => (
          <div key={item.step} className="card p-6">
            <div className="text-sm font-bold uppercase tracking-wide text-[#1d6be8]">
              {item.step}
            </div>
            <h2 className="mt-1 text-xl font-bold">{item.title}</h2>
            <p className="mt-2 text-slate-600">{item.body}</p>
            <Link href={item.href} className="mt-4 inline-block text-sm font-bold text-[#1d6be8]">
              {t("common.start")}
            </Link>
          </div>
        ))}
      </div>

      <div className="card mt-8 bg-blue-50 p-6">
        <h3 className="font-bold text-slate-900">{t("guide.pricingTitle")}</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>{t("guide.pricing1")}</li>
          <li>{t("guide.pricing2")}</li>
          <li>{t("guide.pricing3")}</li>
        </ul>
      </div>
    </div>
  );
}
