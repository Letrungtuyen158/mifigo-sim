import { NextResponse } from "next/server";
import { apiRequest, toNextError } from "@/lib/api/client";
import { mapOrderFromApi } from "@/lib/api/mappers";
import { requireStaffOrAdmin } from "@/lib/api/require-admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaffOrAdmin();
    if ("response" in auth) return auth.response;
    const { token } = auth;

    const { id } = await params;
    const result = await apiRequest<{
      order: Record<string, unknown>;
      esimDetails?: Array<Record<string, unknown>>;
    }>(`/admin/orders/${id}/approve-payment`, {
      method: "POST",
      token,
    });

    return NextResponse.json({
      success: true,
      data: {
        order: mapOrderFromApi(result.order),
        esimDetails: result.esimDetails ?? [],
      },
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Duyệt thanh toán thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
