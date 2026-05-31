"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminOnlyGate from "@/components/admin/AdminOnlyGate";
import { inputClass } from "@/lib/admin-utils";

type SeoForm = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  robotsTxt: string;
  googleAnalyticsId: string;
  googleSearchConsoleCode: string;
  sitemapEnabled: boolean;
};

const EMPTY: SeoForm = {
  siteName: "",
  defaultTitle: "",
  defaultDescription: "",
  defaultKeywords: "",
  defaultOgImage: "",
  robotsTxt: "",
  googleAnalyticsId: "",
  googleSearchConsoleCode: "",
  sitemapEnabled: true,
};

function mapSeo(raw: Record<string, unknown> | undefined): SeoForm {
  if (!raw) return { ...EMPTY };
  const kw = raw.defaultKeywords;
  return {
    siteName: String(raw.siteName || ""),
    defaultTitle: String(raw.defaultTitle || ""),
    defaultDescription: String(raw.defaultDescription || ""),
    defaultKeywords: Array.isArray(kw) ? kw.map(String).join(", ") : "",
    defaultOgImage: String(raw.defaultOgImage || ""),
    robotsTxt: String(raw.robotsTxt || ""),
    googleAnalyticsId: String(raw.googleAnalyticsId || ""),
    googleSearchConsoleCode: String(raw.googleSearchConsoleCode || ""),
    sitemapEnabled: raw.sitemapEnabled !== false,
  };
}

function SeoSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SeoForm>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo-settings");
      const json = (await res.json()) as {
        success?: boolean;
        data?: Record<string, unknown>;
        message?: string;
      };
      if (!res.ok) throw new Error(json.message || "Lỗi tải SEO");
      setForm(mapSeo(json.data));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải SEO");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const body = {
        ...form,
        defaultKeywords: form.defaultKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin/seo-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(json.message || "Lưu thất bại");
      toast.success("Đã lưu cài đặt SEO");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Đang tải SEO…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Cài đặt SEO</h1>
          <p className="text-sm text-slate-600">
            Meta mặc định cho website — public chỉ nhận subset qua{" "}
            <code className="text-xs">GET /public/seo/settings</code>.
          </p>
        </div>
        <button type="button" className="btn-primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="card grid gap-3 p-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Tên site</span>
          <input
            className={inputClass}
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Title mặc định</span>
          <input
            className={inputClass}
            value={form.defaultTitle}
            onChange={(e) => setForm({ ...form, defaultTitle: e.target.value })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold">Description mặc định</span>
          <textarea
            className={inputClass}
            rows={3}
            value={form.defaultDescription}
            onChange={(e) => setForm({ ...form, defaultDescription: e.target.value })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold">Keywords (phân cách dấu phẩy)</span>
          <input
            className={inputClass}
            value={form.defaultKeywords}
            onChange={(e) => setForm({ ...form, defaultKeywords: e.target.value })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold">OG image URL</span>
          <input
            className={inputClass}
            value={form.defaultOgImage}
            onChange={(e) => setForm({ ...form, defaultOgImage: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Google Analytics ID</span>
          <input
            className={inputClass}
            placeholder="G-XXXXXXXX"
            value={form.googleAnalyticsId}
            onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Search Console verification</span>
          <input
            className={inputClass}
            value={form.googleSearchConsoleCode}
            onChange={(e) => setForm({ ...form, googleSearchConsoleCode: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.sitemapEnabled}
            onChange={(e) => setForm({ ...form, sitemapEnabled: e.target.checked })}
          />
          Bật sitemap
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold">robots.txt</span>
          <textarea
            className={inputClass}
            rows={5}
            value={form.robotsTxt}
            onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminSeoPage() {
  return (
    <AdminOnlyGate>
      <SeoSettingsForm />
    </AdminOnlyGate>
  );
}
