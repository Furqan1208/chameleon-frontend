// lib/threat-intel/urlhaus-service.ts - COMPLETE FIX
import type {
  URLhausAnalysisResult,
  URLhausIndicatorType,
  URLhausURLRequest,
  URLhausHashRequest,
  URLhausHostRequest,
  URLhausTagRequest,
  URLhausTagResponse
} from './urlhaus-types';

export class URLhausService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_THREATFOX_URLHAUS_API_KEY || '';
    console.log('[URLhaus] Service initialized with API key:', this.apiKey ? 'Yes' : 'No (public API)');
  }

  private async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`[URLhaus] Making request to ${endpoint} with data:`, data);
    
    const url = `/api/urlhaus-proxy/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        apiKey: this.apiKey
      }),
    });
    
    console.log(`[URLhaus] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[URLhaus] HTTP error ${response.status}:`, errorText);
      throw new Error(`URLhaus API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`[URLhaus] Response data (first 500 chars):`, JSON.stringify(result).substring(0, 500));
    
    return result;
  }

  private detectIndicatorType(indicator: string): URLhausIndicatorType {
    const lowerIndicator = indicator.toLowerCase().trim();
    
    if (lowerIndicator.startsWith('http://') || lowerIndicator.startsWith('https://')) {
      return 'url';
    }
    
    if (/^[a-f0-9]{64}$/.test(lowerIndicator)) {
      return 'hash';
    }
    if (/^[a-f0-9]{32}$/.test(lowerIndicator)) {
      return 'hash';
    }
    
    if (/^[a-zA-Z0-9_\-]+$/.test(lowerIndicator) && lowerIndicator.length > 3) {
      return 'tag';
    }
    
    return 'host';
  }

  async checkIndicator(indicator: string): Promise<URLhausAnalysisResult> {
    const indicatorType = this.detectIndicatorType(indicator);
    console.log(`[URLhaus] Checking ${indicatorType}: ${indicator}`);
    
    try {
      let result: any;
      
      switch (indicatorType) {
        case 'url':
          result = await this.checkURL(indicator);
          break;
        case 'hash':
          result = await this.checkHash(indicator);
          break;
        case 'host':
          result = await this.checkHost(indicator);
          break;
        case 'tag':
          result = await this.checkTag(indicator);
          break;
        default:
          result = await this.checkURL(indicator);
      }
      
      // Ensure raw_data contains the full response
      return {
        ...result,
        raw_data: result, // CRITICAL: Store the complete response
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[URLhaus] Check failed for ${indicator}:`, error);
      
      return {
        query_status: 'unknown',
        raw_data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      } as URLhausAnalysisResult;
    }
  }

  async checkURL(url: string): Promise<any> {
    const data: URLhausURLRequest = { url };
    return this.makeRequest<any>('url', data);
  }

  async checkHash(hash: string): Promise<any> {
    const data: URLhausHashRequest = { hash };
    return this.makeRequest<any>('payload', data);
  }

  async checkHost(host: string): Promise<any> {
    const data: URLhausHostRequest = { host };
    return this.makeRequest<any>('host', data);
  }

  async checkTag(tag: string): Promise<any> {
    const data: URLhausTagRequest = { tag };
    const response = await this.makeRequest<URLhausTagResponse>('tag', data);
    
    return {
      query_status: response.query_status,
      tag: response.tag,
      urls: response.urls,
      raw_data: response
    };
  }

  async downloadMalware(sha256: string): Promise<Blob> {
    console.log(`[URLhaus] Downloading malware: ${sha256}`);
    
    const response = await fetch(`/api/urlhaus-proxy/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha256,
        apiKey: this.apiKey
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    return await response.blob();
  }

  getThreatLevel(threat?: string): 'high' | 'medium' | 'low' | 'clean' {
    if (!threat) return 'low';
    
    const lowerThreat = threat.toLowerCase();
    
    if (lowerThreat.includes('malware_download') || lowerThreat.includes('botnet')) {
      return 'high';
    }
    if (lowerThreat.includes('phishing') || lowerThreat.includes('spam')) {
      return 'medium';
    }
    return 'low';
  }

  clearCache(): void {
    console.log('[URLhaus] Cache cleared');
  }
}

export const urlhausService = new URLhausService();