// lib/threat-intel/virustotal-service.ts
import type { 
  VTIndicatorType, 
  VTAnalysisResult, 
  VTScanRequest,
  VTScanHistory,
  VTDetectionStats,
  VTFileInfo,
  VTNetworkInfo
} from './vt-types';
import { vtCache, vtDatabase } from './vt-cache';

export class VirusTotalService {
  private apiKey: string;
  private baseURL = 'https://www.virustotal.com/api/v3';
  private rateLimitRemaining = 4;
  private rateLimitReset = Date.now();

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY || '';
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      console.warn('VIRUSTOTAL_API_KEY not found in environment');
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<T> {
    // Check rate limiting
    const now = Date.now();
    if (now < this.rateLimitReset) {
      if (this.rateLimitRemaining <= 0) {
        throw new Error(`Rate limit exceeded. Resets at ${new Date(this.rateLimitReset).toISOString()}`);
      }
    } else {
      this.rateLimitRemaining = 4;
      this.rateLimitReset = now + 60000;
    }

    const url = new URL(`${this.baseURL}/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'x-apikey': this.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Update rate limit info
      const remaining = response.headers.get('x-ratelimit-remaining');
      const reset = response.headers.get('x-ratelimit-reset');
      
      if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
      if (reset) this.rateLimitReset = parseInt(reset, 10) * 1000;

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Indicator not found');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your VIRUSTOTAL_API_KEY.');
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private generateCacheKey(indicator: string, type: VTIndicatorType): string {
    return `${type}:${indicator.toLowerCase()}`;
  }

  async scanIndicator(request: VTScanRequest): Promise<VTAnalysisResult> {
    const { indicator, type, include_relationships = false } = request;
    
    // Check cache first
    const cacheKey = this.generateCacheKey(indicator, type);
    const cached = vtCache.get<VTAnalysisResult>(cacheKey);
    if (cached && !include_relationships) {
      return cached;
    }

    try {
      let result: VTAnalysisResult;

      switch (type) {
        case 'hash':
          result = await this.scanHash(indicator, include_relationships);
          break;
        case 'ip':
          result = await this.scanIP(indicator, include_relationships);
          break;
        case 'domain':
          result = await this.scanDomain(indicator, include_relationships);
          break;
        case 'url':
          result = await this.scanURL(indicator);
          break;
        case 'filename':
          result = await this.searchFilename(indicator);
          break;
        default:
          throw new Error(`Unsupported indicator type: ${type}`);
      }

      // Cache the result
      vtCache.set(cacheKey, result);

      // Save to history
      const scanHistory: VTScanHistory = {
        id: crypto.randomUUID(),
        indicator,
        type,
        result,
        timestamp: new Date().toISOString(),
        favorite: false
      };

      try {
        await vtDatabase.saveScan(scanHistory);
      } catch (dbError) {
        console.warn('Failed to save to database:', dbError);
      }

      return result;
    } catch (error) {
      console.error('VT scan failed:', error);
      throw error;
    }
  }

  private async scanHash(hash: string, includeRelationships: boolean): Promise<VTAnalysisResult> {
    const data = await this.makeRequest<any>(`/files/${hash}`);
    
    if (data.error) {
      return this.createNotFoundResult(hash, 'hash');
    }

    const result = this.parseFileResponse(data, hash);
    
    if (includeRelationships) {
      try {
        const [contactedIPs, contactedDomains, behaviors] = await Promise.all([
          this.getContactedIPs(hash),
          this.getContactedDomains(hash),
          this.getBehaviors(hash)
        ]);

        result.relationships = {
          contacted_ips: contactedIPs,
          contacted_domains: contactedDomains
        };

        if (behaviors) {
          result.behavioral_indicators = this.extractBehavioralIndicators(behaviors);
          result.sandbox_data = behaviors;
        }
      } catch (error) {
        console.warn('Failed to fetch relationships:', error);
      }
    }

    return result;
  }

  private async scanIP(ip: string, includeRelationships: boolean): Promise<VTAnalysisResult> {
    const data = await this.makeRequest<any>(`/ip_addresses/${ip}`);
    
    if (data.error) {
      return this.createNotFoundResult(ip, 'ip');
    }

    const result = this.parseIPResponse(data, ip);
    
    if (includeRelationships) {
      try {
        const [resolutions, files] = await Promise.all([
          this.getIPResolutions(ip),
          this.getCommunicatingFiles(ip)
        ]);

        result.relationships = {
          resolved_domains: resolutions,
          communicating_files: files
        };
      } catch (error) {
        console.warn('Failed to fetch relationships:', error);
      }
    }

    return result;
  }

  private async scanDomain(domain: string, includeRelationships: boolean): Promise<VTAnalysisResult> {
    const data = await this.makeRequest<any>(`/domains/${domain}`);
    
    if (data.error) {
      return this.createNotFoundResult(domain, 'domain');
    }

    const result = this.parseDomainResponse(data, domain);
    
    if (includeRelationships) {
      try {
        const [resolutions, subdomains] = await Promise.all([
          this.getDomainResolutions(domain),
          this.getSubdomains(domain)
        ]);

        result.relationships = {
          resolved_ips: resolutions,
          subdomains: subdomains
        };
      } catch (error) {
        console.warn('Failed to fetch relationships:', error);
      }
    }

    return result;
  }

  private async scanURL(url: string): Promise<VTAnalysisResult> {
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
    const data = await this.makeRequest<any>(`/urls/${urlId}`);
    
    if (data.error) {
      return this.createNotFoundResult(url, 'url');
    }

    return this.parseURLResponse(data, url);
  }

  private async searchFilename(filename: string): Promise<VTAnalysisResult> {
    const data = await this.makeRequest<any>(`/search`, {
      query: `name:"${filename}"`,
      limit: 5
    });

    if (data.error || !data.data || data.data.length === 0) {
      return this.createNotFoundResult(filename, 'filename');
    }

    // Return first match
    const firstResult = data.data[0];
    return this.scanHash(firstResult.id, false);
  }

  // Relationship fetching methods
  private async getContactedIPs(hash: string): Promise<string[]> {
    try {
      const data = await this.makeRequest<any>(`/files/${hash}/contacted_ips`, { limit: 10 });
      return this.extractIDs(data);
    } catch {
      return [];
    }
  }

  private async getContactedDomains(hash: string): Promise<string[]> {
    try {
      const data = await this.makeRequest<any>(`/files/${hash}/contacted_domains`, { limit: 10 });
      return this.extractIDs(data);
    } catch {
      return [];
    }
  }

  private async getBehaviors(hash: string): Promise<any> {
    try {
      const data = await this.makeRequest<any>(`/files/${hash}/behaviours`, { limit: 2 });
      return data.error ? null : data;
    } catch {
      return null;
    }
  }

  private async getIPResolutions(ip: string): Promise<string[]> {
    try {
      const data = await this.makeRequest<any>(`/ip_addresses/${ip}/resolutions`, { limit: 10 });
      return this.extractHostnames(data);
    } catch {
      return [];
    }
  }

  private async getCommunicatingFiles(ip: string): Promise<string[]> {
    try {
      const data = await this.makeRequest<any>(`/ip_addresses/${ip}/communicating_files`, { limit: 10 });
      return this.extractIDs(data);
    } catch {
      return [];
    }
  }

  private async getDomainResolutions(domain: string): Promise<string[]> {
    try {
      const data = await this.makeRequest<any>(`/domains/${domain}/resolutions`, { limit: 10 });
      return this.extractIPs(data);
    } catch {
      return [];
    }
  }

  private async getSubdomains(domain: string): Promise<string[]> {
    try {
      const data = await this.makeRequest<any>(`/domains/${domain}/subdomains`, { limit: 10 });
      return this.extractIDs(data);
    } catch {
      return [];
    }
  }

  // Parsing methods
  private parseFileResponse(data: any, hash: string): VTAnalysisResult {
    const attrs = data.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};
    
    const total = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0) as number;
    const detectionStats: VTDetectionStats = {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      timeout: stats.timeout || 0,
      total,
      detection_ratio: `${(stats.malicious || 0) + (stats.suspicious || 0)}/${total}`,
      threat_score: this.calculateThreatScore(stats)
    };

    const threatLevel = this.determineThreatLevel(detectionStats);
    const threatScore = detectionStats.threat_score;

    const fileInfo: VTFileInfo = {
      hash,
      filename: attrs.meaningful_name || attrs.names?.[0],
      size: attrs.size,
      type_description: attrs.type_description,
      first_seen: this.timestampToISO(attrs.first_submission_date),
      last_analysis: this.timestampToISO(attrs.last_analysis_date),
      reputation: attrs.reputation || 0,
      tags: attrs.tags || []
    };

    return {
      ioc: hash,
      ioc_type: 'hash',
      found: true,
      detection_stats: detectionStats,
      threat_level: threatLevel,
      threat_score: threatScore,
      file_info: fileInfo,
      behavioral_indicators: [],
      relationships: {},
      vt_url: `https://www.virustotal.com/gui/file/${hash}`,
      timestamp: new Date().toISOString(),
      raw_data: data
    };
  }

  private parseIPResponse(data: any, ip: string): VTAnalysisResult {
    const attrs = data.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};
    
    const total = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0) as number;
    const detectionStats: VTDetectionStats = {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      timeout: stats.timeout || 0,
      total,
      detection_ratio: `${(stats.malicious || 0) + (stats.suspicious || 0)}/${total}`,
      threat_score: this.calculateThreatScore(stats)
    };

    const threatLevel = this.determineThreatLevel(detectionStats);
    const threatScore = detectionStats.threat_score;

    const networkInfo: VTNetworkInfo = {
      asn: attrs.asn,
      as_owner: attrs.as_owner,
      country: attrs.country,
      network: attrs.network,
      categories: Object.values(attrs.categories || {}),
      registrar: undefined
    };

    return {
      ioc: ip,
      ioc_type: 'ip',
      found: true,
      detection_stats: detectionStats,
      threat_level: threatLevel,
      threat_score: threatScore,
      network_info: networkInfo,
      behavioral_indicators: [],
      relationships: {},
      vt_url: `https://www.virustotal.com/gui/ip-address/${ip}`,
      timestamp: new Date().toISOString(),
      raw_data: data
    };
  }

  private parseDomainResponse(data: any, domain: string): VTAnalysisResult {
    const attrs = data.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};
    
    const total = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0) as number;
    const detectionStats: VTDetectionStats = {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      timeout: stats.timeout || 0,
      total,
      detection_ratio: `${(stats.malicious || 0) + (stats.suspicious || 0)}/${total}`,
      threat_score: this.calculateThreatScore(stats)
    };

    const threatLevel = this.determineThreatLevel(detectionStats);
    const threatScore = detectionStats.threat_score;

    const networkInfo: VTNetworkInfo = {
      registrar: attrs.registrar,
      categories: Object.values(attrs.categories || {}),
      asn: undefined,
      as_owner: undefined,
      country: undefined,
      network: undefined
    };

    return {
      ioc: domain,
      ioc_type: 'domain',
      found: true,
      detection_stats: detectionStats,
      threat_level: threatLevel,
      threat_score: threatScore,
      network_info: networkInfo,
      behavioral_indicators: [],
      relationships: {},
      vt_url: `https://www.virustotal.com/gui/domain/${domain}`,
      timestamp: new Date().toISOString(),
      raw_data: data
    };
  }

  private parseURLResponse(data: any, url: string): VTAnalysisResult {
    const attrs = data.data?.attributes || {};
    const stats = attrs.last_analysis_stats || {};
    
    const total = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0) as number;
    const detectionStats: VTDetectionStats = {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      timeout: stats.timeout || 0,
      total,
      detection_ratio: `${(stats.malicious || 0) + (stats.suspicious || 0)}/${total}`,
      threat_score: this.calculateThreatScore(stats)
    };

    const threatLevel = this.determineThreatLevel(detectionStats);
    const threatScore = detectionStats.threat_score;

    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

    return {
      ioc: url,
      ioc_type: 'url',
      found: true,
      detection_stats: detectionStats,
      threat_level: threatLevel,
      threat_score: threatScore,
      behavioral_indicators: [],
      relationships: {},
      vt_url: `https://www.virustotal.com/gui/url/${urlId}`,
      timestamp: new Date().toISOString(),
      raw_data: data
    };
  }

  private createNotFoundResult(indicator: string, type: VTIndicatorType): VTAnalysisResult {
    const vtUrl = type === 'url' 
      ? `https://www.virustotal.com/gui/url/${Buffer.from(indicator).toString('base64').replace(/=/g, '')}`
      : `https://www.virustotal.com/gui/${type}/${indicator}`;

    const detectionStats: VTDetectionStats = {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      timeout: 0,
      total: 0,
      detection_ratio: '0/0',
      threat_score: 0
    };

    return {
      ioc: indicator,
      ioc_type: type,
      found: false,
      detection_stats: detectionStats,
      threat_level: 'unknown',
      threat_score: 0,
      behavioral_indicators: [],
      relationships: {},
      vt_url: vtUrl,
      timestamp: new Date().toISOString()
    };
  }

  // Utility methods
  private determineThreatLevel(stats: VTDetectionStats): VTAnalysisResult['threat_level'] {
    if (stats.total === 0) return 'unknown';
    
    const maliciousRatio = stats.malicious / stats.total;
    
    if (maliciousRatio >= 0.1 || stats.malicious >= 5) return 'high';
    if (maliciousRatio >= 0.05 || stats.malicious >= 2) return 'medium';
    if (stats.suspicious > 0 || stats.malicious > 0) return 'low';
    return 'clean';
  }

  private calculateThreatScore(stats: any): number {
    if (!stats || stats.total === undefined || stats.total === 0) return 0;
    
    const total = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0) as number;
    const score = ((stats.malicious || 0) * 1.0 + (stats.suspicious || 0) * 0.5) / total * 100;
    return Math.min(score, 100);
  }

  private extractBehavioralIndicators(behaviorData: any): string[] {
    if (!behaviorData.data) return [];
    
    const indicators: string[] = [];
    
    behaviorData.data.slice(0, 2).forEach((behavior: any) => {
      const summary = behavior.attributes?.summary || {};
      
      if (summary.files_written?.length) {
        indicators.push(`Files written: ${summary.files_written.length}`);
      }
      if (summary.files_dropped?.length) {
        indicators.push(`Files dropped: ${summary.files_dropped.length}`);
      }
      if (summary.registry_keys_set?.length) {
        indicators.push(`Registry modifications: ${summary.registry_keys_set.length}`);
      }
      if (summary.processes_created?.length) {
        indicators.push(`Processes created: ${summary.processes_created.length}`);
      }
      if (summary.dns_lookups?.length) {
        indicators.push(`DNS lookups: ${summary.dns_lookups.length}`);
      }
      
      if (summary.mitre_attack_techniques?.length) {
        summary.mitre_attack_techniques.slice(0, 3).forEach((technique: string) => {
          indicators.push(`MITRE: ${technique}`);
        });
      }
    });
    
    return indicators.slice(0, 10);
  }

  private extractIDs(data: any): string[] {
    if (!data.data) return [];
    return data.data.map((item: any) => item.id).filter(Boolean);
  }

  private extractHostnames(data: any): string[] {
    if (!data.data) return [];
    return data.data
      .map((item: any) => item.attributes?.host_name)
      .filter(Boolean);
  }

  private extractIPs(data: any): string[] {
    if (!data.data) return [];
    return data.data
      .map((item: any) => item.attributes?.ip_address)
      .filter(Boolean);
  }

  private timestampToISO(timestamp?: number): string | undefined {
    if (!timestamp) return undefined;
    return new Date(timestamp * 1000).toISOString();
  }

  // Public methods
  async getScanHistory(limit = 50): Promise<VTScanHistory[]> {
    try {
      return await vtDatabase.getScans(limit);
    } catch {
      return [];
    }
  }

  async clearCache(): Promise<void> {
    vtCache.clear();
  }

  getRateLimitInfo() {
    return {
      remaining: this.rateLimitRemaining,
      resetTime: new Date(this.rateLimitReset),
      minutesUntilReset: Math.max(0, (this.rateLimitReset - Date.now()) / 60000)
    };
  }
}

// Singleton instance
export const virusTotalService = new VirusTotalService();