export function docId(doc: Record<string, unknown>): string {
  const id = doc._id;
  if (!id) return String(doc.id || "");
  return typeof id === "string" ? id : String(id);
}

/** ObjectId hoặc document populate từ MongoDB */
export function refId(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const doc = value as Record<string, unknown>;
    if (doc._id != null) return docId(doc);
    if (doc.id != null) return String(doc.id);
  }
  return "";
}

export function refName(value: unknown): string {
  if (value != null && typeof value === "object" && "name" in value) {
    const name = (value as Record<string, unknown>).name;
    if (name) return String(name);
  }
  return "";
}

export const inputClass =
  "w-full min-w-0 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1d6be8]";

export const adminTableWrapClass = "admin-table-scroll";
export const adminPageHeaderClass = "admin-page-header";
export const adminBreakTextClass = "admin-break-text";
