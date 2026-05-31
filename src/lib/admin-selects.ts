import { mapSystemPackageRow } from "@/lib/api/mappers";
import { docId } from "@/lib/admin-utils";
import { ADMIN_LIST_LIMIT, fetchAdminListItems, fetchAdminPaginated } from "@/lib/admin-list";

export type SelectOption = { id: string; label: string };

export async function fetchCountrySelectOptions(limit = ADMIN_LIST_LIMIT): Promise<SelectOption[]> {
  const rows = await fetchAdminListItems<Record<string, unknown>>("/api/admin/countries", limit);
  return rows.map((c) => ({
    id: docId(c),
    label: `${String(c.nameVi || c.name || c.code)} (${String(c.code || "")})`,
  }));
}

export async function fetchCustomerGroupSelectOptions(limit = ADMIN_LIST_LIMIT): Promise<SelectOption[]> {
  const rows = await fetchAdminListItems<Record<string, unknown>>(
    "/api/admin/customer-groups",
    limit
  );
  return rows.map((g) => ({
    id: docId(g),
    label: `${String(g.name || "Nhóm")} · ${String(g.code || "")}`,
  }));
}

export async function fetchPackageSelectOptions(limit = ADMIN_LIST_LIMIT): Promise<SelectOption[]> {
  const page = await fetchAdminPaginated<Record<string, unknown>>(
    "/api/admin/packages",
    1,
    limit
  );
  return page.items.map((item) => {
    const row = mapSystemPackageRow(item);
    return { id: row.id, label: row.name };
  });
}
