"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsAdmin } from "@/contexts/AdminRoleContext";

const NAV = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/don-hang", label: "Đơn hàng" },
  { href: "/admin/quoc-gia", label: "Quốc gia" },
  { href: "/admin/goi-he-thong", label: "Gói cước" },
  { href: "/admin/gia-ban", label: "Giá bán" },
  { href: "/admin/goi-cuoc", label: "Giá vốn NCC" },
  { href: "/admin/so-sanh", label: "So sánh NCC" },
  { href: "/admin/nha-cung-cap", label: "Nhà cung cấp" },
  { href: "/admin/kho-sim", label: "Kho SIM" },
  { href: "/admin/import", label: "Import", adminOnly: true },
  { href: "/admin/users", label: "Người dùng", adminOnly: true },
  { href: "/admin/nhom-khach", label: "Nhóm khách", adminOnly: true },
  { href: "/admin/trang", label: "Trang CMS", adminOnly: true },
  { href: "/admin/seo", label: "SEO", adminOnly: true },
  { href: "/admin/cai-dat", label: "Cài đặt hệ thống", adminOnly: true },
  { href: "/admin/nhat-ky", label: "Nhật ký", adminOnly: true },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarNav({
  layout = "vertical",
}: {
  layout?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const horizontal = layout === "horizontal";
  const items = NAV.filter((item) => !("adminOnly" in item && item.adminOnly) || isAdmin);

  return (
    <nav
      className={
        horizontal
          ? "flex w-max min-w-full gap-2 pb-0.5"
          : "flex flex-col gap-1"
      }
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href, "exact" in item && item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              horizontal ? "shrink-0 whitespace-nowrap" : ""
            } ${
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
        className={`rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 ${
          horizontal ? "shrink-0 whitespace-nowrap" : "mt-2"
        }`}
      >
        ← Về website
      </Link>
    </nav>
  );
}
