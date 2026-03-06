// services/base.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const AUTH_COOKIE = "access_token";

// ─── Cookie helpers (client-side only) ────────────────────────────────────────

/** Write a secure, SameSite=Strict cookie visible to the middleware. */
export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  // No HttpOnly here — JS must be able to write it from the client.
  // Middleware (Edge Runtime) can read any non-HttpOnly cookie.
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = [
    `${AUTH_COOKIE}=${encodeURIComponent(token)}`,
    `path=/`,
    `max-age=${maxAge}`,
    `SameSite=Strict`,
    // Add `; Secure` when deploying to HTTPS:
    // process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/** Delete the auth cookie by expiring it immediately. */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

/** Read the auth token — prefers cookie (SSR-safe source of truth), falls back to localStorage. */
export function readAuthToken(): string | null {
  if (typeof document === "undefined") return null;

  // Parse cookie jar
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_COOKIE}=`));
  if (match) {
    return decodeURIComponent(match.split("=").slice(1).join("="));
  }

  // Fallback: localStorage (for sessions that pre-date this update)
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
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearSession();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }

    return response.json();
  }
}
