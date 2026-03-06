import { BaseApi } from "../base.api";

export class UserApi extends BaseApi {
  async updateProfile(data: { name?: string; profile_picture?: string }) {
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
