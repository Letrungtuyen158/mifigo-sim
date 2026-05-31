import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/constants";
import { apiRequest, toNextError } from "@/lib/api/client";
import { mapBackendUser } from "@/lib/api/mappers";

interface LoginResponse {
  accessToken: string;
  user: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập email và mật khẩu." },
        { status: 400 }
      );
    }

    const data = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const cookieStore = await cookies();
    cookieStore.set(TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const user = mapBackendUser(data.user);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    const { status, message } = toNextError(error, "Email hoặc mật khẩu không đúng.");
    return NextResponse.json(
      { success: false, message: status === 401 ? "Email hoặc mật khẩu không đúng." : message },
      { status: status === 401 ? 401 : status }
    );
  }
}
