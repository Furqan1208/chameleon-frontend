import { BaseApi } from "../base.api";

export class VirusTotalApi extends BaseApi {
  async scan(request: {
    indicator: string;
    type: "hash" | "ip" | "domain" | "url";
    include_relationships?: boolean;
  }) {
    const result = await this.request("/threat-intel/virustotal/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return result.data;
  }

  async lookupHash(hash: string, includeRelationships = false) {
    const qs = includeRelationships ? "?include_relationships=true" : "";
    const result = await this.request(
      `/threat-intel/virustotal/hash/${hash}${qs}`,
    );
    return result.data;
  }
}

export const virusTotalApi = new VirusTotalApi();
