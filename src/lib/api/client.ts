import { getApiBaseUrl } from "./config";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  statusCode?: number;
  message: string | string[];
  timestamp?: string;
}

export class ApiRequestError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError) {
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message;
    super(msg);
    this.status = status;
    this.body = body;
  }
}

function normalizeMessage(message: string | string[] | undefined, fallback: string) {
  if (!message) return fallback;
  return Array.isArray(message) ? message.join(", ") : message;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? ((await res.json()) as ApiSuccess<T> | ApiError)
    : null;

  if (!res.ok) {
    const errBody: ApiError = payload && "message" in payload
      ? (payload as ApiError)
      : {
          success: false,
          message: normalizeMessage(undefined, res.statusText || "Request failed"),
        };
    throw new ApiRequestError(res.status, errBody);
  }

  if (payload && "success" in payload && payload.success === true) {
    return payload.data;
  }

  return payload as T;
}

export async function apiRequestRaw(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<Response> {
  const { token, headers, ...rest } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  return fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
}

export function toNextError(error: unknown, fallback = "Có lỗi xảy ra") {
  if (error instanceof ApiRequestError) {
    const message = Array.isArray(error.body.message)
      ? error.body.message.join(", ")
      : error.body.message;
    return { status: error.status, message: message || fallback };
  }
  if (error instanceof Error) {
    return { status: 500, message: error.message || fallback };
  }
  return { status: 500, message: fallback };
}
