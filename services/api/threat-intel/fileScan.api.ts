import { BaseApi } from "../base.api";

interface FileScanUploadOptions {
  description?: string;
  osint?: boolean;
  extended_osint?: boolean;
  resolve_domains?: boolean;
  whois?: boolean;
}

interface FileScanUrlRequest {
  url: string;
  description?: string;
  tags?: string[];
  osint?: boolean;
  extended_osint?: boolean;
  url_analysis?: boolean;
  resolve_domains?: boolean;
  whois?: boolean;
}

interface FileScanSimilarityRequest {
  hash: string;
  min_similarity?: number;
  verdict?: string;
  tags?: string[];
}

export class FileScanApi extends BaseApi {
  /**
   * Upload a file for sandbox analysis.
   * Returns { flow_id, priority } — use flow_id to poll status.
   */
  async uploadFile(file: File, options?: FileScanUploadOptions) {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams();
    if (options?.description) params.set("description", options.description);
    if (options?.osint != null) params.set("osint", String(options.osint));
    if (options?.extended_osint != null)
      params.set("extended_osint", String(options.extended_osint));
    if (options?.resolve_domains != null)
      params.set("resolve_domains", String(options.resolve_domains));
    if (options?.whois != null) params.set("whois", String(options.whois));

    const qs = params.toString() ? `?${params.toString()}` : "";
    const result = await this.request(`/threat-intel/filescan/upload${qs}`, {
      method: "POST",
      body: formData,
    });
    return result.data;
  }

  /**
   * Submit a URL for FileScan analysis.
   * Returns { flow_id, priority } — poll with getStatus().
   */
  async scanUrl(request: FileScanUrlRequest) {
    const result = await this.request("/threat-intel/filescan/scan-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return result.data;
  }

  /**
   * Poll scan status. When state === 'finished', call getFullAnalysis().
   */
  async getStatus(flowId: string, filters?: string[]) {
    const qs = filters
      ? `?filters=${encodeURIComponent(filters.join(","))}`
      : "";
    const result = await this.request(
      `/threat-intel/filescan/status/${flowId}${qs}`,
    );
    return result.data;
  }

  /**
   * Fetch a specific report section by report_id + file_hash.
   */
  async getReport(reportId: string, fileHash: string, filters?: string[]) {
    const qs = filters
      ? `?filters=${encodeURIComponent(filters.join(","))}`
      : "";
    const result = await this.request(
      `/threat-intel/filescan/report/${reportId}/${fileHash}${qs}`,
    );
    return result.data;
  }

  /**
   * Get a complete normalised AnalysisResult for a finished scan.
   * Throws HTTP 425 if the scan is not yet complete.
   */
  async getFullAnalysis(flowId: string) {
    const result = await this.request(
      `/threat-intel/filescan/analysis/${flowId}`,
    );
    return result.data;
  }

  /**
   * Find files similar to the given hash.
   * Returns { most_similar, most_recent }.
   */
  async similaritySearch(request: FileScanSimilarityRequest) {
    const result = await this.request("/threat-intel/filescan/similarity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ min_similarity: 0, ...request }),
    });
    return result.data;
  }
}

export const fileScanApi = new FileScanApi();
