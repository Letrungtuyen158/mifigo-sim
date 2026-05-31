"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

type SimTab = "esim" | "physical";

export default function OrderStepsSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SimTab>("esim");

  const steps = useMemo(
    () =>
      tab === "esim"
        ? [
            { num: "01", emoji: "🗺️", title: t("home.step1EsimTitle"), desc: t("home.step1EsimDesc") },
            { num: "02", emoji: "💳", title: t("home.step2EsimTitle"), desc: t("home.step2EsimDesc") },
            { num: "03", emoji: "📱", title: t("home.step3EsimTitle"), desc: t("home.step3EsimDesc") },
          ]
        : [
            { num: "01", emoji: "🗺️", title: t("home.step1PhysicalTitle"), desc: t("home.step1PhysicalDesc") },
            { num: "02", emoji: "💳", title: t("home.step2PhysicalTitle"), desc: t("home.step2PhysicalDesc") },
            { num: "03", emoji: "📦", title: t("home.step3PhysicalTitle"), desc: t("home.step3PhysicalDesc") },
          ],
    [tab, t]
  );

  return (
    <section className="bg-white py-14">
      <div className="container-page">
        <h2 className="text-2xl font-black text-slate-900">{t("home.orderStepsTitle")}</h2>

        <div className="mt-4 inline-flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setTab("esim")}
            className={`chip px-5 py-2 font-bold ${
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
            className={`chip px-5 py-2 font-bold ${
              tab === "physical"
                ? "bg-[#1d6be8] text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:bg-white"
            }`}
          >
            SIM
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="card overflow-hidden p-0">
              <div className="flex h-28 items-center justify-center bg-[#ecf3fb] text-4xl">
                {step.emoji}
              </div>
              <div className="p-5">
                <div className="text-3xl font-black text-[#1d6be8]/25">{step.num}</div>
                <h3 className="mt-1 font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/tra-cuu?simType=${tab}`}
            className="btn-primary inline-flex h-11 items-center px-8"
          >
            {tab === "esim" ? t("home.exploreEsim") : t("home.explorePhysical")}
          </Link>
        </div>
      </div>
    </section>
  );
}
