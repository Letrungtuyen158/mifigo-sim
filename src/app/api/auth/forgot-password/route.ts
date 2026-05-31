import { NextResponse } from "next/server";
import { apiRequest, toNextError } from "@/lib/api/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập email." },
        { status: 400 }
      );
    }

    const data = await apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return NextResponse.json({
      success: true,
      message:
        data.message ||
        "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu qua email.",
    });
  } catch (error) {
    const { status, message } = toNextError(error, "Không thể gửi email đặt lại mật khẩu");
    return NextResponse.json({ success: false, message }, { status });
  }
}
