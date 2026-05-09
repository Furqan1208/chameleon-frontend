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
}

export const userApi = new UserApi();
