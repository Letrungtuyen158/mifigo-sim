"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import PasswordInput from "@/components/ui/PasswordInput";

type AuthMode = "login" | "register" | "forgot";

const TABS: { id: AuthMode; label: string }[] = [
  { id: "login", label: "Đăng nhập" },
  { id: "register", label: "Đăng ký" },
];

export default function DangNhapPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"agent" | "customer">("agent");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
      toast.success("Đăng nhập thành công");
      if (data.user.role === "admin") router.push("/admin");
      else router.push("/tra-cuu");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: registerRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
      toast.success(data.message || "Đăng ký thành công");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể đặt lại mật khẩu");
      toast.success(data.message || "Đã đặt lại mật khẩu");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi quên mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-6">
        {mode !== "forgot" ? (
          <div className="mb-5 flex rounded-full bg-slate-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                  mode === tab.id
                    ? "bg-white text-[#1d6be8] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="mb-4 text-sm font-semibold text-[#1d6be8] hover:underline"
          >
            ← Quay lại đăng nhập
          </button>
        )}

        {mode === "login" && (
          <form onSubmit={(e) => void handleLogin(e)}>
            <h1 className="text-2xl font-black">Đăng nhập</h1>
            <p className="mt-2 text-sm text-slate-600">
              Đại lý/CTV hoặc admin. Demo: admin@mifigo.com / Admin@123456
            </p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Mật khẩu</span>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs font-semibold text-[#1d6be8] hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <PasswordInput
                  placeholder="Mật khẩu"
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={(e) => void handleRegister(e)}>
            <h1 className="text-2xl font-black">Đăng ký tài khoản</h1>
            <p className="mt-2 text-sm text-slate-600">
              Tạo tài khoản đại lý/CTV hoặc khách hàng để xem giá và đặt hàng.
            </p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder="Họ tên *"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder="Email *"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <select
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                value={registerRole}
                onChange={(e) =>
                  setRegisterRole(e.target.value as "agent" | "customer")
                }
              >
                <option value="agent">Đại lý / CTV</option>
                <option value="customer">Khách hàng</option>
              </select>
              <PasswordInput
                placeholder="Mật khẩu * (tối thiểu 6 ký tự)"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
              />
              <PasswordInput
                placeholder="Xác nhận mật khẩu *"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? "Đang đăng ký…" : "Đăng ký"}
            </button>
            <p className="mt-3 text-center text-sm text-slate-600">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-[#1d6be8] hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={(e) => void handleForgot(e)}>
            <h1 className="text-2xl font-black">Quên mật khẩu</h1>
            <p className="mt-2 text-sm text-slate-600">
              Nhập email đã đăng ký và mật khẩu mới. (Giai đoạn sau sẽ gửi mã qua email.)
            </p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder="Email đã đăng ký *"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                placeholder="Mật khẩu mới *"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
              />
              <PasswordInput
                placeholder="Xác nhận mật khẩu mới *"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? "Đang xử lý…" : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        {mode === "login" && (
          <Link href="/tra-cuu" className="mt-4 block text-center text-sm text-slate-500">
            Tiếp tục xem giá lẻ (không đăng nhập)
          </Link>
        )}
      </div>
    </div>
  );
}
