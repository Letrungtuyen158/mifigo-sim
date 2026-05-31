export function docId(doc: Record<string, unknown>): string {
  const id = doc._id;
  if (!id) return String(doc.id || "");
  return typeof id === "string" ? id : String(id);
}

export const inputClass =
  "w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1d6be8]";

export const adminTableWrapClass = "admin-table-scroll";
export const adminPageHeaderClass = "admin-page-header";
export const adminBreakTextClass = "admin-break-text";
