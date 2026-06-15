"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

function findCurrentLabel(pathname: string): string {
  const flat = [
    { href: "/admin", label: "Tổng quan", exact: true },
    { href: "/admin/don-hang", label: "Đơn hàng" },
    { href: "/admin/quoc-gia", label: "Quốc gia" },
    { href: "/admin/goi-he-thong", label: "Gói cước" },
    { href: "/admin/gia-ban", label: "Giá bán" },
    { href: "/admin/goi-cuoc", label: "Giá vốn NCC" },
    { href: "/admin/so-sanh", label: "So sánh NCC" },
    { href: "/admin/nha-cung-cap", label: "Nhà cung cấp" },
    { href: "/admin/kho-sim", label: "Kho SIM" },
    { href: "/admin/import", label: "Import" },
    { href: "/admin/users", label: "Người dùng" },
    { href: "/admin/nhom-khach", label: "Nhóm khách" },
    { href: "/admin/cai-dat", label: "Cài đặt" },
    { href: "/admin/nhat-ky", label: "Nhật ký" },
  ];

  const sorted = [...flat].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  return match?.label ?? "Admin";
}

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentLabel = useMemo(() => findCurrentLabel(pathname), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="card flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Trang hiện tại
          </span>
          <span className="block truncate text-sm font-bold text-slate-900">{currentLabel}</span>
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="card mt-2 max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain p-2">
          <AdminSidebarNav layout="vertical" onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
