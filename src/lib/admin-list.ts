import { mongoIdString } from "@/lib/admin-utils";

/** Pagination admin: page/limit mặc định 10 (FE không gửi limit > 10). */
export const ADMIN_LIST_LIMIT = 10;

export interface AdminPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildAdminListQuery(
  page: number,
  limit = ADMIN_LIST_LIMIT,
  extra?: Record<string, string | number | undefined>
) {
  const params = new URLSearchParams({
    page: String(Math.max(1, page)),
    limit: String(Math.min(ADMIN_LIST_LIMIT, Math.max(1, limit))),
  });
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === "") continue;
      const serialized =
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : mongoIdString(value);
      if (serialized && serialized !== "[object Object]") {
        params.set(key, serialized);
      }
    }
  }
  return params.toString();
}

/** Query string không có page/limit — dùng cho detail, best-supplier, v.v. */
export function buildOptionalQuery(
  extra?: Record<string, string | number | undefined>
) {
  const params = new URLSearchParams();
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === "") continue;
      const serialized =
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : mongoIdString(value);
      if (serialized && serialized !== "[object Object]") {
        params.set(key, serialized);
      }
    }
  }
  return params.toString();
}

export function normalizePaginated<T>(data: unknown, page: number, limit: number): AdminPaginated<T> {
  if (Array.isArray(data)) {
    const total = data.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    return {
      items: data.slice(start, start + limit) as T[],
      total,
      page,
      limit,
      totalPages,
    };
  }
  const p = data as Record<string, unknown>;
  const items = (p.items as T[] | undefined) ?? [];
  return {
    items,
    total: Number(p.total ?? items.length),
    page: Number(p.page ?? page),
    limit: Number(p.limit ?? limit),
    totalPages: Number(p.totalPages ?? 1),
  };
}

export async function fetchAdminPaginated<T>(
  apiPath: string,
  page: number,
  limit = ADMIN_LIST_LIMIT,
  extra?: Record<string, string | number | undefined>
): Promise<AdminPaginated<T>> {
  const qs = buildAdminListQuery(page, limit, extra);
  const res = await fetch(`${apiPath}?${qs}`);
  const json = (await res.json()) as { success?: boolean; data?: unknown; message?: string };
  if (!res.ok) {
    throw new Error(typeof json.message === "string" ? json.message : "Lỗi tải dữ liệu");
  }
  return normalizePaginated<T>(json.data, page, limit);
}

/** Lấy mảng `items` từ response paginated hoặc legacy array */
export function paginatedItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const p = data as Record<string, unknown> | null;
  if (!p) return [];
  return (p.items as T[] | undefined) ?? [];
}

/** Một trang lớn (dropdown, v.v.) — tối đa limit BE */
export async function fetchAdminListItems<T>(
  apiPath: string,
  limit = ADMIN_LIST_LIMIT
): Promise<T[]> {
  const data = await fetchAdminPaginated<T>(apiPath, 1, limit);
  return data.items;
}
