export function docId(doc: Record<string, unknown>): string {
  const id = doc._id;
  if (!id) return String(doc.id || "");
  return typeof id === "string" ? id : String(id);
}

export const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1d6be8]";
