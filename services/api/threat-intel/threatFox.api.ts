import { BaseApi } from "../base.api";

export class ThreatFoxApi extends BaseApi {
  async search(indicator: string) {
    const result = await this.request("/threat-intel/threatfox/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator }),
    });
    return result.data;
  }

  async getRecentIocs(days = 3, limit = 20) {
    const result = await this.request(
      `/threat-intel/threatfox/recent?days=${days}&limit=${limit}`,
    );
    return result.data;
  }

  async getMalwareList() {
    const result = await this.request("/threat-intel/threatfox/malware-list");
    return result.data;
  }
}

export const threatFoxApi = new ThreatFoxApi();
