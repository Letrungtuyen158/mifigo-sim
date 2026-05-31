"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/don-hang", label: "Đơn hàng" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/nhom-khach", label: "Nhóm khách" },
  { href: "/admin/quoc-gia", label: "Quốc gia" },
  { href: "/admin/nha-cung-cap", label: "Nhà cung cấp" },
  { href: "/admin/goi-he-thong", label: "Gói hệ thống" },
  { href: "/admin/goi-cuoc", label: "Giá nhập NCC" },
  { href: "/admin/gia-ban", label: "Giá bán kênh" },
  { href: "/admin/so-sanh", label: "So sánh NCC" },
  { href: "/admin/kho-sim", label: "Kho SIM" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/esim-vn", label: "eSIM VN" },
  { href: "/admin/nhat-ky", label: "Nhật ký" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, "exact" in item && item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#1d6be8] text-white shadow-sm shadow-[#1d6be8]/25"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
      >
        ← Về website
      </Link>
    </nav>
  );
}
