import { BaseApi } from "../base.api";
import type { VTIndicatorType } from "@/lib/types/virustotal.types";

export class VirusTotalApi extends BaseApi {
  async scan(request: {
    indicator: string;
    type: VTIndicatorType;
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
