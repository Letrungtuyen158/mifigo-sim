"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { COUNTRIES, DAY_OPTIONS } from "@/lib/constants";

type SimTab = "esim" | "physical";

export default function HeroQuickSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<SimTab>("esim");
  const [country, setCountry] = useState("");
  const [days, setDays] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("simType", tab);
    if (country) params.set("country", country);
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M9 2v4h6V2" />
              <rect x="8" y="10" width="8" height="6" rx="1" />
            </svg>
            SIM
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
            >
              <option value="">Chọn một hoặc nhiều quốc gia</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>

            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20 sm:w-44"
            >
              <option value="">Chọn số ngày</option>
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={String(d)}>
                  {d} ngày
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="min-h-12 shrink-0 rounded-full bg-[#1d6be8] px-8 text-sm font-extrabold text-white shadow-lg shadow-[#1d6be8]/30 transition hover:bg-[#1558c0]"
            >
              Mua ngay
            </button>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/huong-dan"
              className="text-sm font-semibold text-[#1d6be8] hover:underline"
            >
              Kiểm tra điện thoại có hỗ trợ eSIM không →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
