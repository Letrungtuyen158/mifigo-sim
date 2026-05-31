import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import { mapVnEsimFromApi } from "@/lib/api/mappers";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    const token = await getAccessToken();
    if (!user || !token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = user.role === "admin";
    const path = isAdmin
      ? "/admin/sim-inventory?limit=200"
      : "/customer/orders?limit=50";

    if (isAdmin) {
      const data = await apiRequest<{ items: Record<string, unknown>[] }>(path, {
        token,
      });
      const esims = (data.items || []).map(mapVnEsimFromApi);
      return NextResponse.json({
        success: true,
        data: esims.map((e) => ({
          ...e,
          canExport: true,
        })),
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể tải eSIM");
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const token = await getAccessToken();
    if (!user || user.role !== "admin" || !token) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn file Excel/CSV." },
        { status: 400 }
      );
    }

    const upload = new FormData();
    upload.set("file", file);
    upload.set("simType", "esim");

    const result = await apiRequest<{ importedCount?: number; successCount?: number }>(
      "/admin/import/sim-inventory",
      {
        method: "POST",
        token,
        body: upload,
      }
    );

    return NextResponse.json({
      success: true,
      imported: result.importedCount ?? result.successCount ?? 0,
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Import thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
