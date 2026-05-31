"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PasswordInput from "@/components/ui/PasswordInput";
import { useTranslation } from "@/contexts/LanguageContext";

type AuthMode = "login" | "register" | "forgot";

export default function DangNhapPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"agent" | "customer">("agent");

  const TABS = useMemo(
    () => [
      { id: "login" as const, label: t("auth.login") },
      { id: "register" as const, label: t("auth.register") },
    ],
    [t]
  );

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
      if (!res.ok) throw new Error(data.message || t("auth.login"));
      toast.success(t("auth.loginSuccess"));
      if (data.user.role === "admin") router.push("/admin");
      else router.push("/tra-cuu");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.login"));
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
      if (!res.ok) throw new Error(data.message || t("auth.register"));
      toast.success(data.message || t("auth.register"));
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.register"));
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
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("auth.forgot"));
      toast.success(data.message || t("auth.forgot"));
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.forgot"));
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
            {t("auth.backLogin")}
          </button>
        )}

        {mode === "login" && (
          <form onSubmit={(e) => void handleLogin(e)}>
            <h1 className="text-2xl font-black">{t("auth.login")}</h1>
            <p className="mt-2 text-sm text-slate-600">{t("auth.loginHint")}</p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder={t("auth.email")}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{t("auth.password")}</span>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs font-semibold text-[#1d6be8] hover:underline"
                  >
                    {t("auth.forgotLink")}
                  </button>
                </div>
                <PasswordInput
                  placeholder={t("auth.password")}
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={(e) => void handleRegister(e)}>
            <h1 className="text-2xl font-black">{t("auth.register")}</h1>
            <p className="mt-2 text-sm text-slate-600">{t("auth.registerHint")}</p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder={t("auth.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder={t("auth.email")}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder={t("auth.phone")}
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
                <option value="agent">{t("auth.roleAgent")}</option>
                <option value="customer">{t("auth.roleCustomer")}</option>
              </select>
              <PasswordInput
                placeholder={t("auth.passwordMin")}
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
              />
              <PasswordInput
                placeholder={t("auth.confirmPassword")}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? t("auth.registering") : t("auth.register")}
            </button>
            <p className="mt-3 text-center text-sm text-slate-600">
              {t("auth.hasAccount")}{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-[#1d6be8] hover:underline"
              >
                {t("auth.login")}
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={(e) => void handleForgot(e)}>
            <h1 className="text-2xl font-black">{t("auth.forgot")}</h1>
            <p className="mt-2 text-sm text-slate-600">{t("auth.forgotHint")}</p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#1d6be8] focus:ring-2 focus:ring-[#1d6be8]/20"
                placeholder={t("auth.email")}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? t("auth.processing") : t("auth.resetPassword")}
            </button>
          </form>
        )}

        {mode === "login" && (
          <Link href="/tra-cuu" className="mt-4 block text-center text-sm text-slate-500">
            {t("common.continueGuest")}
          </Link>
        )}
      </div>
    </div>
  );
}
