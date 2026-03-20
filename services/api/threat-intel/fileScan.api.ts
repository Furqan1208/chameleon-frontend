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
    
    // Normalize response
    const data = result.data;
    return {
      flow_id: data.flow_id || data.flowId,
      priority: data.priority
    };
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
    
    // Normalize response
    const data = result.data;
    return {
      flow_id: data.flow_id || data.flowId,
      priority: data.priority
    };
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
    
    const data = result.data;
    
    // Ensure consistent camelCase naming
    return {
      flowId: data.flowId || data.flow_id,
      allFinished: data.allFinished ?? data.all_finished,
      state: data.state,
      scanStartedDate: data.scanStartedDate || data.scan_started_date,
      reports: data.reports,
      ...data
    };
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
    
    const data = result.data;
    console.log('[FileScanApi] getReport raw response:', data);
    
    // The backend returns a structure like { reports: { [reportId]: {...} } }
    // We need to extract and flatten the actual report data
    const reports = data.reports || {};
    const report = reports[reportId] || {};
    
    console.log('[FileScanApi] Extracted report:', report);
    
    // Normalize to match what DetailedReportViewer expects
    const normalized = {
      reportId,
      fileHash,
      file: report.file || data.file || { name: 'Unknown', hash: fileHash, type: 'unknown' },
      verdict: report.finalVerdict || report.verdict || { verdict: 'UNKNOWN', threatLevel: 0, confidence: 0 },
      scanOptions: report.scanOptions || report.scan_options || {},
      scanEngine: report.scanEngine || report.scan_engine,
      created_date: report.created_date || data.created_date,
      yaraMatches: report.yaraMatches || report.yara_matches || [],
      extractedFiles: report.extractedFiles || report.extracted_files || [],
      networkConnections: report.networkConnections || report.network_connections || [],
      extractedUrls: report.extractedUrls || report.extracted_urls || [],
      extractedDomains: report.extractedDomains || report.extracted_domains || [],
      extractedIps: report.extractedIps || report.extracted_ips || [],
      strings: report.strings || [],
      resources: report.resources || [],
      osintResults: report.osintResults || report.osint_results,
      visualization: report.visualization,
      signalGroups: report.allSignalGroups || report.signal_groups || [],
      tags: report.allTags || report.tags || [],
      mitreTechniques: report.mitreTechniques || report.mitre_techniques || [],
      behavioralAnalysis: report.behavioralAnalysis || report.behavioral_analysis,
      peInfo: report.peInfo || report.pe_info,
      imports: report.imports || [],
      exports: report.exports || [],
      sections: report.sections || [],
      taskReference: report.taskReference || report.task_reference,
      subtaskReferences: report.subtaskReferences || report.subtask_references || [],
      raw_detailed_data: report,
      report_url: `https://www.filescan.io/reports/${reportId}/${fileHash}`,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[FileScanApi] Normalized detailed report:', normalized);
    
    return normalized;
  }

  /**
   * Get a complete normalised AnalysisResult for a finished scan.
   * Throws HTTP 425 if the scan is not yet complete.
   */
  async getFullAnalysis(flowId: string) {
    const result = await this.request(
      `/threat-intel/filescan/analysis/${flowId}`,
    );
    
    const data = result.data;
    console.log('[FileScanApi] getFullAnalysis raw response:', data);
    
    // Transform snake_case from backend to camelCase for frontend
    const normalized = {
      flowId: data.flow_id || data.flowId,
      scanId: data.scan_id || data.scanId,
      file: data.file,
      state: data.state,
      verdict: data.verdict,
      interestingScore: data.interesting_score ?? data.interestingScore,
      vtRate: data.vt_rate ?? data.vtRate,
      created_date: data.created_date,
      scanOptions: data.scan_options || data.scanOptions || {},
      report_url: data.report_url,
      scan_url: data.scan_url,
      timestamp: data.timestamp,
      overallState: data.overallState ?? data.overall_state,
      positionInQueue: data.positionInQueue ?? data.position_in_queue,
      filesDownloadFinished: data.filesDownloadFinished ?? data.files_download_finished,
      allScanStepsDone: data.allScanStepsDone ?? data.all_scan_steps_done,
      additionalStepsRunning: data.additionalStepsRunning ?? data.additional_steps_running,
      additionalStepsDone: data.additionalStepsDone ?? data.additional_steps_done,
      defaultOptionsUsed: data.defaultOptionsUsed ?? data.default_options_used,
      peEmulationFileMetadata: data.peEmulationFileMetadata ?? data.pe_emulation_file_metadata,
      scanEngine: data.scanEngine ?? data.scan_engine,
      similaritySearchResults: data.similaritySearchResults ?? data.similarity_search_results,
      latestReport: data.latestReport ?? data.latest_report,
      aiData: data.aiData ?? data.ai_data,
      estimatedTime: data.estimatedTime ?? data.estimated_time,
    };
    
    console.log('[FileScanApi] Normalized result:', normalized);
    console.log('[FileScanApi] scanId:', normalized.scanId);
    console.log('[FileScanApi] file.hash:', normalized.file?.hash);
    
    return normalized;
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
