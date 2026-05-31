import { redirect } from "next/navigation";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import { getSessionUser } from "@/lib/auth";

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
          <AdminSidebarNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
