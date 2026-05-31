"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function QuocGiaPage() {
  const [countries, setCountries] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void fetch("/api/public/countries")
      .then((r) => r.json())
      .then((d) => setCountries(Array.isArray(d.data) ? d.data : []));
  }, []);

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Quốc gia</h1>
      <p className="mt-2 text-slate-600">Danh sách từ API public/countries</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c) => (
          <Link
            key={String(c._id)}
            href={`/tra-cuu?countryCode=${String(c.code)}`}
            className="card flex items-center gap-3 p-4 hover:border-[#1d6be8]/40"
          >
            {c.flagUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(c.flagUrl)} alt="" className="h-8 w-10 object-cover" />
            ) : null}
            <div>
              <div className="font-bold">{String(c.nameVi || c.name)}</div>
              <div className="text-sm text-slate-500">{String(c.code)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
