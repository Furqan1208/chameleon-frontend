// D:\FYP\Chameleon Frontend\lib\threat-intel\alienvault-service.ts
import { otxCache, otxDatabase } from './otx-cache';
import type {
  OTXIndicatorType,
  OTXResult,
  OTXScanRequest,
  OTXScanHistory,
  OTXGeneralData,
  OTXMalwareData,
  OTXPassiveDNS,
  OTXURLList,
  OTXHTTPScan,
  OTXAnalysis
} from './otx-types';

export class AlienVaultOTXService {
  private apiKey: string;
  private baseURL = 'https://otx.alienvault.com/api/v1';
  private rateLimitRemaining = 10;
  private rateLimitReset = Date.now();

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[AlienVaultOTX] API key not configured. Please set NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY in .env.local');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    // Check if API key is configured
    if (!this.apiKey) {
      throw new Error('AlienVault OTX API key is not configured');
    }

    // Check rate limiting
    const now = Date.now();
    if (now < this.rateLimitReset) {
      if (this.rateLimitRemaining <= 0) {
        const secondsUntilReset = Math.ceil((this.rateLimitReset - now) / 1000);
        throw new Error(`Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`);
      }
    } else {
      this.rateLimitRemaining = 10;
      this.rateLimitReset = now + 60000; // Reset every minute
    }

    let url: URL;
    try {
      url = new URL(`${this.baseURL}/${endpoint}`);
    } catch (error) {
      throw new Error(`Invalid endpoint: ${endpoint}`);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log(`[AlienVaultOTX] Making request to: ${url.toString().split('?')[0]}`);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'X-OTX-API-KEY': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Chameleon-Malware-Analysis/1.0'
        },
        // Add timeout for fetch
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      // Update rate limit counter
      this.rateLimitRemaining = Math.max(0, this.rateLimitRemaining - 1);

      if (!response.ok) {
        if (response.status === 404) {
          // Not found is not an error - just means indicator not in database
          return { error: 'Indicator not found in OTX database' } as T;
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || '60';
          this.rateLimitReset = now + (parseInt(retryAfter) * 1000);
          throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key. Please check your NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY.');
        } else if (response.status >= 500) {
          throw new Error('AlienVault OTX service is temporarily unavailable.');
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
      }
      throw new Error('Unknown error occurred while contacting AlienVault OTX');
    }
  }

  private generateCacheKey(indicator: string, type: OTXIndicatorType): string {
    return `otx:${type}:${indicator.toLowerCase().trim()}`;
  }

  // Detect indicator type based on pattern
  private detectIndicatorType(indicator: string): OTXIndicatorType {
    const cleanIndicator = indicator.trim().toLowerCase();
    
    // Check for IPv4
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Pattern.test(cleanIndicator)) {
      return 'IPv4';
    }
    
    // Check for IPv6 (simplified pattern)
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Pattern.test(cleanIndicator)) {
      return 'IPv6';
    }
    
    // Check for domain (simplified pattern)
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (domainPattern.test(cleanIndicator) && !cleanIndicator.includes('/')) {
      return 'domain';
    }
    
    // Check for URL
    if (cleanIndicator.startsWith('http://') || cleanIndicator.startsWith('https://')) {
      return 'url';
    }
    
    // Check for file hash patterns
    const md5Pattern = /^[a-fA-F0-9]{32}$/;
    const sha1Pattern = /^[a-fA-F0-9]{40}$/;
    const sha256Pattern = /^[a-fA-F0-9]{64}$/;
    if (sha256Pattern.test(cleanIndicator)) {
      return 'file';
    }
    if (sha1Pattern.test(cleanIndicator)) {
      return 'file';
    }
    if (md5Pattern.test(cleanIndicator)) {
      return 'file';
    }
    
    // Check for CVE
    const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
    if (cvePattern.test(cleanIndicator)) {
      return 'cve';
    }
    
    // Check for hostname (contains dots but not URL)
    if (cleanIndicator.includes('.') && !cleanIndicator.includes('/')) {
      return 'hostname';
    }
    
    // Default to domain
    return 'domain';
  }

  // Map indicator types for OTX API
  private getOTXEndpointType(type: OTXIndicatorType): string {
    const typeMap: Partial<Record<OTXIndicatorType, string>> = {
      'IPv4': 'IPv4',
      'IPv6': 'IPv6',
      'domain': 'domain',
      'hostname': 'hostname',
      'url': 'url',
      'file': 'file',
      'cve': 'cve',
      'email': 'email',
      'mutex': 'mutex'
    };
    return typeMap[type] || 'domain'; // Default to domain for 'auto' or unknown types
  }

  // Get valid sections based on indicator type
  private getValidSections(type: OTXIndicatorType): string[] {
    const sections: Partial<Record<OTXIndicatorType, string[]>> = {
      'IPv4': ['general', 'geo', 'malware', 'url_list', 'http_scans', 'passive_dns'],
      'IPv6': ['general', 'geo', 'malware', 'url_list', 'http_scans', 'passive_dns'],
      'domain': ['general', 'geo', 'malware', 'url_list', 'http_scans', 'passive_dns'],
      'hostname': ['general', 'geo', 'malware', 'url_list', 'http_scans', 'passive_dns'],
      'url': ['general', 'url_list', 'http_scans'],
      'file': ['general', 'analysis'],
      'cve': ['general'],
      'email': ['general'],
      'mutex': ['general']
    };
    return sections[type] || ['general'];
  }

  async scanIndicator(request: OTXScanRequest): Promise<OTXResult> {
    let { indicator, type, include_all_sections = true } = request;
    
    // Clean the indicator
    const cleanIndicator = indicator.trim();
    
    // Auto-detect type if not specified
    if (!type || type === 'auto') {
      type = this.detectIndicatorType(cleanIndicator);
      console.log(`[AlienVaultOTX] Auto-detected type for ${cleanIndicator}: ${type}`);
    }
    
    // Check cache first
    const cacheKey = this.generateCacheKey(cleanIndicator, type);
    const cached = otxCache.get<OTXResult>(cacheKey);
    if (cached) {
      console.log(`[AlienVaultOTX] Returning cached result for ${cleanIndicator}`);
      return cached;
    }

    console.log(`[AlienVaultOTX] Scanning indicator: ${cleanIndicator} (${type})`);
    
    try {
      const result = await this.fetchIndicatorData(cleanIndicator, type, include_all_sections);
      
      // Cache the result (30 minutes TTL)
      otxCache.set(cacheKey, result);
      console.log(`[AlienVaultOTX] Scan completed for ${cleanIndicator}`);

      // Save to history
      const scanHistory: OTXScanHistory = {
        id: crypto.randomUUID(),
        indicator: cleanIndicator,
        type,
        result,
        timestamp: new Date().toISOString(),
        favorite: false
      };

      try {
        await otxDatabase.saveScan(scanHistory);
        console.log(`[AlienVaultOTX] Saved scan to history: ${cleanIndicator}`);
      } catch (dbError) {
        console.warn('[AlienVaultOTX] Failed to save to database:', dbError);
      }

      return result;
    } catch (error) {
      console.error(`[AlienVaultOTX] Scan failed for ${cleanIndicator}:`, error);
      
      // Return a result indicating error instead of throwing
      return this.createEmptyResult(cleanIndicator, type, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async fetchIndicatorData(
    indicator: string,
    type: OTXIndicatorType,
    includeAllSections: boolean
  ): Promise<OTXResult> {
    const sections = includeAllSections ? this.getValidSections(type) : ['general'];
    const apiType = this.getOTXEndpointType(type);
    
    const sectionsData: any = {
      general: null,
      malware: null,
      passive_dns: null,
      url_list: null,
      http_scans: null,
      analysis: null,
      geo: null
    };
    
    console.log(`[AlienVaultOTX] Fetching sections for ${indicator}:`, sections);

    // Fetch general section first (always required)
    try {
      const generalData = await this.makeRequest<any>(`indicators/${apiType}/${encodeURIComponent(indicator)}/general`);
      sectionsData.general = this.cleanGeneralData(generalData);
      console.log(`[AlienVaultOTX] General data fetched for ${indicator}`);
    } catch (error) {
      console.warn(`[AlienVaultOTX] Failed to fetch general data for ${indicator}:`, error);
      sectionsData.general = { 
        indicator,
        type: apiType,
        error: error instanceof Error ? error.message : 'Failed to fetch general data',
        pulse_info: { count: 0, pulses: [], references: [], related: { alienvault: { adversary: [], malware_families: [], industries: [] }, other: { adversary: [], malware_families: [], industries: [] } } }
      };
    }

    // If we have valid general data without errors, fetch other sections
    if (sectionsData.general && !sectionsData.general.error) {
      const otherSections = sections.filter(s => s !== 'general');
      
      // Fetch remaining sections with delays to avoid rate limiting
      for (const section of otherSections) {
        try {
          const endpoint = `indicators/${apiType}/${encodeURIComponent(indicator)}/${section}`;
          console.log(`[AlienVaultOTX] Fetching ${section} for ${indicator}`);
          const data = await this.makeRequest<any>(endpoint);
          sectionsData[section] = this.cleanSectionData(section, data);
          console.log(`[AlienVaultOTX] Successfully fetched ${section} for ${indicator}`);
        } catch (error) {
          console.warn(`[AlienVaultOTX] Failed to fetch ${section} for ${indicator}:`, error);
          // Don't fail the entire request if one section fails
          sectionsData[section] = null;
        }
        
        // Small delay between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Parse the combined result
    return this.parseResponse(indicator, type, sectionsData);
  }

  private cleanGeneralData(data: any): any {
    if (!data || data.error) {
      return { 
        error: data?.error || 'No data available', 
        pulse_info: { 
          count: 0, 
          pulses: [], 
          references: [], 
          related: { 
            alienvault: { 
              adversary: [], 
              malware_families: [], 
              industries: [] 
            }, 
            other: { 
              adversary: [], 
              malware_families: [], 
              industries: [] 
            } 
          } 
        } 
      };
    }

    // Extract only the fields we need
    const cleaned = {
      indicator: data.indicator,
      type: data.type,
      asn: data.asn,
      pulse_info: data.pulse_info || { 
        count: 0, 
        pulses: [], 
        references: [], 
        related: { 
          alienvault: { 
            adversary: [], 
            malware_families: [], 
            industries: [] 
          }, 
          other: { 
            adversary: [], 
            malware_families: [], 
            industries: [] 
          } 
        } 
      },
      latitude: data.latitude,
      longitude: data.longitude,
      malware: data.malware || [],
      country_code: data.country_code,
      city: data.city,
      region: data.region,
      isp: data.isp,
      organization: data.organization,
      country_name: data.country_name
    };

    return cleaned;
  }

  private cleanSectionData(section: string, data: any): any {
    if (!data || data.error) {
      return null;
    }

    switch (section) {
      case 'malware':
        return {
          data: Array.isArray(data.data) ? data.data.map((item: any) => ({
            datetime_int: item.datetime_int || 0,
            hash: item.hash || '',
            detections: item.detections || {},
            date: item.date || new Date().toISOString().split('T')[0]
          })) : []
        };
        
      case 'passive_dns':
        return {
          passive_dns: Array.isArray(data.passive_dns) ? data.passive_dns.map((entry: any) => ({
            address: entry.address || '',
            hostname: entry.hostname || '',
            record_type: entry.record_type || 'A',
            first: entry.first || '',
            last: entry.last || '',
            asn: entry.asn || null
          })) : []
        };
        
      case 'url_list':
        return {
          url_list: Array.isArray(data.url_list) ? data.url_list.map((entry: any) => ({
            url: entry.url || '',
            date: entry.date || '',
            domain: entry.domain || '',
            hostname: entry.hostname || '',
            httpcode: entry.httpcode || 0,
            result: entry.result || {}
          })) : []
        };
        
      case 'http_scans':
        return {
          data: Array.isArray(data.data) ? data.data.map((entry: any) => ({
            key: entry.key || '',
            name: entry.name || '',
            value: entry.value || ''
          })) : []
        };
        
      case 'analysis':
        return {
          analysis: data.analysis || {},
          info: data.info || {}
        };
        
      case 'geo':
        return {
          country_name: data.country_name || '',
          country_code: data.country_code || '',
          city: data.city || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null
        };
        
      default:
        return data;
    }
  }

  private parseResponse(
    indicator: string,
    type: OTXIndicatorType,
    sectionsData: any
  ): OTXResult {
    const general = sectionsData.general;
    
    // Check if we have valid data
    if (!general || general.error) {
      return this.createEmptyResult(indicator, type, general?.error || 'Not found in OTX database');
    }

    const malware = sectionsData.malware;
    const urlList = sectionsData.url_list;
    const passiveDNS = sectionsData.passive_dns;
    const httpScans = sectionsData.http_scans;
    const analysis = sectionsData.analysis;
    const geo = sectionsData.geo;

    // Calculate statistics
    const pulseCount = general.pulse_info?.count || 0;
    const malwareCount = malware?.data?.length || 0;
    const urlCount = urlList?.url_list?.length || 0;
    const passiveDNSCount = passiveDNS?.passive_dns?.length || 0;

    // Calculate threat score (0-100)
    let threatScore = 0;
    
    // Pulse count contributes up to 30 points
    if (pulseCount > 0) {
      threatScore += Math.min(pulseCount * 3, 30);
    }
    
    // Malware count contributes up to 20 points
    if (malwareCount > 0) {
      threatScore += Math.min(malwareCount * 2, 20);
    }
    
    threatScore = Math.min(Math.max(threatScore, 0), 100);

    // Determine threat level
    const threatLevel = this.determineThreatLevel(threatScore, pulseCount, malwareCount);

    // Generate OTX URL
    const otxUrl = this.generateOTXUrl(indicator, type);

    // Merge geo data with general if available
    const finalGeneral = { ...general };
    if (geo) {
      if (!finalGeneral.latitude && geo.latitude) finalGeneral.latitude = geo.latitude;
      if (!finalGeneral.longitude && geo.longitude) finalGeneral.longitude = geo.longitude;
      if (!finalGeneral.country_code && geo.country_code) finalGeneral.country_code = geo.country_code;
      if (!finalGeneral.city && geo.city) finalGeneral.city = geo.city;
      if (!finalGeneral.country_name && geo.country_name) finalGeneral.country_name = geo.country_name;
    }

    // Get analysis info
    const analysisInfo = analysis?.info || {};
    const fileType = analysisInfo?.results?.file_class || analysisInfo?.file_type || 'Unknown';

    return {
      ioc: indicator,
      ioc_type: type,
      found: true,
      sections: {
        general: finalGeneral,
        malware: malware || undefined,
        passive_dns: passiveDNS || undefined,
        url_list: urlList || undefined,
        http_scans: httpScans || undefined,
        analysis: analysis || undefined,
        geo: geo || undefined
      },
      threat_level: threatLevel,
      threat_score: Math.round(threatScore * 10) / 10, // Keep one decimal place
      pulse_count: pulseCount,
      malware_count: malwareCount,
      url_count: urlCount,
      passive_dns_count: passiveDNSCount,
      otx_url: otxUrl,
      timestamp: new Date().toISOString(),
      raw_data: sectionsData,
      // Additional metadata
      file_type: fileType,
      asn: finalGeneral.asn,
      country: finalGeneral.country_name
    };
  }

  private createEmptyResult(
    indicator: string,
    type: OTXIndicatorType,
    errorMessage: string
  ): OTXResult {
    const otxUrl = this.generateOTXUrl(indicator, type);
    
    return {
      ioc: indicator,
      ioc_type: type,
      found: false,
      sections: {
        general: {
          indicator,
          type: type.toString(),
          pulse_info: { 
            count: 0, 
            pulses: [], 
            references: [], 
            related: { 
              alienvault: { adversary: [], malware_families: [], industries: [] }, 
              other: { adversary: [], malware_families: [], industries: [] } 
            } 
          },
          malware: []
        }
      },
      threat_level: 'unknown',
      threat_score: 0,
      pulse_count: 0,
      malware_count: 0,
      url_count: 0,
      passive_dns_count: 0,
      otx_url: otxUrl,
      timestamp: new Date().toISOString(),
      raw_data: { error: errorMessage },
      file_type: 'Unknown',
      asn: undefined,
      country: undefined
    };
  }

  private determineThreatLevel(
    threatScore: number,
    pulseCount: number,
    malwareCount: number
  ): OTXResult['threat_level'] {
    if (threatScore >= 70 || malwareCount >= 5 || pulseCount >= 20) {
      return 'high';
    }
    if (threatScore >= 40 || malwareCount >= 2 || pulseCount >= 10) {
      return 'medium';
    }
    if (threatScore >= 10 || malwareCount >= 1 || pulseCount >= 1) {
      return 'low';
    }
    if (threatScore === 0 && pulseCount === 0 && malwareCount === 0) {
      return 'clean';
    }
    return 'unknown';
  }

  private generateOTXUrl(indicator: string, type: OTXIndicatorType): string {
    const baseUrl = 'https://otx.alienvault.com';
    
    // Encode indicator for URL
    const encodedIndicator = encodeURIComponent(indicator);
    
    switch (type) {
      case 'IPv4':
      case 'IPv6':
        return `${baseUrl}/indicator/ip/${encodedIndicator}`;
      case 'domain':
        return `${baseUrl}/indicator/domain/${encodedIndicator}`;
      case 'hostname':
        return `${baseUrl}/indicator/hostname/${encodedIndicator}`;
      case 'url':
        return `${baseUrl}/indicator/url/${encodedIndicator}`;
      case 'file':
        return `${baseUrl}/indicator/file/${encodedIndicator}`;
      case 'cve':
        return `${baseUrl}/indicator/cve/${encodedIndicator}`;
      case 'email':
        return `${baseUrl}/indicator/email/${encodedIndicator}`;
      case 'mutex':
        return `${baseUrl}/indicator/mutex/${encodedIndicator}`;
      default:
        return `${baseUrl}/search?q=${encodedIndicator}`;
    }
  }

  // Public methods
  async getScanHistory(limit = 50): Promise<OTXScanHistory[]> {
    try {
      console.log('[AlienVaultOTX] Getting scan history from database...');
      const scans = await otxDatabase.getScans(limit);
      console.log(`[AlienVaultOTX] Retrieved ${scans.length} scans from database`);
      
      // Ensure all scans have proper timestamps
      return scans.map(scan => ({
        ...scan,
        timestamp: scan.timestamp || new Date().toISOString(),
        favorite: scan.favorite || false
      }));
    } catch (error) {
      console.error('[AlienVaultOTX] Failed to get scan history from database:', error);
      
      // Try to get from cache as fallback
      try {
        console.log('[AlienVaultOTX] Trying to get history from cache...');
        const cacheKeys = otxCache.keys();
        const scanHistory: OTXScanHistory[] = [];
        
        for (const key of cacheKeys) {
          if (key.startsWith('otx:')) {
            const cachedData = otxCache.get<any>(key);
            if (cachedData && cachedData.ioc) {
              scanHistory.push({
                id: crypto.randomUUID(),
                indicator: cachedData.ioc,
                type: cachedData.ioc_type || 'domain',
                result: cachedData,
                timestamp: cachedData.timestamp || new Date().toISOString(),
                favorite: false
              });
            }
          }
        }
        
        console.log(`[AlienVaultOTX] Retrieved ${scanHistory.length} scans from cache`);
        return scanHistory.slice(0, limit);
      } catch (cacheError) {
        console.error('[AlienVaultOTX] Failed to get scan history from cache:', cacheError);
        return [];
      }
    }
  }

  async clearCache(): Promise<void> {
    otxCache.clear();
    console.log('[AlienVaultOTX] Cache cleared');
  }

  getRateLimitInfo() {
    const now = Date.now();
    return {
      remaining: this.rateLimitRemaining,
      resetTime: new Date(this.rateLimitReset),
      minutesUntilReset: Math.max(0, (this.rateLimitReset - now) / 60000)
    };
  }

  // Quick scan with minimal data
  async quickScan(indicator: string, type: OTXIndicatorType): Promise<OTXResult> {
    return this.scanIndicator({
      indicator,
      type,
      include_all_sections: false
    });
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  // Validate API key by making a simple request
  async validateApiKey(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }
    
    try {
      // Make a simple request to check API key - use Google DNS as test
      const testResult = await this.makeRequest<any>('indicators/IPv4/8.8.8.8/general');
      return !testResult.error;
    } catch (error) {
      console.error('[AlienVaultOTX] API key validation failed:', error);
      return false;
    }
  }

  // Batch scan multiple indicators
  async scanMultiple(requests: OTXScanRequest[]): Promise<OTXResult[]> {
    const results: OTXResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.scanIndicator(request);
        results.push(result);
        
        // Rate limiting: 10 requests/minute = 6 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 6000));
      } catch (error) {
        console.error(`[AlienVaultOTX] Failed to scan ${request.indicator}:`, error);
        // Add error result
        results.push(this.createEmptyResult(request.indicator, request.type, error instanceof Error ? error.message : 'Failed to scan'));
      }
    }
    
    return results;
  }
}

// Singleton instance
export const alienvaultOTXService = new AlienVaultOTXService();