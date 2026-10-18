import type { FieldIssue } from "@/types";
import { clearToken, getToken } from "./token";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  /** Maps validation `details` to `{ field: message }` (first message per field). */
  get fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    const errors: Record<string, string> = {};
    for (const issue of this.details as FieldIssue[]) {
      if (issue?.path && !errors[issue.path]) errors[issue.path] = issue.message;
    }
    return errors;
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, QueryValue>;
  /** Redirect to /login when an authenticated request returns 401. Default true. */
  redirectOn401?: boolean;
}

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL is not configured");
  }
  const url = new URL(baseUrl.replace(/\/$/, "") + path);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function handleUnauthorized() {
  clearToken();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.replace("/login");
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, redirectOn401 = true } = options;
  const token = getToken();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Unable to reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  let payload: { data?: T; error?: { message?: string; details?: unknown } } | undefined;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    if (response.status === 401 && token && redirectOn401) {
      handleUnauthorized();
    }
    throw new ApiError(
      response.status,
      payload?.error?.message ?? `Request failed (${response.status})`,
      payload?.error?.details,
    );
  }

  return payload?.data as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, QueryValue>) => request<T>(path, { params }),
  post: <T>(path: string, body?: unknown, options?: Pick<RequestOptions, "redirectOn401">) =>
    request<T>(path, { method: "POST", body, ...options }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
