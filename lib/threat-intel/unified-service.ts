  // Unified threat intelligence service - orchestrates queries across all integrated platforms
import { apiService } from '@/services/api/api.service';
import { calculateFileHash } from '@/lib/utils/hybrid-analysis.utils';

export type InputType = 'ip' | 'domain' | 'url' | 'hash' | 'tag' | 'unknown';

// Result from a single threat intelligence service
export interface ServiceResult {
  source: string;
  success: boolean;
  data: Record<string, any> | null;
  error?: string;
  timestamp: string;
}

export interface UnifiedResponse {
  query: string;
  type: InputType;
  results: ServiceResult[];
  timestamp: string;
  processingTime: number;
  rateLimitWarnings?: string[];
  summary?: {
    total: number;
    successful: number;
    failed: number;
    maliciousCount?: number;
    suspiciousCount?: number;
    cleanCount?: number;
    unknownCount?: number;
  };
}

function normalizeSourceKey(source: string): string {
  return source.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function dedupeResultsBySource(results: ServiceResult[]): ServiceResult[] {
  const deduped = new Map<string, ServiceResult>();

  for (const result of results) {
    deduped.set(normalizeSourceKey(result.source), result);
  }

  return Array.from(deduped.values());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollFileScanAnalysis(
  flowId: string,
  options?: { maxAttempts?: number; pollIntervalMs?: number }
): Promise<Record<string, any>> {
  const maxAttempts = options?.maxAttempts ?? 48;
  const pollIntervalMs = options?.pollIntervalMs ?? 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await apiService.filescanGetStatus(flowId);
    const state = String(status.state || '').toLowerCase();
    const allFinished = Boolean(status.allFinished);

    if (state === 'finished' && allFinished) {
      return await apiService.filescanGetFullAnalysis(flowId);
    }

    if (state === 'failed') {
      throw new Error('FileScan analysis failed');
    }

    await sleep(pollIntervalMs);
  }

  throw new Error('FileScan analysis polling timed out');
}

/**
 * Detect indicator type from input string
 */
export function detectIndicatorType(input: string): InputType {
  // Hash detection (MD5, SHA1, SHA256)
  if (/^[a-fA-F0-9]{32}$/.test(input)) return 'hash'; // MD5
  if (/^[a-fA-F0-9]{40}$/.test(input)) return 'hash'; // SHA1
  if (/^[a-fA-F0-9]{64}$/.test(input)) return 'hash'; // SHA256

  // IP detection (IPv4)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) {
    const parts = input.split('.');
    if (parts.every((part) => parseInt(part) <= 255)) {
      return 'ip';
    }
  }

  // IPv6 detection
  if (/^[a-fA-F0-9:]+$/.test(input) && input.includes(':')) {
    return 'ip';
  }

  // URL detection
  if (/^https?:\/\//.test(input)) return 'url';

  // Domain detection (must have dot and no spaces/special chars)
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input) && !input.includes('http')) {
    return 'domain';
  }

  // Tag detection (simple words)
  if (/^[a-zA-Z0-9_-]+$/.test(input) && input.length < 50) {
    return 'tag';
  }

  return 'unknown';
}

/**
 * Perform unified search across all threat intelligence services
 */
export async function performUnifiedSearch(indicator: string): Promise<UnifiedResponse> {
  const startTime = performance.now();
  const type = detectIndicatorType(indicator);

  try {
    // Call backend unified endpoint through apiService
    const response = await apiService.unifiedThreatSearch(indicator);
    
    const endTime = performance.now();
    
    // Backend response structure:
    // { input, input_type, results: {...}, summary: {...}, timestamp }
    // Flatten results dict to array of service results
    
    const resultsArray: any[] = [];
    if (response.results && typeof response.results === 'object') {
      for (const [key, value] of Object.entries(response.results)) {
        const result = value as any;
        if (result) {
          resultsArray.push({
            source: key,
            success: result.success,
            data: result.data,
            error: result.error,
            timestamp: result.timestamp,
          });
        }
      }
    }
    
    return {
      query: indicator,
      type: response.input_type as InputType || type,
      results: resultsArray,
      timestamp: response.timestamp || new Date().toISOString(),
      processingTime: Math.round(endTime - startTime),
      rateLimitWarnings: response.warnings || [],
      summary: response.summary ? {
        total: response.summary.total_services || 0,
        successful: response.summary.successful || 0,
        failed: response.summary.failed || 0,
        maliciousCount: response.summary.malicious_count || 0,
        suspiciousCount: response.summary.suspicious_count || 0,
        cleanCount: response.summary.clean_count || 0,
        unknownCount: response.summary.unknown_count || 0,
      } : { total: 0, successful: 0, failed: 0 },
    };
  } catch (error) {
    const endTime = performance.now();
    console.error('Unified search error:', error);
    throw new Error(`Unified search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload file for unified analysis across all supported sandbox services
 */
export async function uploadForUnifiedAnalysis(
  file: File,
  options?: Record<string, any>
): Promise<UnifiedResponse> {
  const startTime = performance.now();

  try {
    const fileHash = await calculateFileHash(file, 'sha256');
    if (!fileHash) {
      throw new Error('Failed to calculate file hash for unified analysis');
    }

    const fileScanPipeline = (async () => {
      const upload = await apiService.filescanUploadFile(file, {
        description: options?.description || `Unified analysis upload: ${file.name}`,
        osint: options?.osint !== false,
        extended_osint: options?.extended_osint !== false,
      });

      try {
        const analysis = await pollFileScanAnalysis(upload.flow_id, {
          maxAttempts: options?.filescanMaxAttempts,
          pollIntervalMs: options?.filescanPollIntervalMs,
        });

        return {
          upload,
          analysis,
          pending: false,
        };
      } catch (error) {
        return {
          upload,
          analysis: null,
          pending: true,
          pollingError: error instanceof Error ? error.message : 'FileScan polling failed',
        };
      }
    })();

    // Run hash-based intelligence lookups and sandbox submissions concurrently.
    const [hashLookupResult, filescanResult, hybridAnalysisResult] = await Promise.allSettled([
      performUnifiedSearch(fileHash),
      fileScanPipeline,
      apiService.scanHybridAnalysis({
        indicator: fileHash,
        type: 'hash',
        include_summary: true,
      }),
    ]);
    
    const endTime = performance.now();

    const now = new Date().toISOString();

    const hashLookupResults: ServiceResult[] =
      hashLookupResult.status === 'fulfilled' ? hashLookupResult.value.results : [];

    const filescanServiceResult: ServiceResult = filescanResult.status === 'fulfilled'
      ? {
          source: 'FileScan',
          success: true,
          data: {
            ...(filescanResult.value.analysis || {}),
            ...(filescanResult.value.upload || {}),
            analysis_pending: filescanResult.value.pending,
            polling_error: filescanResult.value.pollingError,
            file_name: file.name,
            file_hash: fileHash,
            file_size: file.size,
          },
          timestamp: now,
        }
      : {
          source: 'FileScan',
          success: false,
          data: null,
          error: filescanResult.reason instanceof Error
            ? filescanResult.reason.message
            : 'FileScan upload failed',
          timestamp: now,
        };

    const hybridAnalysisServiceResult: ServiceResult = hybridAnalysisResult.status === 'fulfilled'
      ? {
          source: 'Hybrid Analysis',
          success: true,
          data: {
            ...hybridAnalysisResult.value,
            file_name: file.name,
            file_hash: fileHash,
            file_size: file.size,
          },
          timestamp: now,
        }
      : {
          source: 'Hybrid Analysis',
          success: false,
          data: null,
          error: hybridAnalysisResult.reason instanceof Error
            ? hybridAnalysisResult.reason.message
            : 'Hybrid Analysis scan failed',
          timestamp: now,
        };

    const results = dedupeResultsBySource([
      ...hashLookupResults,
      filescanServiceResult,
      hybridAnalysisServiceResult,
    ]);

    const successful = results.filter((result) => result.success).length;

    return {
      query: fileHash,
      type: 'hash',
      results,
      timestamp: now,
      processingTime: Math.round(endTime - startTime),
      summary: {
        total: results.length,
        successful,
        failed: results.length - successful,
      },
    };
  } catch (error) {
    console.error('Unified upload error:', error);
    throw new Error(`Unified upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Unified service - wraps all threat intelligence operations
 * Provides a single interface for component integration
 */
export const unifiedService = {
  /**
   * Detect the type of indicator from input string
   */
  detectInputType: (input: string): InputType => {
    return detectIndicatorType(input);
  },

  /**
   * Perform unified search across all threat intelligence services
   */
  unifiedSearch: async (indicator: string): Promise<UnifiedResponse> => {
    const response = await performUnifiedSearch(indicator);
    
    // Use backend summary if available, otherwise calculate
    if (response.summary && response.summary.total > 0) {
      return response;
    }
    
    // Fallback: calculate summary from results
    const total = response.results.length;
    const successful = response.results.filter(r => r.success).length;
    
    return {
      ...response,
      summary: {
        total,
        successful,
        failed: total - successful,
      },
    };
  },

  /**
   * Upload file for unified analysis
   */
  uploadFile: async (file: File, options?: Record<string, any>): Promise<UnifiedResponse> => {
    const response = await uploadForUnifiedAnalysis(file, options);

    if (response.summary && response.summary.total > 0) {
      return response;
    }
    
    // Calculate summary statistics
    const total = response.results.length;
    const successful = response.results.filter(r => r.success).length;
    
    return {
      ...response,
      summary: {
        total,
        successful,
        failed: total - successful,
      },
    };
  },
};
