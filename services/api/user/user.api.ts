import { BaseApi } from "../base.api";
import { UiPreferences } from "@/lib/types/preferences";

export type UserProfileUpdate = {
  name?: string;
  profile_picture?: string;
  role?: string;
  company?: string;
  experience_level?: string;
  primary_focus?: string;
  onboarding_completed?: boolean;
};

export class UserApi extends BaseApi {
  async getCurrentUser() {
    return this.request("/users/me", {
      method: "GET",
    });
  }

  async updateProfile(data: UserProfileUpdate) {
    return this.request("/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    return this.request("/users/me", { method: "DELETE" });
  }

  async getPreferences(): Promise<UiPreferences> {
    return this.request("/users/preferences", {
      method: "GET",
    });
  }

  async updatePreferences(preferences: Partial<UiPreferences>) {
    return this.request("/users/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request("/users/me/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async setPassword(newPassword: string) {
    return this.request("/users/me/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_password: newPassword,
      }),
    });
  }

  async listAllUsersAdmin() {
    return this.request("/users/admin/all", { method: "GET" });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request(`/users/admin/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async adminResetPassword(userId: string, newPassword: string) {
    return this.request("/auth/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, new_password: newPassword }),
    });
  }

  async getUserReports(userId: string, limit = 100, skip = 0) {
    return this.request(`/users/admin/${userId}/reports?limit=${limit}&skip=${skip}`, {
      method: "GET",
    });
  }
}

export const userApi = new UserApi();
