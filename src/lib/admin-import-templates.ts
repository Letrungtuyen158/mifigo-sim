/** Khớp BE `ImportTemplateType` — GET /admin/import/templates/:templateType */
export const IMPORT_TEMPLATE_TYPES = [
  "supplier-prices",
  "sim-inventory-esim",
  "sim-inventory-physical-sim",
] as const;

export type ImportTemplateType = (typeof IMPORT_TEMPLATE_TYPES)[number];

export const IMPORT_TEMPLATE_LABELS: Record<ImportTemplateType, string> = {
  "supplier-prices": "Giá vốn NCC",
  "sim-inventory-esim": "Kho eSIM",
  "sim-inventory-physical-sim": "Kho SIM vật lý",
};

export function simTypeToImportTemplate(
  simType: "esim" | "physical_sim"
): ImportTemplateType {
  return simType === "physical_sim"
    ? "sim-inventory-physical-sim"
    : "sim-inventory-esim";
}

function filenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(header);
  return match?.[1]?.trim() || fallback;
}

export async function downloadImportTemplate(templateType: ImportTemplateType): Promise<void> {
  const res = await fetch(`/api/admin/import/templates/${templateType}`);
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = (await res.json()) as { message?: string };
      throw new Error(json.message || "Tải file mẫu thất bại");
    }
    throw new Error("Tải file mẫu thất bại");
  }

  const blob = await res.blob();
  const fallback = `${templateType}.xlsx`;
  const filename = filenameFromDisposition(res.headers.get("content-disposition"), fallback);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
