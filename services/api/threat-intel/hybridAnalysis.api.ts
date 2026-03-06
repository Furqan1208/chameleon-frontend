import { BaseApi } from "../base.api";

interface HAScanRequest {
  indicator: string;
  type?: "hash";
  include_summary?: boolean;
}

export class HybridAnalysisApi extends BaseApi {
  /**
   * Look up a hash (MD5 / SHA1 / SHA256 / SHA512) in Hybrid Analysis.
   * Returns a full HAAnalysisResult including behavioral data.
   */
  async scan(request: HAScanRequest) {
    const result = await this.request("/threat-intel/hybrid-analysis/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "hash", include_summary: true, ...request }),
    });
    return result.data;
  }

  /** Convenience GET: hash lookup with optional summary. */
  async lookupHash(hash: string, includeSummary = true) {
    const qs = `?include_summary=${includeSummary}`;
    const result = await this.request(
      `/threat-intel/hybrid-analysis/hash/${hash}${qs}`,
    );
    return result.data;
  }

  /** Fetch the detonation threat feed. */
  async getThreatFeed(limit = 50) {
    const result = await this.request(
      `/threat-intel/hybrid-analysis/feed?limit=${limit}`,
    );
    return result.data;
  }

  /** Fetch the quick-scan feed. */
  async getQuickScanFeed(limit = 50) {
    const result = await this.request(
      `/threat-intel/hybrid-analysis/feed/quick-scan?limit=${limit}`,
    );
    return result.data;
  }
}

export const hybridAnalysisApi = new HybridAnalysisApi();
