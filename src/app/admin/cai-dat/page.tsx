"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminOnlyGate from "@/components/admin/AdminOnlyGate";
import { inputClass } from "@/lib/admin-utils";

type BrandSettings = {
  name: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  websiteUrl: string;
};

type BankSettings = {
  name: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  qrCodeUrl: string;
};

type AssetType = "logo" | "bankQr";

const EMPTY_BRAND: BrandSettings = {
  name: "",
  logoUrl: "",
  supportEmail: "",
  supportPhone: "",
  companyAddress: "",
  websiteUrl: "",
};

const EMPTY_BANK: BankSettings = {
  name: "",
  accountName: "",
  accountNumber: "",
  branch: "",
  qrCodeUrl: "",
};

const ASSET_LABELS: Record<AssetType, string> = {
  logo: "Logo",
  bankQr: "QR ngân hàng",
};

function str(value: unknown): string {
  return value != null ? String(value) : "";
}

function mapBrand(raw: Record<string, unknown> | undefined): BrandSettings {
  if (!raw) return { ...EMPTY_BRAND };
  return {
    name: str(raw.name),
    logoUrl: str(raw.logoUrl),
    supportEmail: str(raw.supportEmail),
    supportPhone: str(raw.supportPhone),
    companyAddress: str(raw.companyAddress),
    websiteUrl: str(raw.websiteUrl),
  };
}

function mapBank(raw: Record<string, unknown> | undefined): BankSettings {
  if (!raw) return { ...EMPTY_BANK };
  return {
    name: str(raw.name),
    accountName: str(raw.accountName),
    accountNumber: str(raw.accountNumber),
    branch: str(raw.branch),
    qrCodeUrl: str(raw.qrCodeUrl),
  };
}

function AssetPreview({ url, label }: { url: string; label: string }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        className="max-h-16 max-w-[160px] rounded border bg-white object-contain p-1"
      />
    </a>
  );
}

function AdminSystemSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<AssetType | null>(null);
  const [brand, setBrand] = useState<BrandSettings>(EMPTY_BRAND);
  const [bank, setBank] = useState<BankSettings>(EMPTY_BANK);
  const fileRefs = {
    logo: useRef<HTMLInputElement>(null),
    bankQr: useRef<HTMLInputElement>(null),
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-settings");
      const json = (await res.json()) as {
        success?: boolean;
        data?: { brand?: Record<string, unknown>; bank?: Record<string, unknown> };
        message?: string;
      };
      if (!res.ok) throw new Error(json.message || "Lỗi tải cài đặt");
      setBrand(mapBrand(json.data?.brand));
      setBank(mapBank(json.data?.bank));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải cài đặt");
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
      const res = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, bank }),
      });
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok) throw new Error(json.message || "Lưu thất bại");
      toast.success("Đã lưu cài đặt hệ thống");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAsset(assetType: AssetType, file: File) {
    setUploading(assetType);
    try {
      const fd = new FormData();
      fd.set("assetType", assetType);
      fd.set("file", file);

      const res = await fetch("/api/admin/system-settings/upload-asset", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { url?: string };
        message?: string;
      };
      if (!res.ok) throw new Error(json.message || "Upload thất bại");

      const url = json.data?.url || "";
      if (assetType === "bankQr") {
        setBank((prev) => ({ ...prev, qrCodeUrl: url }));
      } else {
        setBrand((prev) => ({ ...prev, logoUrl: url }));
      }
      toast.success(`Đã upload ${ASSET_LABELS[assetType]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setUploading(null);
    }
  }

  function pickAsset(assetType: AssetType) {
    fileRefs[assetType].current?.click();
  }

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Đang tải cài đặt…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Cài đặt hệ thống</h1>
          <p className="text-sm text-slate-600">
            Brand & thông tin ngân hàng — hiển thị website và thông tin chuyển khoản khi tạo đơn.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-bold">Thương hiệu</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Tên thương hiệu</span>
            <input className={inputClass} value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Email hỗ trợ</span>
            <input className={inputClass} type="email" value={brand.supportEmail} onChange={(e) => setBrand({ ...brand, supportEmail: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Hotline</span>
            <input className={inputClass} value={brand.supportPhone} onChange={(e) => setBrand({ ...brand, supportPhone: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Website</span>
            <input className={inputClass} value={brand.websiteUrl} onChange={(e) => setBrand({ ...brand, websiteUrl: e.target.value })} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-semibold">Địa chỉ công ty</span>
            <input className={inputClass} value={brand.companyAddress} onChange={(e) => setBrand({ ...brand, companyAddress: e.target.value })} />
          </label>
        </div>

        <div className="rounded-xl border border-slate-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Logo</span>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-slate-50"
              disabled={uploading === "logo"}
              onClick={() => pickAsset("logo")}
            >
              {uploading === "logo" ? "Đang upload…" : "Upload"}
            </button>
          </div>
          <input
            ref={fileRefs.logo}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAsset("logo", file);
              e.target.value = "";
            }}
          />
          <AssetPreview url={brand.logoUrl} label="Logo" />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-bold">Ngân hàng công ty (bank)</h2>
        <p className="text-xs text-slate-500">
          Thông tin này được BE dùng khi tạo đơn — khách chuyển khoản theo STK bên dưới.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Tên ngân hàng</span>
            <input className={inputClass} value={bank.name} onChange={(e) => setBank({ ...bank, name: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Chi nhánh</span>
            <input className={inputClass} value={bank.branch} onChange={(e) => setBank({ ...bank, branch: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Chủ tài khoản</span>
            <input className={inputClass} value={bank.accountName} onChange={(e) => setBank({ ...bank, accountName: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Số tài khoản</span>
            <input className={inputClass} value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
          </label>
        </div>

        <div className="rounded-xl border border-slate-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">QR chuyển khoản</span>
            <button
              type="button"
              className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-slate-50"
              disabled={uploading === "bankQr"}
              onClick={() => pickAsset("bankQr")}
            >
              {uploading === "bankQr" ? "Đang upload…" : "Upload QR"}
            </button>
          </div>
          <input
            ref={fileRefs.bankQr}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAsset("bankQr", file);
              e.target.value = "";
            }}
          />
          <AssetPreview url={bank.qrCodeUrl} label="QR ngân hàng" />
        </div>
      </div>
    </div>
  );
}

export default function AdminSystemSettingsPage() {
  return (
    <AdminOnlyGate>
      <AdminSystemSettingsForm />
    </AdminOnlyGate>
  );
}
