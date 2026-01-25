// lib/threat-intel/threatfox-service.ts - COMPLETE FIX
import type {
  ThreatFoxAnalysisResult,
  ThreatFoxIndicatorType,
  ThreatFoxSearchRequest,
  ThreatFoxSearchResponse
} from './threatfox-types';

export class ThreatFoxService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_THREATFOX_URLHAUS_API_KEY || '';
    console.log('[ThreatFox] Service initialized with API key:', this.apiKey ? 'Yes' : 'No (public API)');
  }

  private isHash(value: string): 'md5' | 'sha256' | null {
    const v = value.toLowerCase().trim();
    if (/^[a-f0-9]{32}$/.test(v)) return 'md5';
    if (/^[a-f0-9]{64}$/.test(v)) return 'sha256';
    return null;
  }

  private isNumber(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  private async makeRequest<T>(data: ThreatFoxSearchRequest): Promise<T> {
    console.log(`[ThreatFox] Making request with data:`, data);
    
    const response = await fetch('/api/threatfox-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        apiKey: this.apiKey
      }),
    });
    
    console.log(`[ThreatFox] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ThreatFox] HTTP error ${response.status}:`, errorText);
      throw new Error(`ThreatFox API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`[ThreatFox] Response data:`, result);
    
    return result;
  }

  async searchIndicator(indicator: string): Promise<ThreatFoxAnalysisResult> {
    console.log(`[ThreatFox] Searching for indicator: ${indicator}`);
    
    let request: ThreatFoxSearchRequest;
    
    const hashType = this.isHash(indicator);
    if (hashType) {
      request = {
        query: 'search_hash',
        hash: indicator
      };
    } else if (this.isNumber(indicator)) {
      request = {
        query: 'ioc',
        id: parseInt(indicator, 10)
      };
    } else {
      request = {
        query: 'search_ioc',
        search_term: indicator,
        exact_match: true
      };
    }
    
    try {
      const response = await this.makeRequest<ThreatFoxSearchResponse>(request);
      
      if (response.query_status === 'ok' && response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          ...result,
          raw_data: response, // CRITICAL: Store complete response
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          query_status: response.query_status || 'no_results',
          raw_data: response, // CRITICAL: Store complete response even if no results
          timestamp: new Date().toISOString()
        } as ThreatFoxAnalysisResult;
      }
    } catch (error) {
      console.error(`[ThreatFox] Search failed for ${indicator}:`, error);
      
      return {
        query_status: 'unknown',
        raw_data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      } as ThreatFoxAnalysisResult;
    }
  }

  getThreatLevel(threatType?: string, confidenceLevel?: number): 'high' | 'medium' | 'low' | 'unknown' {
    if (!threatType) return 'unknown';
    
    const lowerThreat = threatType.toLowerCase();
    
    let level: 'high' | 'medium' | 'low' | 'unknown' = 'low';
    
    if (lowerThreat.includes('botnet_cc') || lowerThreat.includes('c2')) {
      level = 'high';
    } else if (lowerThreat.includes('payload_delivery') || lowerThreat.includes('malware_delivery')) {
      level = 'medium';
    }
    
    if (confidenceLevel) {
      if (confidenceLevel >= 90 && level !== 'high') level = 'high';
      else if (confidenceLevel >= 70 && level !== 'high') level = 'medium';
    }
    
    return level;
  }

  clearCache(): void {
    console.log('[ThreatFox] Cache cleared');
  }
}

export const threatFoxService = new ThreatFoxService();