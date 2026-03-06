import { BaseApi, setAuthCookie } from "../base.api";

export class AuthApi extends BaseApi {
  async googleAuth(idToken: string) {
    const response = await fetch(`${this.baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Authentication failed" }));
      throw new Error(error.detail || "Authentication failed");
    }

    const data = await response.json();

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setAuthCookie(data.access_token);

    return data;
  }

  async getMe() {
    return this.request("/auth/me");
  }

  logout(): void {
    this.clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredUser() {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export const authApi = new AuthApi();
