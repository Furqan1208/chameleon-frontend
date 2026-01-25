// lib/threat-intel/abuseipdb-service.ts
// COMPLETE FIXED VERSION WITH CORS FIX
import type {
  AbuseIPDBAnalysisResult,
  AbuseIPDBBlacklistRequest,
  AbuseIPDBBlacklistResponse,
  AbuseIPDBReportRequest
} from './abuseipdb-types';
import { AbuseIPDBStorage } from '@/lib/storage/abuseipdb-storage';

export class AbuseIPDBService {
  private apiKey: string;
  private baseURL = 'https://api.abuseipdb.com/api/v2';
  private useProxy: boolean = false;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ABUSEIPDB_API_KEY || '';
    
    // Check if we need to use proxy (for localhost development)
    this.useProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true' || 
                   window.location.hostname === 'localhost';
    
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      console.warn('[AbuseIPDB] API key not found in environment');
    } else if (this.apiKey) {
      console.log('[AbuseIPDB] Service initialized with API key');
      console.log('[AbuseIPDB] Using proxy:', this.useProxy);
    }
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('AbuseIPDB API key not configured. Please add NEXT_PUBLIC_ABUSEIPDB_API_KEY to your environment variables.');
    }

    // Build URL
    let url: string;
    if (this.useProxy) {
      // Use Next.js API route as proxy to avoid CORS issues
      url = `/api/abuseipdb-proxy/${endpoint}`;
      console.log(`[AbuseIPDB] Using proxy URL: ${url}`);
    } else {
      // Direct API call
      const apiUrl = new URL(`${this.baseURL}/${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            apiUrl.searchParams.append(key, String(value));
          }
        });
      }
      url = apiUrl.toString();
      console.log(`[AbuseIPDB] Making direct request to: ${url}`);
    }

    try {
      const options: RequestInit = {
        headers: {
          'Accept': 'application/json',
        },
      };

      // Add API key to headers (if not using proxy)
      if (!this.useProxy) {
        (options.headers as Record<string, string>)['Key'] = this.apiKey;
      }

      // If using proxy, send params in body
      let bodyParams = null;
      if (this.useProxy && params) {
        bodyParams = JSON.stringify({
          params: params,
          apiKey: this.apiKey
        });
        options.method = 'POST';
        options.body = bodyParams;
        (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
      }

      console.log(`[AbuseIPDB] Fetch options:`, { url, options: { ...options, headers: { ...options.headers } } });

      const response = await fetch(url, options);
      console.log(`[AbuseIPDB] Response status:`, response.status, response.statusText);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`[AbuseIPDB] Non-JSON response:`, text.substring(0, 200));
        throw new Error(`API returned non-JSON response: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[AbuseIPDB] Parsed JSON response:`, data);

      // Check for API errors
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const error = data.errors[0];
        console.error(`[AbuseIPDB] API error:`, error);
        throw new Error(`AbuseIPDB API error: ${error.detail || 'Unknown error'}`);
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error: any) {
      console.error(`[AbuseIPDB] Fetch error for ${endpoint}:`, error);
      
      // Provide more helpful error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Failed to fetch from AbuseIPDB API. This could be due to CORS, network connectivity, or API downtime.');
      }
      
      throw error;
    }
  }

  private logResponseForDebugging(ip: string, rawApiResponse: any, parsedResult: any) {
    const debugLog = {
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      rawApiResponse: rawApiResponse,
      apiResponseData: rawApiResponse?.data,
      parsedResultForUI: parsedResult,
      note: 'Compare apiResponseData fields with parsedResultForUI fields to identify parsing issues'
    };

    console.group(`🔍 [AbuseIPDB Debug] Response for IP: ${ip}`);
    console.log('📦 Full API Response Object:', rawApiResponse);
    console.log('🎯 "data" property to parse:', rawApiResponse?.data);
    console.log('🔄 Parsed Result Object:', parsedResult);
    
    // Show field-by-field comparison
    if (rawApiResponse?.data) {
      console.log('📊 Field Comparison:');
      const apiData = rawApiResponse.data;
      console.table([
        { Field: 'abuseConfidenceScore', API: apiData.abuseConfidenceScore, Parsed: parsedResult.confidence_score },
        { Field: 'countryCode', API: apiData.countryCode, Parsed: parsedResult.country },
        { Field: 'isp', API: apiData.isp, Parsed: parsedResult.isp },
        { Field: 'domain', API: apiData.domain, Parsed: parsedResult.domain },
        { Field: 'totalReports', API: apiData.totalReports, Parsed: parsedResult.total_reports },
        { Field: 'isWhitelisted', API: apiData.isWhitelisted, Parsed: parsedResult.is_whitelisted }
      ]);
    } else if (rawApiResponse?.error) {
      console.error('❌ API Error:', rawApiResponse.error);
    }
    console.groupEnd();

    // Save to localStorage
    try {
      const existingLogs = JSON.parse(localStorage.getItem('abuseipdb_debug_logs') || '[]');
      existingLogs.unshift(debugLog);
      const limitedLogs = existingLogs.slice(0, 20);
      localStorage.setItem('abuseipdb_debug_logs', JSON.stringify(limitedLogs));
    } catch (e) {
      console.error('Could not save debug log:', e);
    }
  }

  private getThreatLevel(confidenceScore: number, totalReports: number): AbuseIPDBAnalysisResult['threat_level'] {
    if (confidenceScore >= 90) return 'high';
    if (confidenceScore >= 70) return 'medium';
    if (confidenceScore >= 30) return 'low';
    if (confidenceScore === 0 && totalReports === 0) return 'clean';
    return 'unknown';
  }

  private getCategoryName(id: number): string {
    const categories: { [key: number]: string } = {
      1: 'DNS Compromise', 2: 'DNS Poisoning', 3: 'Fraud Orders',
      4: 'DDoS Attack', 5: 'FTP Brute-Force', 6: 'Ping of Death',
      7: 'Phishing', 8: 'Fraud VoIP', 9: 'Open Proxy', 10: 'Web Spam',
      11: 'Email Spam', 12: 'Blog Spam', 13: 'VPN IP', 14: 'Port Scan',
      15: 'Hacking', 16: 'SQL Injection', 17: 'Spoofing', 18: 'Brute-Force',
      19: 'Bad Web Bot', 20: 'Exploited Host', 21: 'Web App Attack',
      22: 'SSH', 23: 'IoT Targeted',
    };
    return categories[id] || `Category ${id}`;
  }

  async checkIP(ip: string, maxAgeInDays: number = 90): Promise<AbuseIPDBAnalysisResult> {
    console.log(`[AbuseIPDB] Checking IP: ${ip}`);
    
    // Check cache first
    const cacheKey = `check:${ip}:${maxAgeInDays}`;
    const cache = AbuseIPDBStorage.getCache();
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      console.log(`[AbuseIPDB] Using cached result for ${ip}`);
      return cachedResult;
    }

    try {
      console.log(`[AbuseIPDB] Making API request for IP: ${ip}`);
      
      const response = await this.makeRequest<any>('check', {
        ipAddress: ip,
        maxAgeInDays: maxAgeInDays,
        verbose: true
      });

      console.log('[AbuseIPDB] Response structure:', response);

      // Handle different response structures
      let responseData;
      if (response.data !== undefined) {
        responseData = response.data;
        console.log('[AbuseIPDB] Using response.data');
      } else if (response.ipAddress !== undefined) {
        responseData = response;
        console.log('[AbuseIPDB] Using direct response');
      } else {
        console.warn(`[AbuseIPDB] Unexpected response structure:`, response);
        const notFoundResult = this.createNotFoundResult(ip);
        this.logResponseForDebugging(ip, response, notFoundResult);
        return notFoundResult;
      }

      const result = this.parseCheckResponse(responseData, ip);
      this.logResponseForDebugging(ip, response, result);
      
      // Cache and save to history
      AbuseIPDBStorage.setCache(cacheKey, result);
      AbuseIPDBStorage.addToHistory(result);
      
      return result;
    } catch (error) {
      console.error(`[AbuseIPDB] Check failed for ${ip}:`, error);
      const notFoundResult = this.createNotFoundResult(ip);
      this.logResponseForDebugging(ip, { error: error.message }, notFoundResult);
      AbuseIPDBStorage.addToHistory(notFoundResult);
      return notFoundResult;
    }
  }

  async reportIP(report: AbuseIPDBReportRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/report`, {
        method: 'POST',
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: report.ip,
          categories: report.categories,
          comment: report.comment,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('[AbuseIPDB] Failed to report IP:', error);
      throw error;
    }
  }

  async getBlacklist(params: AbuseIPDBBlacklistRequest = {}): Promise<any[]> {
    console.log('[AbuseIPDB] Getting blacklist with params:', params);
    
    try {
      const response = await this.makeRequest<AbuseIPDBBlacklistResponse>('blacklist', {
        confidenceMinimum: params.confidenceMinimum || 90,
        limit: params.limit || 100,
        onlyCountries: params.onlyCountries?.join(',') || '',
        exceptCountries: params.exceptCountries?.join(',') || '',
      });

      const blacklistResults = response.data.map(item => ({
        ip: item.ipAddress,
        found: true,
        confidence_score: item.abuseConfidenceScore,
        threat_level: item.abuseConfidenceScore >= 90 ? 'high' : 'medium',
        country: item.countryCode || 'Unknown',
        isp: 'Unknown',
        domain: 'Unknown',
        usage_type: 'Unknown',
        is_tor: false,
        is_whitelisted: false,
        total_reports: 0,
        distinct_users: 0,
        last_reported: item.lastReportedAt,
        first_reported: item.lastReportedAt,
        categories: [],
        reports: [],
        hostnames: [],
        raw_data: item,
        timestamp: new Date().toISOString()
      }));
      
      AbuseIPDBStorage.saveBlacklist(blacklistResults);
      return blacklistResults;
    } catch (error) {
      console.error('[AbuseIPDB] Failed to get blacklist:', error);
      
      const cachedBlacklist = AbuseIPDBStorage.getBlacklist();
      if (cachedBlacklist.length > 0) {
        console.log('[AbuseIPDB] Using cached blacklist');
        return cachedBlacklist;
      }
      
      throw error;
    }
  }

  private parseCheckResponse(data: any, ip: string): AbuseIPDBAnalysisResult {
    console.log('[AbuseIPDB] Parsing response data for IP:', ip, 'Data:', data);
    
    // Safely extract all fields
    const abuseConfidenceScore = data.abuseConfidenceScore || 0;
    const totalReports = data.totalReports || 0;
    const numDistinctUsers = data.numDistinctUsers || 0;
    const lastReportedAt = data.lastReportedAt || '';
    
    // Handle null/undefined values
    const countryCode = data.countryCode;
    const countryName = data.countryName;
    const isp = data.isp;
    const domain = data.domain;
    const usageType = data.usageType;
    
    console.log('[AbuseIPDB] Extracted fields:', {
      abuseConfidenceScore,
      countryCode,
      countryName,
      isp,
      domain,
      usageType,
      totalReports
    });
    
    // Calculate categories
    const categoryCounts: { [key: number]: number } = {};
    const reports = data.reports || [];
    
    reports.forEach((report: any) => {
      const reportCategories = report.categories || [];
      reportCategories.forEach((categoryId: number) => {
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });
    });

    const categories = Object.entries(categoryCounts).map(([id, count]) => ({
      id: parseInt(id),
      name: this.getCategoryName(parseInt(id)),
      count
    }));

    categories.sort((a, b) => b.count - a.count);

    // Format reports
    const formattedReports = reports.slice(0, 5).map((report: any) => ({
      date: report.reportedAt || '',
      comment: report.comment || '',
      categories: (report.categories || []).map((id: number) => this.getCategoryName(id)),
      reporter_country: report.reporterCountryName || report.reporterCountryCode || 'Unknown'
    }));

    // Get first reported date
    let firstReportedAt = '';
    if (reports.length > 0) {
      const sortedReports = [...reports].sort((a, b) => 
        new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime()
      );
      firstReportedAt = sortedReports[0]?.reportedAt || '';
    }

    const result: AbuseIPDBAnalysisResult = {
      ip,
      found: true,
      confidence_score: abuseConfidenceScore,
      threat_level: this.getThreatLevel(abuseConfidenceScore, totalReports),
      country: countryCode || countryName || 'Unknown',
      isp: isp || 'Unknown',
      domain: domain || 'Unknown',
      usage_type: usageType || 'Unknown',
      is_tor: data.isTor || false,
      is_whitelisted: data.isWhitelisted || false,
      total_reports: totalReports,
      distinct_users: numDistinctUsers,
      last_reported: lastReportedAt,
      first_reported: firstReportedAt,
      categories,
      reports: formattedReports,
      hostnames: data.hostnames || [],
      raw_data: data,
      timestamp: new Date().toISOString()
    };

    console.log('[AbuseIPDB] Final parsed result:', result);
    return result;
  }

  private createNotFoundResult(ip: string): AbuseIPDBAnalysisResult {
    return {
      ip,
      found: false,
      confidence_score: 0,
      threat_level: 'unknown',
      country: 'Unknown',
      isp: 'Unknown',
      domain: 'Unknown',
      usage_type: 'Unknown',
      is_tor: false,
      is_whitelisted: false,
      total_reports: 0,
      distinct_users: 0,
      last_reported: '',
      first_reported: '',
      categories: [],
      reports: [],
      hostnames: [],
      raw_data: null,
      timestamp: new Date().toISOString()
    };
  }

  // Test method - use this to debug
  async testDirectFetch(): Promise<void> {
    console.log('🔬 [AbuseIPDB] Testing direct fetch...');
    
    try {
      // Test URL from AbuseIPDB documentation
      const testUrl = 'https://api.abuseipdb.com/api/v2/check?ipAddress=8.8.8.8&maxAgeInDays=90';
      console.log('🔬 Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json',
        },
      });
      
      console.log('🔬 Response status:', response.status, response.statusText);
      console.log('🔬 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('🔬 Raw response (first 500 chars):', text.substring(0, 500));
      
      if (response.ok) {
        const json = JSON.parse(text);
        console.log('🔬 Parsed JSON:', json);
        alert('✅ Direct fetch SUCCESS! Check console for details.');
      } else {
        console.error('🔬 HTTP Error:', text);
        alert(`❌ HTTP Error ${response.status}: ${text}`);
      }
    } catch (error: any) {
      console.error('🔬 Direct fetch failed:', error);
      alert(`❌ Direct fetch failed: ${error.message}`);
    }
  }

  viewDebugLogs(): void {
    try {
      const logs = JSON.parse(localStorage.getItem('abuseipdb_debug_logs') || '[]');
      console.group('📁 [AbuseIPDB] Saved Debug Logs');
      logs.forEach((log: any, index: number) => {
        console.group(`Log ${index + 1}: ${log.ipAddress} at ${log.timestamp}`);
        console.log('Raw API Response:', log.rawApiResponse);
        console.log('API Data:', log.apiResponseData);
        console.log('Parsed Result:', log.parsedResultForUI);
        console.groupEnd();
      });
      console.groupEnd();
    } catch (e) {
      console.error('Could not load debug logs:', e);
    }
  }

  clearCache(): void {
    AbuseIPDBStorage.clearCache();
    console.log('[AbuseIPDB] Cache cleared');
  }

  getHistory(): any[] {
    return AbuseIPDBStorage.getHistory();
  }

  clearHistory(): void {
    AbuseIPDBStorage.clearHistory();
    console.log('[AbuseIPDB] History cleared');
  }

  clearAll(): void {
    AbuseIPDBStorage.clearAll();
    console.log('[AbuseIPDB] All data cleared');
  }
}

// Singleton instance
export const abuseIPDBService = new AbuseIPDBService();