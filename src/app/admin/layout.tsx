import { redirect } from "next/navigation";
import { isStaffOrAdmin } from "@/lib/api/require-admin";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !isStaffOrAdmin(user.role)) redirect("/dang-nhap");

  return (
    <div className="admin-shell min-h-screen overflow-x-hidden bg-slate-100">
      <div className="border-b bg-white">
        <div className="container-page flex min-w-0 items-center justify-between gap-3 py-3">
          <div className="truncate font-black text-[#1d6be8]">Mifigo SIM Admin</div>
          <div className="max-w-[45%] truncate text-right text-sm text-slate-600">
            {user.name}
          </div>
        </div>
      </div>

      <div className="container-page min-w-0 py-4 sm:py-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
        <div className="admin-table-scroll -mx-1 mb-4 px-1 lg:hidden">
          <div className="card p-2">
            <AdminSidebarNav layout="horizontal" />
          </div>
        </div>

        <aside className="card sticky top-3 hidden max-h-[calc(100vh-88px)] overflow-y-auto p-3 lg:block">
          <AdminSidebarNav layout="vertical" />
        </aside>

        <main className="admin-main min-w-0 w-full max-w-full">{children}</main>
      </div>
    </div>
  );
}
