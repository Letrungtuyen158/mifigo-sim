import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Tổng quan" },
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
  { href: "/admin/trang", label: "Trang CMS" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/nhat-ky", label: "Nhật ký" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/dang-nhap");

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b bg-white">
        <div className="container-page flex items-center justify-between py-3">
          <div className="font-black text-[#1d6be8]">Mifigo SIM Admin</div>
          <div className="text-sm text-slate-600">{user.name}</div>
        </div>
      </div>
      <div className="container-page grid gap-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="card max-h-[calc(100vh-120px)] overflow-y-auto p-3">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/" className="mt-2 rounded-lg px-3 py-2 text-sm text-slate-500">
              ← Về website
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
