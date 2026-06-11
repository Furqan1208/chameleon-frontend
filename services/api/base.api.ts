// services/base.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const AUTH_COOKIE = "access_token";

// ─── Cookie helpers (client-side only) ────────────────────────────────────────

/** Write a secure cookie visible to the middleware. */
export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const isProduction = process.env.NODE_ENV === "production";
  const cookieParts = [
    `${AUTH_COOKIE}=${encodeURIComponent(token)}`,
    `path=/`,
    `max-age=${maxAge}`,
    `SameSite=Lax`, // Changed from Strict for cross-origin
  ];
  
  // Add Secure flag only in production (HTTPS)
  if (isProduction) {
    cookieParts.push("Secure");
  }
  
  document.cookie = cookieParts.join("; ");
}

/** Delete the auth cookie by expiring it immediately. */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** Read the auth token — prefers cookie, falls back to localStorage. */
export function readAuthToken(): string | null {
  if (typeof document === "undefined") return null;

  // Parse cookie jar
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_COOKIE}=`));
  if (match) {
    return decodeURIComponent(match.split("=").slice(1).join("="));
  }

  // Fallback: localStorage
  return localStorage.getItem("access_token");
}

// ─── Base service ──────────────────────────────────────────────────────────────

export class BaseApi {
  protected baseUrl = API_BASE_URL;

  protected getToken(): string | null {
    if (typeof window === "undefined") return null;
    return readAuthToken();
  }

  protected getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /** Wipes both the cookie and localStorage, then redirects to /login. */
  protected clearSession(): void {
    if (typeof window === "undefined") return;
    clearAuthCookie();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }

  protected async request<T = any>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const hasBody = typeof options.body !== "undefined" && options.body !== null
    const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData
    const headers = {
      ...this.getAuthHeaders(),
      ...(hasBody && !isFormDataBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: "include", // IMPORTANT: Include cookies for auth
    });

    if (response.status === 401) {
      this.clearSession();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const detail = error?.detail
      const message = Array.isArray(detail)
        ? detail
            .map((item) => item?.msg || item?.message || JSON.stringify(item))
            .join("; ")
        : typeof detail === "string"
          ? detail
          : error?.message || `Request failed: ${response.status}`
      throw new Error(message)
    }

    return response.json();
  }
}