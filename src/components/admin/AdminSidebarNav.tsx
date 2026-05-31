"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsAdmin } from "@/contexts/AdminRoleContext";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  adminOnly?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Vận hành",
    items: [
      { href: "/admin", label: "Tổng quan", exact: true },
      { href: "/admin/don-hang", label: "Đơn hàng" },
    ],
  },
  {
    title: "SIM & gói cước",
    items: [
      { href: "/admin/quoc-gia", label: "Quốc gia" },
      { href: "/admin/goi-he-thong", label: "Gói cước" },
      { href: "/admin/gia-ban", label: "Giá bán" },
      { href: "/admin/goi-cuoc", label: "Giá vốn NCC" },
      { href: "/admin/so-sanh", label: "So sánh NCC" },
      { href: "/admin/nha-cung-cap", label: "Nhà cung cấp" },
      { href: "/admin/kho-sim", label: "Kho SIM" },
      { href: "/admin/import", label: "Import", adminOnly: true },
    ],
  },
  {
    title: "Người dùng",
    items: [
      { href: "/admin/users", label: "Người dùng" },
      { href: "/admin/nhom-khach", label: "Nhóm khách", adminOnly: true },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/cai-dat", label: "Cài đặt", adminOnly: true },
      { href: "/admin/nhat-ky", label: "Nhật ký", adminOnly: true },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function filterSections(sections: NavSection[], isAdmin: boolean): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0);
}

function NavLink({
  item,
  pathname,
  horizontal,
}: {
  item: NavItem;
  pathname: string;
  horizontal: boolean;
}) {
  const active = isActive(pathname, item.href, item.exact);
  return (
    <Link
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
}

export default function AdminSidebarNav({
  layout = "vertical",
}: {
  layout?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const horizontal = layout === "horizontal";
  const sections = filterSections(NAV_SECTIONS, isAdmin);

  return (
    <nav
      className={
        horizontal
          ? "flex w-max min-w-full items-center gap-2 pb-0.5"
          : "flex flex-col"
      }
    >
      {sections.map((section, sectionIndex) => (
        <div
          key={section.title}
          className={horizontal ? "flex shrink-0 items-center gap-2" : undefined}
        >
          {sectionIndex > 0 ? (
            horizontal ? (
              <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200" aria-hidden />
            ) : (
              <hr className="my-2 border-slate-200" />
            )
          ) : null}

          {!horizontal ? (
            <p className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
          ) : (
            <span className="shrink-0 px-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {section.title}
            </span>
          )}

          <div className={horizontal ? "flex gap-1" : "flex flex-col gap-0.5"}>
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                horizontal={horizontal}
              />
            ))}
          </div>
        </div>
      ))}

      {horizontal ? (
        <span className="mx-0.5 h-6 w-px shrink-0 bg-slate-200" aria-hidden />
      ) : (
        <hr className="my-2 border-slate-200" />
      )}

      <Link
        href="/"
        className={`rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 ${
          horizontal ? "shrink-0 whitespace-nowrap" : ""
        }`}
      >
        ← Về website
      </Link>
    </nav>
  );
}
