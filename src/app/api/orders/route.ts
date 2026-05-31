import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/auth-token";
import { apiRequest, toNextError } from "@/lib/api/client";
import { decodeJwtPayload } from "@/lib/api/auth-token";
import { mapOrderFromApi } from "@/lib/api/mappers";
import { getSessionUser, isCustomerRole } from "@/lib/auth";

interface PaginatedOrders {
  items: Record<string, unknown>[];
  total: number;
}

interface OrderDetailResponse {
  order: Record<string, unknown>;
  items: Record<string, unknown>[];
  payment?: Record<string, unknown> | null;
}

interface CreateOrderResponse {
  order: Record<string, unknown>;
  items: Record<string, unknown>[];
  payment?: Record<string, unknown> | null;
}

export async function GET() {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ success: true, data: [] });
    }

    const payload = decodeJwtPayload(token);
    const isAdmin = payload?.role === "admin" || payload?.role === "staff";
    const path = isAdmin
      ? "/admin/orders?limit=100"
      : "/customer/orders?limit=100";

    const data = await apiRequest<PaginatedOrders>(path, { token });
    const orders = await Promise.all(
      (data.items || []).map(async (order) => {
        try {
          const detail = await apiRequest<OrderDetailResponse>(
            `${isAdmin ? "/admin" : "/customer"}/orders/${String(order._id || order.id)}`,
            { token }
          );
          return mapOrderFromApi(detail.order, detail.items, detail.payment);
        } catch {
          return mapOrderFromApi(order);
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể tải đơn hàng");
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const token = await getAccessToken();
    if (!token || !user) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để đặt hàng." },
        { status: 401 }
      );
    }
    if (!isCustomerRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản nhân viên/admin không đặt hàng trên website.",
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      paymentNote?: string;
      items?: { packageId: string; quantity: number }[];
    };

    const customerName = body.customerName?.trim();
    const customerPhone = body.customerPhone?.trim();
    const customerEmail = body.customerEmail?.trim();
    const itemsInput = body.items ?? [];

    if (!customerName || !customerPhone || !customerEmail || itemsInput.length === 0) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin đặt hàng." },
        { status: 400 }
      );
    }

    const data = await apiRequest<CreateOrderResponse>("/customer/orders", {
      method: "POST",
      token,
      body: JSON.stringify({
        customer: {
          fullName: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        note: body.paymentNote?.trim(),
        items: itemsInput.map((item) => ({
          packageId: item.packageId,
          quantity: Math.max(1, item.quantity || 1),
        })),
        paymentMethod: "bank_transfer",
      }),
    });

    const order = mapOrderFromApi(data.order, data.items, data.payment);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const { status, message } = toNextError(error, "Đặt hàng thất bại");
    return NextResponse.json({ success: false, message }, { status });
  }
}
