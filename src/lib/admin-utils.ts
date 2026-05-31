/** Trích ObjectId hex từ string, populate doc, hoặc extended JSON `{ $oid }`. */
export function mongoIdString(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "[object Object]" ? "" : trimmed;
  }
  if (typeof value === "number") return String(value);
  if (typeof value !== "object") return "";

  const doc = value as Record<string, unknown>;
  if (typeof doc.$oid === "string") return doc.$oid;

  if (doc._id != null) {
    const nested = mongoIdString(doc._id);
    if (nested) return nested;
  }
  if (doc.id != null) {
    const nested = mongoIdString(doc.id);
    if (nested) return nested;
  }

  const toString = (doc as { toString?: () => string }).toString;
  if (typeof toString === "function") {
    const s = toString.call(doc);
    if (s && !s.startsWith("[object ")) return s;
  }
  return "";
}

export function docId(doc: Record<string, unknown>): string {
  return mongoIdString(doc._id) || mongoIdString(doc.id);
}

/** ObjectId hoặc document populate từ MongoDB */
export function refId(value: unknown): string {
  return mongoIdString(value);
}

export function isMongoId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
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
