// lib/threat-intel/hybrid-analysis-service.ts
import type { 
  HAIndicatorType, 
  HAAnalysisResult, 
  HAScanRequest,
  HAThreatFeedItem,
  HARateLimitInfo
} from './ha-types';
import { validateHash, getVerdictInfo, extractBehavioralIndicators } from './ha-utils';

export class HybridAnalysisService {
  private apiKey: string;
  private baseURL = '/api/hybrid-analysis';
  private rateLimitRemaining = 4;
  private rateLimitReset = Date.now() + 60000;
  private rateLimitLimit = 4;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY || '';
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY not found in environment');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    hash?: string
  ): Promise<T> {
    const now = Date.now();
    if (now < this.rateLimitReset) {
      if (this.rateLimitRemaining <= 0) {
        throw new Error(`Rate limit exceeded. Resets at ${new Date(this.rateLimitReset).toISOString()}`);
      }
    } else {
      this.rateLimitRemaining = this.rateLimitLimit;
      this.rateLimitReset = now + 60000;
    }

    const url = new URL(this.baseURL, window.location.origin);
    url.searchParams.set('endpoint', endpoint);
    if (hash) {
      url.searchParams.set('hash', hash);
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (response.headers.has('api-limits')) {
        try {
          const limits = JSON.parse(response.headers.get('api-limits') || '{}');
          this.rateLimitRemaining = limits.remaining || this.rateLimitRemaining;
          this.rateLimitLimit = limits.limit || this.rateLimitLimit;
        } catch (e) {
          console.warn('Failed to parse rate limit headers:', e);
        }
      }

      this.rateLimitRemaining--;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `API error ${response.status}`;
        
        if (response.status === 404) {
          throw new Error('Indicator not found in Hybrid Analysis database');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key or insufficient permissions.');
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorMessage}`);
        } else {
          throw new Error(errorMessage);
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          throw new Error('Unable to connect to Hybrid Analysis API. Please check your network connection and API configuration.');
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async scanIndicator(request: HAScanRequest): Promise<HAAnalysisResult> {
    const { indicator, type, include_metadata = true, include_summary = true } = request;
    
    try {
      if (type !== 'hash') {
        throw new Error('Hybrid Analysis primarily supports hash lookups (MD5, SHA1, SHA256, SHA512)');
      }

      const { isValid, type: hashType } = validateHash(indicator);
      if (!isValid) {
        throw new Error(`Invalid hash format. Must be MD5 (32), SHA1 (40), SHA256 (64), or SHA512 (128) hex characters.`);
      }

      const hashTypeSafe = hashType || 'unknown';
      console.log(`[HybridAnalysis] Scanning ${hashTypeSafe} hash: ${indicator}`);

      const searchData = await this.makeRequest<any>('search-hash', indicator);

      if (!searchData || searchData.error) {
        return this.createNotFoundResult(indicator);
      }

      let sha256 = indicator;
      if (searchData.sha256s && searchData.sha256s.length > 0) {
        sha256 = searchData.sha256s[0];
      }

      let overviewData: any = {};
      let summaryData: any = {};

      try {
        overviewData = await this.makeRequest<any>('overview', sha256);
        
        if (overviewData && !overviewData.error) {
          if (include_summary) {
            try {
              summaryData = await this.makeRequest<any>('overview-summary', sha256);
            } catch (summaryError) {
              console.warn('Failed to get summary:', summaryError);
            }
          }
        }
      } catch (overviewError) {
        console.warn('Failed to get overview:', overviewError);
      }

      const result = this.parseAnalysisResult(
        indicator,
        sha256,
        searchData,
        overviewData,
        summaryData,
        hashTypeSafe
      );

      console.log(`[HybridAnalysis] Scan completed for ${indicator}`, {
        found: result.found,
        threat_score_computed: result.threat_score_computed,
        verdict: result.verdict
      });

      return result;
    } catch (error) {
      console.error('[HybridAnalysis] Scan failed:', error);
      throw error;
    }
  }

  private parseAnalysisResult(
    originalHash: string,
    sha256: string,
    searchData: any,
    overviewData: any,
    summaryData: any,
    hashType: string
  ): HAAnalysisResult {
    const found = !!(searchData?.reports?.length > 0 || overviewData?.sha256);
    
    let threatScoreComputed = overviewData?.threat_score !== undefined && overviewData.threat_score !== null 
      ? overviewData.threat_score 
      : 0;

    if (threatScoreComputed === 0 && searchData?.reports?.length > 0) {
      const reports = searchData.reports;
      const maliciousCount = reports.filter((r: any) => 
        r.verdict === 'malicious' || r.verdict === 60
      ).length;
      const suspiciousCount = reports.filter((r: any) => 
        r.verdict === 'suspicious' || r.verdict === 50
      ).length;
      
      if (reports.length > 0) {
        threatScoreComputed = Math.min(100, ((maliciousCount * 2 + suspiciousCount) / reports.length) * 100);
      }
    }

    const verdict = overviewData?.verdict || searchData?.reports?.[0]?.verdict || 'unknown';
    const verdictNumeric = verdict === 'malicious' || verdict === 60 ? 60 :
                          verdict === 'suspicious' || verdict === 50 ? 50 :
                          verdict === 'no_specific_threat' || verdict === 'no specific threat' || verdict === 40 ? 40 :
                          verdict === 'no_verdict' || verdict === 30 ? 30 :
                          verdict === 'whitelisted' || verdict === 20 ? 20 : 0;

    let threatLevel: HAAnalysisResult['threat_level'] = 'unknown';
    if (verdictNumeric === 60) threatLevel = 'malicious';
    else if (verdictNumeric === 50) threatLevel = 'suspicious';
    else if (verdictNumeric === 40) threatLevel = 'no_specific_threat';
    else if (verdictNumeric === 30) threatLevel = 'no_verdict';
    else if (verdictNumeric === 20) threatLevel = 'whitelisted';

    const behavioralIndicators = extractBehavioralIndicators({
      mitre_attcks: summaryData?.mitre_attcks,
      signatures: summaryData?.signatures,
      total_network_connections: summaryData?.total_network_connections,
      total_processes: summaryData?.total_processes,
      extracted_files: summaryData?.extracted_files
    } as any);

    const result: HAAnalysisResult = {
      ioc: originalHash,
      ioc_type: 'hash',
      found,
      sha256,
      last_file_name: overviewData?.last_file_name,
      other_file_name: overviewData?.other_file_name,
      threat_score: overviewData?.threat_score,
      verdict,
      verdict_numeric: verdictNumeric,
      url_analysis: overviewData?.url_analysis || false,
      size: overviewData?.size,
      type: overviewData?.type,
      type_short: overviewData?.type_short,
      submitted_at: overviewData?.submitted_at,
      analysis_start_time: overviewData?.analysis_start_time,
      last_multi_scan: overviewData?.last_multi_scan,
      tags: overviewData?.tags || [],
      architecture: overviewData?.architecture,
      vx_family: overviewData?.vx_family,
      multiscan_result: overviewData?.multiscan_result,
      reports: searchData?.reports?.map((report: any) => ({
        id: report.id,
        environment_id: report.environment_id,
        environment_description: report.environment_description,
        state: report.state,
        error_type: report.error_type,
        error_origin: report.error_origin,
        verdict: report.verdict
      })) || [],
      scanners: overviewData?.scanners,
      related_parent_hashes: overviewData?.related_parent_hashes,
      related_children_hashes: overviewData?.related_children_hashes,
      related_reports: overviewData?.related_reports,
      summary: summaryData,
      extracted_files: summaryData?.extracted_files,
      file_metadata: summaryData?.file_metadata,
      processes: summaryData?.processes,
      mitre_attcks: summaryData?.mitre_attcks,
      signatures: summaryData?.signatures,
      classification_tags: summaryData?.classification_tags,
      whitelisted: overviewData?.whitelisted || false,
      children_in_queue: overviewData?.children_in_queue,
      children_in_progress: overviewData?.children_in_progress,
      community_score_votes_down: overviewData?.community_score_votes_down,
      community_score_votes_up: overviewData?.community_score_votes_up,
      submissions: summaryData?.submissions,
      machine_learning_models: summaryData?.machine_learning_models,
      crowdstrike_ai: summaryData?.crowdstrike_ai,
      warnings: summaryData?.warnings,
      threat_level: threatLevel,
      threat_score_computed: threatScoreComputed,
      analysis_date: overviewData?.analysis_start_time || new Date().toISOString(),
      ha_url: `https://www.hybrid-analysis.com/sample/${sha256}`,
      timestamp: new Date().toISOString(),
      raw_data: {
        search: searchData,
        overview: overviewData,
        summary: summaryData
      }
    };

    return result;
  }

  private createNotFoundResult(indicator: string): HAAnalysisResult {
    return {
      ioc: indicator,
      ioc_type: 'hash',
      found: false,
      sha256: indicator,
      tags: [],
      url_analysis: false,
      whitelisted: false,
      threat_level: 'unknown',
      threat_score_computed: 0,
      analysis_date: new Date().toISOString(),
      ha_url: `https://www.hybrid-analysis.com/search?query=${indicator}`,
      timestamp: new Date().toISOString(),
      raw_data: null
    };
  }

  async getThreatFeed(limit: number = 50): Promise<HAThreatFeedItem[]> {
    try {
      console.log('[HybridAnalysis] Fetching threat feed...');
      
      const feedData = await this.makeRequest<any[]>('feed-detonation');
      
      if (!Array.isArray(feedData)) {
        return [];
      }

      const threats = feedData.slice(0, limit).map(item => ({
        report_id: item.report_id,
        md5: item.md5,
        sha1: item.sha1,
        sha256: item.sha256,
        sha512: item.sha512,
        submit_name: item.submit_name,
        url_analysis: item.url_analysis || false,
        size: item.size,
        mime: item.mime,
        type: item.type,
        type_short: item.type_short,
        environment_id: item.environment_id,
        environment_description: item.environment_description,
        verdict: item.verdict,
        verdict_human: item.verdict_human || 
          (item.verdict === 60 ? 'malicious' :
           item.verdict === 50 ? 'suspicious' :
           item.verdict === 40 ? 'no specific threat' :
           item.verdict === 30 ? 'no_verdict' :
           item.verdict === 20 ? 'whitelisted' : 'unknown')
      }));

      console.log(`[HybridAnalysis] Loaded ${threats.length} threats from feed`);
      return threats;
    } catch (error) {
      console.error('[HybridAnalysis] Failed to fetch threat feed:', error);
      return [];
    }
  }

  async getQuickScanFeed(limit: number = 50): Promise<HAThreatFeedItem[]> {
    try {
      const feedData = await this.makeRequest<any[]>('feed-quick-scan');
      
      if (!Array.isArray(feedData)) {
        return [];
      }

      return feedData.slice(0, limit).map(item => ({
        report_id: item.quick_scan_id,
        sha256: item.sha256,
        submit_name: item.submit_name,
        url_analysis: item.url_analysis || false,
        size: item.size,
        mime: item.mime,
        type: item.type,
        type_short: item.type_short,
        verdict: item.verdict,
        verdict_human: item.verdict_human || 'unknown'
      }));
    } catch (error) {
      console.error('[HybridAnalysis] Failed to fetch quick scan feed:', error);
      return [];
    }
  }

  async getReportSummary(reportId: string): Promise<any> {
    try {
      return await this.makeRequest<any>('report-summary', reportId);
    } catch (error) {
      console.error('[HybridAnalysis] Failed to get report summary:', error);
      return null;
    }
  }

  async getReportState(reportId: string): Promise<any> {
    try {
      const url = new URL('/api/hybrid-analysis', window.location.origin);
      url.searchParams.set('endpoint', 'report-state');
      url.searchParams.set('hash', reportId);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[HybridAnalysis] Failed to get report state:', error);
      return null;
    }
  }

  getRateLimitInfo(): HARateLimitInfo {
    return {
      remaining: this.rateLimitRemaining,
      limit: this.rateLimitLimit,
      resetTime: new Date(this.rateLimitReset),
      minutesUntilReset: Math.max(0, (this.rateLimitReset - Date.now()) / 60000)
    };
  }

  async clearCache(): Promise<void> {
    // This service doesn't maintain an internal cache
    // Cache clearing would be handled by the cache layer
  }
}

export const hybridAnalysisService = new HybridAnalysisService();