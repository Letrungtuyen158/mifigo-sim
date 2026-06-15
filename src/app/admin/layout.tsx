import { redirect } from "next/navigation";
import { canAccessAdminPanel } from "@/lib/roles";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !canAccessAdminPanel(user.role)) redirect("/dang-nhap");

  return (
    <AdminRoleProvider role={user.role}>
    <div className="admin-shell min-h-screen overflow-x-hidden bg-slate-100 pb-20 lg:pb-0">
      <div className="border-b bg-white">
        <div className="container-page flex min-w-0 items-center justify-between gap-3 py-3">
          <div className="truncate font-black text-[#1d6be8]">Mifigo SIM Admin</div>
          <div className="max-w-[45%] truncate text-right text-sm text-slate-600">
            {user.name}
          </div>
        </div>
      </div>

      <div className="container-page min-w-0 py-4 sm:py-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
        <div className="mb-4 min-w-0 lg:hidden">
          <AdminMobileNav />
        </div>

        <aside className="card sticky top-3 hidden max-h-[calc(100vh-88px)] overflow-y-auto p-3 lg:block">
          <AdminSidebarNav layout="vertical" />
        </aside>

        <main className="admin-main min-w-0 w-full max-w-full">{children}</main>
      </div>
    </div>
    </AdminRoleProvider>
  );
}
