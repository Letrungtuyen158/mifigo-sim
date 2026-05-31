import { NextRequest } from "next/server";
import { mapOrderStatusToApi } from "@/lib/api/mappers";
import { adminPut } from "@/lib/api/admin-route";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { status?: string; staffNote?: string };

  return adminPut(
    `/admin/orders/${id}/status`,
    {
      status: mapOrderStatusToApi(body.status),
      staffNote: body.staffNote,
    },
    "Cập nhật trạng thái thất bại"
  );
}
