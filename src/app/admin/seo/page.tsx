"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { inputClass } from "@/lib/admin-utils";

export default function AdminSeoPage() {
  const [form, setForm] = useState({
    siteName: "",
    defaultTitle: "",
    defaultDescription: "",
    defaultKeywords: "",
    defaultOgImage: "",
    robotsTxt: "",
    googleAnalyticsId: "",
    googleSearchConsoleCode: "",
    sitemapEnabled: true,
  });

  useEffect(() => {
    void fetch("/api/admin/seo-settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.data || {};
        setForm({
          siteName: String(s.siteName || ""),
          defaultTitle: String(s.defaultTitle || ""),
          defaultDescription: String(s.defaultDescription || ""),
          defaultKeywords: Array.isArray(s.defaultKeywords) ? s.defaultKeywords.join(", ") : "",
          defaultOgImage: String(s.defaultOgImage || ""),
          robotsTxt: String(s.robotsTxt || ""),
          googleAnalyticsId: String(s.googleAnalyticsId || ""),
          googleSearchConsoleCode: String(s.googleSearchConsoleCode || ""),
          sitemapEnabled: s.sitemapEnabled !== false,
        });
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/seo-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        defaultKeywords: form.defaultKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      }),
    });
    if (!res.ok) return toast.error("Lưu thất bại");
    toast.success("Đã lưu SEO");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Cài đặt SEO</h1>
      <form onSubmit={(e) => void save(e)} className="card grid max-w-2xl gap-3 p-5">
        {(
          [
            ["siteName", "Tên site"],
            ["defaultTitle", "Title mặc định"],
            ["defaultDescription", "Mô tả mặc định"],
            ["defaultKeywords", "Keywords (phẩy)"],
            ["defaultOgImage", "OG image URL"],
            ["googleAnalyticsId", "GA ID"],
            ["googleSearchConsoleCode", "GSC code"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="font-semibold">{label}</span>
            <input
              className={inputClass + " mt-1"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="font-semibold">robots.txt</span>
          <textarea className={inputClass + " mt-1 min-h-[80px]"} value={form.robotsTxt} onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.sitemapEnabled} onChange={(e) => setForm({ ...form, sitemapEnabled: e.target.checked })} />
          Bật sitemap
        </label>
        <button type="submit" className="btn-primary">Lưu</button>
      </form>
    </div>
  );
}
