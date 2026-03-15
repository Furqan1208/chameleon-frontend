import { BaseApi } from "../base.api";

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
}

export const userApi = new UserApi();
