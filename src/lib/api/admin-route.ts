import { NextRequest, NextResponse } from "next/server";
import { apiRequest, toNextError } from "./client";
import { requireAdmin } from "./require-admin";

export async function adminGet(path: string, req?: NextRequest, fallback = "Lỗi tải dữ liệu") {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const qs = req?.nextUrl.searchParams.toString();
  const url = qs ? `${path}?${qs}` : path;
  try {
    const data = await apiRequest(url, { token: auth.token });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { status, message } = toNextError(error, fallback);
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function adminPost(
  path: string,
  body: unknown,
  fallback = "Tạo thất bại"
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const data = await apiRequest(path, {
      method: "POST",
      token: auth.token,
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { status, message } = toNextError(error, fallback);
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function adminPut(
  path: string,
  body: unknown,
  fallback = "Cập nhật thất bại"
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const data = await apiRequest(path, {
      method: "PUT",
      token: auth.token,
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { status, message } = toNextError(error, fallback);
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function adminPostForm(
  path: string,
  formData: FormData,
  fallback = "Upload thất bại"
) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  try {
    const data = await apiRequest(path, {
      method: "POST",
      token: auth.token,
      body: formData,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { status, message } = toNextError(error, fallback);
    return NextResponse.json({ success: false, message }, { status });
  }
}
