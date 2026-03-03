// lib/threat-intel/unified-service.ts
import { VirusTotalService } from './virustotal-service';
import { MalwareBazaarService } from './malwarebazaar-service';
import { HybridAnalysisService } from './hybrid-analysis-service';
import { FilescanService } from './filescan-service';
import { AlienVaultOTXService } from './alienvault-service';
import { AbuseIPDBService } from './abuseipdb-service';
import { ThreatFoxService } from './threatfox-service';
import type { VTAnalysisResult } from './vt-types';
import type { MBAnalysisResult } from './malwarebazaar-types';
import type { HAAnalysisResult } from './ha-types';
import type { FileScanStatusResponse } from './filescan-types';
import type { OTXResult } from './otx-types';
import type { AbuseIPDBAnalysisResult } from './abuseipdb-types';
import type { ThreatFoxAnalysisResult } from './threatfox-types';

// Input type detection
export type InputType = 'ip' | 'domain' | 'url' | 'hash' | 'tag' | 'file' | 'unknown';

export interface UnifiedSearchResult {
  source: string;
  success: boolean;
  data: any;
  error?: string;
  timestamp: string;
}

export interface UnifiedResponse {
  input: string;
  inputType: InputType;
  results: UnifiedSearchResult[];
  summary: {
    totalServices: number;
    successful: number;
    failed: number;
    maliciousCount: number;
    suspiciousCount: number;
    cleanCount: number;
    unknownCount: number;
  };
}

class UnifiedThreatIntelService {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: UnifiedResponse; timestamp: number }> = new Map();
  private vtService: VirusTotalService;
  private mbService: MalwareBazaarService;
  private haService: HybridAnalysisService;
  private filescanService: FilescanService;
  private otxService: AlienVaultOTXService;
  private abuseipdbService: AbuseIPDBService;
  private threatfoxService: ThreatFoxService;

  constructor() {
    this.vtService = new VirusTotalService();
    this.mbService = new MalwareBazaarService();
    this.haService = new HybridAnalysisService();
    this.filescanService = new FilescanService();
    this.otxService = new AlienVaultOTXService();
    this.abuseipdbService = new AbuseIPDBService();
    this.threatfoxService = new ThreatFoxService();
  }

  /**
   * Detect the type of input (IP, domain, URL, hash, tag)
   */
  detectInputType(input: string): InputType {
    if (!input || typeof input !== 'string') return 'unknown';

    const trimmed = input.trim().toLowerCase();

    // IPv4 detection
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(trimmed)) return 'ip';

    // IPv6 detection (simplified)
    const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
    if (ipv6Regex.test(trimmed)) return 'ip';

    // URL detection
    try {
      new URL(trimmed);
      return 'url';
    } catch {
      // Not a URL, continue checking
    }

    // Domain detection (simple version)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(?:\.[a-zA-Z]{2,})+$/;
    if (domainRegex.test(trimmed) && trimmed.includes('.')) return 'domain';

    // Hash detection
    const hashPatterns = {
      md5: /^[a-f0-9]{32}$/i,
      sha1: /^[a-f0-9]{40}$/i,
      sha256: /^[a-f0-9]{64}$/i,
      sha512: /^[a-f0-9]{128}$/i
    };

    if (hashPatterns.md5.test(trimmed) || 
        hashPatterns.sha1.test(trimmed) || 
        hashPatterns.sha256.test(trimmed) || 
        hashPatterns.sha512.test(trimmed)) {
      return 'hash';
    }

    // If it contains spaces or special characters, likely a tag
    if (trimmed.includes(' ') || /[^a-zA-Z0-9._-]/.test(trimmed)) {
      return 'tag';
    }

    // Default to tag for simple strings
    return 'tag';
  }

  /**
   * Get applicable services for an input type
   */
  private getApplicableServices(inputType: InputType): string[] {
    const serviceMap: Record<InputType, string[]> = {
      ip: ['virustotal', 'abuseipdb', 'alienvault', 'threatfox'],
      domain: ['virustotal', 'alienvault', 'threatfox'],
      url: ['virustotal', 'filescan', 'hybridanalysis', 'threatfox'],
      hash: ['virustotal', 'malwarebazaar', 'hybridanalysis', 'filescan', 'alienvault'],
      tag: ['malwarebazaar', 'threatfox'],
      file: ['filescan', 'hybridanalysis'],
      unknown: ['virustotal', 'malwarebazaar', 'alienvault'] // Try common ones
    };

    return serviceMap[inputType] || [];
  }

  /**
   * Search across all relevant services
   */
  async unifiedSearch(input: string): Promise<UnifiedResponse> {
    // Check cache first
    const cached = this.cache.get(input);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const inputType = this.detectInputType(input);
    const applicableServices = this.getApplicableServices(inputType);
    
    console.log(`[Unified] Searching for "${input}" (type: ${inputType}) across:`, applicableServices);

    // Create search promises
    const searchPromises: Promise<UnifiedSearchResult>[] = [];

    if (applicableServices.includes('virustotal')) {
      searchPromises.push(this.searchVirusTotal(input, inputType));
    }
    if (applicableServices.includes('malwarebazaar')) {
      searchPromises.push(this.searchMalwareBazaar(input, inputType));
    }
    if (applicableServices.includes('hybridanalysis')) {
      searchPromises.push(this.searchHybridAnalysis(input, inputType));
    }
    if (applicableServices.includes('filescan')) {
      searchPromises.push(this.searchFilescan(input, inputType));
    }
    if (applicableServices.includes('alienvault')) {
      searchPromises.push(this.searchAlienVault(input, inputType));
    }
    if (applicableServices.includes('abuseipdb')) {
      searchPromises.push(this.searchAbuseIPDB(input, inputType));
    }
    if (applicableServices.includes('threatfox')) {
      searchPromises.push(this.searchThreatFox(input, inputType));
    }

    // Execute all searches in parallel with error handling
    const results = await Promise.allSettled(searchPromises);
    
    const processedResults: UnifiedSearchResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Get service name from the promise if possible, or use index
        const serviceName = this.getServiceNameFromIndex(index, applicableServices);
        return {
          source: serviceName,
          success: false,
          data: null,
          error: result.reason?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    });

    // Calculate summary
    const summary = this.calculateSummary(processedResults);

    const response: UnifiedResponse = {
      input,
      inputType,
      results: processedResults,
      summary
    };

    // Cache the result
    this.cache.set(input, { data: response, timestamp: Date.now() });

    return response;
  }

  /**
   * Search VirusTotal
   */
  private async searchVirusTotal(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      let data: VTAnalysisResult | null = null;
      
      switch (inputType) {
        case 'ip':
        case 'domain':
          data = await this.vtService.scanIndicator({
            indicator: input,
            type: 'ip' as any,
            include_relationships: true
          });
          break;
        case 'url':
          data = await this.vtService.scanIndicator({
            indicator: input,
            type: 'url' as any,
            include_relationships: false
          });
          break;
        case 'hash':
          data = await this.vtService.scanIndicator({
            indicator: input,
            type: 'hash' as any,
            include_relationships: true
          });
          break;
        default:
          // Try as hash first, then IP
          try {
            data = await this.vtService.scanIndicator({
              indicator: input,
              type: 'hash' as any,
              include_relationships: true
            });
          } catch {
            data = await this.vtService.scanIndicator({
              indicator: input,
              type: 'ip' as any,
              include_relationships: true
            });
          }
      }

      return {
        source: 'VirusTotal',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'VirusTotal',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query VirusTotal',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search MalwareBazaar
   */
  private async searchMalwareBazaar(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      let data: MBAnalysisResult | null = null;

      if (inputType === 'hash') {
        data = await this.mbService.searchIndicator({
          query: input,
          type: 'hash'
        });
      } else if (inputType === 'tag') {
        data = await this.mbService.searchIndicator({
          query: input,
          type: 'tag',
          limit: 10
        });
      } else {
        // Try as hash first
        try {
          data = await this.mbService.searchIndicator({
            query: input,
            type: 'hash'
          });
        } catch {
          // If not hash, try as tag
          data = await this.mbService.searchIndicator({
            query: input,
            type: 'tag',
            limit: 10
          });
        }
      }

      return {
        source: 'MalwareBazaar',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'MalwareBazaar',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query MalwareBazaar',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search HybridAnalysis
   */
  private async searchHybridAnalysis(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      let data: HAAnalysisResult | null = null;

      if (inputType === 'hash') {
        data = await this.haService.scanIndicator({
          indicator: input,
          type: 'hash',
          include_summary: true
        });
      } else if (inputType === 'url') {
        // URL scan would go here but not fully implemented in HA
        data = { error: 'URL scanning not implemented in demo' } as any;
      }

      return {
        source: 'HybridAnalysis',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'HybridAnalysis',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query HybridAnalysis',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search Filescan.io
   */
  private async searchFilescan(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      let data: FileScanStatusResponse | null = null;

      if (inputType === 'hash') {
        // Filescan API returns status, not direct report by hash in basic API
        // This would need a flow ID from a previous upload
        data = { 
          message: 'Hash lookup requires knowledge of a flow ID from previous upload. Use upload endpoint to scan files.',
          input 
        } as any;
      } else if (inputType === 'url') {
        data = { 
          message: 'URL scanning requires submission. Use scanUrl method for direct URL submission.',
          input 
        } as any;
      }

      return {
        source: 'Filescan.io',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'Filescan.io',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query Filescan.io',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search AlienVault OTX
   */
  private async searchAlienVault(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      let data: OTXResult | null = null;

      if (inputType === 'ip') {
        data = await this.otxService.scanIndicator({
          indicator: input,
          type: 'auto',
          include_all_sections: true
        });
      } else if (inputType === 'domain') {
        data = await this.otxService.scanIndicator({
          indicator: input,
          type: 'auto',
          include_all_sections: true
        });
      } else if (inputType === 'url') {
        data = await this.otxService.scanIndicator({
          indicator: input,
          type: 'auto',
          include_all_sections: true
        });
      } else if (inputType === 'hash') {
        data = await this.otxService.scanIndicator({
          indicator: input,
          type: 'auto',
          include_all_sections: true
        });
      } else {
        // Auto-detect type
        data = await this.otxService.scanIndicator({
          indicator: input,
          type: 'auto',
          include_all_sections: true
        });
      }

      return {
        source: 'AlienVault OTX',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'AlienVault OTX',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query AlienVault OTX',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search AbuseIPDB
   */
  private async searchAbuseIPDB(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      if (inputType !== 'ip') {
        throw new Error('AbuseIPDB only supports IP addresses');
      }

      const data = await this.abuseipdbService.checkIP(input);

      return {
        source: 'AbuseIPDB',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'AbuseIPDB',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query AbuseIPDB',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search ThreatFox (Abuse.ch)
   */
  private async searchThreatFox(input: string, inputType: InputType): Promise<UnifiedSearchResult> {
    try {
      const data = await this.threatfoxService.searchIndicator(input);

      return {
        source: 'ThreatFox',
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'ThreatFox',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to query ThreatFox',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate summary statistics from results
   */
  private calculateSummary(results: UnifiedSearchResult[]): UnifiedResponse['summary'] {
    let maliciousCount = 0;
    let suspiciousCount = 0;
    let cleanCount = 0;
    let unknownCount = 0;

    results.forEach(result => {
      if (!result.success || !result.data) {
        unknownCount++;
        return;
      }

      // Check each service's data for threat indicators
      switch (result.source) {
        case 'VirusTotal':
          const vtData = result.data as VTAnalysisResult;
          if (vtData.detection_stats) {
            if (vtData.detection_stats.malicious > 0) maliciousCount++;
            else if (vtData.detection_stats.suspicious > 0) suspiciousCount++;
            else if (vtData.detection_stats.harmless > 0) cleanCount++;
            else unknownCount++;
          }
          break;

        case 'AbuseIPDB':
          const abuseData = result.data as AbuseIPDBAnalysisResult;
          if (abuseData.confidence_score !== undefined) {
            if (abuseData.confidence_score > 50) maliciousCount++;
            else if (abuseData.confidence_score > 20) suspiciousCount++;
            else cleanCount++;
          }
          break;

        case 'MalwareBazaar':
          const mbData = result.data as MBAnalysisResult;
          if (mbData.found) {
            maliciousCount++;
          } else {
            cleanCount++;
          }
          break;

        case 'ThreatFox':
          const tfData = result.data as ThreatFoxAnalysisResult;
          if (tfData.query_status === 'ok' && tfData.id) {
            maliciousCount++;
          } else {
            unknownCount++;
          }
          break;

        case 'HybridAnalysis':
          const haData = result.data as HAAnalysisResult;
          if (haData.threat_level === 'malicious') maliciousCount++;
          else if (haData.threat_level === 'suspicious') suspiciousCount++;
          else if (haData.threat_level === 'no_specific_threat') cleanCount++;
          else unknownCount++;
          break;

        case 'AlienVault OTX':
          const otxData = result.data as OTXResult;
          if (otxData.pulse_count && otxData.pulse_count > 0) {
            maliciousCount++;
          } else {
            unknownCount++;
          }
          break;

        default:
          // For other services, if we got data, consider it potentially unknown
          if (result.data) {
            unknownCount++;
          }
      }
    });

    return {
      totalServices: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      maliciousCount,
      suspiciousCount,
      cleanCount,
      unknownCount
    };
  }

  /**
   * Helper to get service name from index (for error cases)
   */
  private getServiceNameFromIndex(index: number, applicableServices: string[]): string {
    const serviceMap: Record<string, string> = {
      virustotal: 'VirusTotal',
      malwarebazaar: 'MalwareBazaar',
      hybridanalysis: 'HybridAnalysis',
      filescan: 'Filescan.io',
      alienvault: 'AlienVault OTX',
      abuseipdb: 'AbuseIPDB',
      threatfox: 'ThreatFox'
    };

    const serviceKey = applicableServices[index];
    return serviceMap[serviceKey] || `Service ${index + 1}`;
  }

  /**
   * Upload file for scanning across multiple services
   */
  async uploadFile(file: File): Promise<UnifiedResponse> {
    const results: UnifiedSearchResult[] = [];

    // Try Filescan.io
    try {
      const filescanResult = await this.filescanService.uploadFile(file);
      results.push({
        source: 'Filescan.io',
        success: true,
        data: filescanResult,
        timestamp: new Date().toISOString()
      });

      // Poll for results (async)
      setTimeout(async () => {
        try {
          const fullResult = await this.filescanService.getScanStatus(filescanResult.flow_id);
          // Update cache or emit event here
        } catch (error) {
          console.error('Error polling Filescan:', error);
        }
      }, 1000);
    } catch (error) {
      results.push({
        source: 'Filescan.io',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to upload to Filescan.io',
        timestamp: new Date().toISOString()
      });
    }

    const summary = this.calculateSummary(results);

    return {
      input: file.name,
      inputType: 'file',
      results,
      summary
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const unifiedService = new UnifiedThreatIntelService();