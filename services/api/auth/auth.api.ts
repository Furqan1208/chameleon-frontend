import { BaseApi, setAuthCookie } from "../base.api";

type AuthPayload = {
  access_token?: string
  user?: any
  mfa_required?: boolean
  mfa_token?: string
}

type MfaSetupPayload = {
  secret: string
  otpauth_uri: string
  qr_code_data_url: string
  issuer: string
}

export class AuthApi extends BaseApi {
  private persistSession(data: AuthPayload) {
    if (!data.access_token) return

    localStorage.setItem("access_token", data.access_token)
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    setAuthCookie(data.access_token)
  }

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

    const data: AuthPayload = await response.json();

    this.persistSession(data)

    return data;
  }

  async register(name: string, email: string, username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, username, password }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Registration failed" }));
      throw new Error(error.detail || "Registration failed");
    }

    const data: AuthPayload = await response.json();

    this.persistSession(data)

    return data;
  }

  async login(username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }

    const data: AuthPayload = await response.json();

    this.persistSession(data)

    return data;
  }

  async verifyMfa(mfaToken: string, code: string) {
    const response = await fetch(`${this.baseUrl}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mfa_token: mfaToken, code }),
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "MFA verification failed" }))
      throw new Error(error.detail || "MFA verification failed")
    }

    const data: AuthPayload = await response.json()
    this.persistSession(data)
    return data
  }

  async beginMfaSetup() {
    const response = await this.request("/auth/mfa/setup", {
      method: "POST",
    })

    return response as MfaSetupPayload
  }

  async confirmMfaSetup(code: string) {
    return this.request("/auth/mfa/confirm", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  }

  async disableMfa() {
    return this.request("/auth/mfa/disable", {
      method: "POST",
    })
  }

  async getMe() {
    return this.request("/auth/me");
  }

  logout(): void {
    this.clearSession();
    if (typeof window !== "undefined") window.location.href = "/";
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
