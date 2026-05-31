import { NextResponse } from "next/server";
import { apiRequestRaw, toNextError } from "@/lib/api/client";
import { requireAdmin } from "@/lib/api/require-admin";
import { IMPORT_TEMPLATE_TYPES } from "@/lib/admin-import-templates";

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ templateType: string }> }
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { templateType } = await ctx.params;
  if (!IMPORT_TEMPLATE_TYPES.includes(templateType as (typeof IMPORT_TEMPLATE_TYPES)[number])) {
    return NextResponse.json(
      {
        success: false,
        message:
          "templateType không hợp lệ. Dùng: supplier-prices | sim-inventory-esim | sim-inventory-physical-sim",
      },
      { status: 400 }
    );
  }

  try {
    const res = await apiRequestRaw(`/admin/import/templates/${templateType}`, {
      token: auth.token,
      headers: { Accept: XLSX_TYPE },
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = (await res.json()) as { message?: string | string[] };
        const message = Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message || "Tải file mẫu thất bại";
        return NextResponse.json({ success: false, message }, { status: res.status });
      }
      return NextResponse.json(
        { success: false, message: res.statusText || "Tải file mẫu thất bại" },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    const disposition =
      res.headers.get("content-disposition") ||
      `attachment; filename="${templateType}-template.xlsx"`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": XLSX_TYPE,
        "Content-Disposition": disposition,
      },
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Tải file mẫu thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
