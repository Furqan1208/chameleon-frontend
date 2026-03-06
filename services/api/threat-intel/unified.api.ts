import { BaseApi } from "../base.api";

export class UnifiedThreatApi extends BaseApi {
  /**
   * Auto-detect indicator type and fan out to all relevant services in parallel.
   * Returns {
   *   input, input_type,
   *   results: { virustotal, malwarebazaar, alienvault, abuseipdb,
   *              threatfox, filescan, hybrid_analysis },
   *   summary
   * }
   */
  async search(indicator: string) {
    const result = await this.request("/threat-intel/unified/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator }),
    });
    return result.data;
  }

  /** Detect indicator type: ip | domain | url | hash | tag */
  async detectType(indicator: string): Promise<string> {
    const result = await this.request(
      `/threat-intel/unified/detect-type?indicator=${encodeURIComponent(indicator)}`,
    );
    return result.type;
  }
}

export const unifiedThreatApi = new UnifiedThreatApi();
