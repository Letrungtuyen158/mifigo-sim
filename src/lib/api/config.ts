export function getApiBaseUrl(): string {
  const url =
    process.env.MIFIGO_API_URL ||
    process.env.NEXT_PUBLIC_MIFIGO_API_URL ||
    "http://localhost:3000/api";
  return url.replace(/\/$/, "");
}
