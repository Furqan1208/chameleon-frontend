import { BaseApi } from "../base.api";

export class AlienVaultApi extends BaseApi {
  async scan(request: {
    indicator: string;
    type: "ip" | "domain" | "url" | "hash";
  }) {
    const result = await this.request("/threat-intel/alienvault/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return result.data;
  }
}

export const alienVaultApi = new AlienVaultApi();
