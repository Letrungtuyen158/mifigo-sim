import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/so-sanh", label: "So sánh NCC" },
  { href: "/admin/goi-cuoc", label: "Gói cước" },
  { href: "/admin/gia-ban", label: "Giá bán kênh" },
  { href: "/admin/don-hang", label: "Đơn hàng" },
  { href: "/admin/esim-vn", label: "eSIM VN import" },
  { href: "/admin/nha-cung-cap", label: "Nhà cung cấp" },
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
        <aside className="card h-fit p-3">
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
