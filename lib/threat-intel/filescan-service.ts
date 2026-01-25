import type {
  FileScanUploadResponse,
  FileScanOptions,
  FileScanStatusResponse,
  FileScanFileItem,
  FileScanSimilaritySearch,
  FileScanSimilarityResult,
  AnalysisResult,
  DetailedAnalysisResult,
  FileScanReport,
  FileScanVerdictInfo
} from './filescan-types';

const API_BASE = '/api/filescan';

export class FilescanService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_FILESCAN_API_KEY || '';
    if (!this.apiKey && typeof window !== 'undefined') {
      console.warn('[Filescan] API key not configured. Please add NEXT_PUBLIC_FILESCAN_API_KEY to your environment variables.');
    }
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.set('endpoint', endpoint);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value);
        }
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        'accept': 'application/json',
      },
    };

    if (body) {
      options.body = body;
    }

    try {
      console.log(`[Filescan] Making ${method} request to: ${url.toString()}`);
      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to Filescan API. Please check your network connection.');
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async uploadFile(
    file: File,
    options?: Partial<FileScanOptions>,
    description?: string,
    tags?: string[],
    propagateTags?: boolean
  ): Promise<FileScanUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    if (description) formData.append('description', description);
    if (tags && tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    if (propagateTags !== undefined) {
      formData.append('propagate_tags', propagateTags.toString());
    }

    // Add scan options
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
    }

    console.log(`[Filescan] Uploading file: ${file.name} (${file.size} bytes)`);

    return this.makeRequest<FileScanUploadResponse>('scan-file', undefined, 'POST', formData);
  }

  async scanUrl(
    url: string,
    options?: Partial<FileScanOptions>,
    description?: string,
    tags?: string[],
    propagateTags?: boolean
  ): Promise<FileScanUploadResponse> {
    const formData = new FormData();
    formData.append('url', url);

    // Add metadata
    if (description) formData.append('description', description);
    if (tags && tags.length > 0) {
      formData.append('tags', JSON.stringify(tags));
    }
    if (propagateTags !== undefined) {
      formData.append('propagate_tags', propagateTags.toString());
    }

    // Add scan options
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
    }

    console.log(`[Filescan] Scanning URL: ${url}`);

    return this.makeRequest<FileScanUploadResponse>('scan-url', undefined, 'POST', formData);
  }

  async getScanStatus(flowId: string, filter?: string | string[]): Promise<FileScanStatusResponse> {
    const params: Record<string, string> = { flowId };
    if (filter) {
      if (Array.isArray(filter)) {
        params.filter = JSON.stringify(filter);
      } else {
        params.filter = filter;
      }
    }

    console.log(`[Filescan] Getting scan status for flow: ${flowId}`);
    return this.makeRequest<FileScanStatusResponse>('scan-status', params);
  }

  async getReport(reportId: string, fileHash: string, filter?: string | string[]): Promise<FileScanStatusResponse> {
    const params: Record<string, string> = { reportId, fileHash };

    if (filter) {
      if (Array.isArray(filter)) {
        // If filter is already an array, stringify it
        params.filter = JSON.stringify(filter);
      } else if (filter.startsWith('[') && filter.endsWith(']')) {
        // If it's already JSON stringified
        params.filter = filter;
      } else {
        // If it's a comma-separated string, convert to array first
        const filterArray = filter.split(',').map(f => f.trim());
        params.filter = JSON.stringify(filterArray);
      }
    }

    console.log(`[Filescan] Getting report: ${reportId}/${fileHash} with filter: ${params.filter}`);

    try {
      const response = await this.makeRequest<any>('report', params);

      // Handle different response structures
      if (response.reports) {
        return response as FileScanStatusResponse;
      }

      // If the response doesn't have the expected structure, wrap it
      return {
        flowId: '',
        allFinished: true,
        allFilesDownloadFinished: true,
        allAdditionalStepsDone: true,
        reportsAmount: 1,
        priority: { applied: 0, max_possible: 0 },
        pollPause: 0,
        state: 'finished',
        scanStartedDate: new Date().toISOString(),
        reports: {
          [reportId]: response as FileScanReport
        }
      };
    } catch (error) {
      console.error('[Filescan] Error getting report:', error);
      throw error;
    }
  }

  async getDetailedReport(reportId: string, fileHash: string): Promise<FileScanStatusResponse> {
    console.log(`[Filescan] Getting detailed report: ${reportId}/${fileHash}`);

    try {
      // Use only the filters that we know work for all file types
      const safeFilters = ['general', 'finalVerdict', 'allSignalGroups', 'allTags', 'taskReference', 'subtaskReferences'];

      console.log(`[Filescan] Using safe filters: ${JSON.stringify(safeFilters)}`);
      const safeReport = await this.getReport(reportId, fileHash, safeFilters);

      if (!safeReport.reports || !safeReport.reports[reportId]) {
        throw new Error('Safe report not found');
      }

      console.log('[Filescan] Detailed report compiled successfully');
      console.log('[Filescan] Available keys in compiled report:', Object.keys(safeReport.reports[reportId]));

      return safeReport;
    } catch (error) {
      console.error('[Filescan] Failed to get detailed report:', error);
      throw error;
    }
  }

  async similaritySearch(
    hash: string,
    minSimilarity: number = 0,
    verdict?: string,
    tags?: string[]
  ): Promise<FileScanSimilaritySearch> {
    const params: Record<string, string> = {
      hash,
      minSimilarity: minSimilarity.toString()
    };

    if (verdict) params.verdict = verdict;
    if (tags && tags.length > 0) {
      params.tags = JSON.stringify(tags);
    }

    console.log(`[Filescan] Searching similar files for hash: ${hash}`);
    return this.makeRequest<FileScanSimilaritySearch>('similarity-search', params);
  }

  async getFullAnalysis(flowId: string): Promise<AnalysisResult> {
    console.log(`[Filescan] Getting full analysis for flow: ${flowId}`);

    // Get scan status - this contains the verdict
    const status = await this.getScanStatus(flowId);
    console.log('[Filescan] Status response received');

    if (!status.reports || Object.keys(status.reports).length === 0) {
      throw new Error('No reports found for this scan');
    }

    // Get the first report
    const reportId = Object.keys(status.reports)[0];
    const statusReport = status.reports[reportId];

    // Debug log to see the actual structure
    console.log('[Filescan] Status report structure:', {
      hasFile: !!statusReport.file,
      fileKeys: statusReport.file ? Object.keys(statusReport.file) : 'no file',
      statusReportKeys: Object.keys(statusReport)
    });

    // Extract file information - handle different possible structures
    let fileHash = '';
    let fileName = 'Unknown';
    let fileType = 'unknown';
    let fileSize: number | undefined;

    // Use type assertion to access dynamic properties
    const statusReportAny = statusReport as any;

    if (statusReport.file?.hash) {
      // Standard structure
      fileHash = statusReport.file.hash;
      fileName = statusReport.file.name || fileName;
      fileType = statusReport.file.type || fileType;
      fileSize = statusReport.file.size;
    } else if (statusReportAny.hash) {
      // Alternative structure where hash is at root
      fileHash = statusReportAny.hash;
    } else if (statusReportAny.inputFileHash) {
      // Another alternative structure
      fileHash = statusReportAny.inputFileHash;
    }

    // Try to get filename from other sources
    if (!fileName || fileName === 'Unknown') {
      if (statusReportAny.filename) {
        fileName = statusReportAny.filename;
      } else if (statusReportAny.name) {
        fileName = statusReportAny.name;
      }
    }

    if (!fileHash) {
      console.error('[Filescan] Could not find file hash in report:', statusReport);
      throw new Error('Could not find file hash in report');
    }

    console.log(`[Filescan] Found report: ${reportId} for file: ${fileHash}`);
    console.log('[Filescan] File details:', { fileName, fileType, fileSize });

    // Get basic report details for additional information - use safe filters
    let fullReportData = statusReport;
    try {
      // Use only safe filters that work for all file types
      const fullReport = await this.getReport(reportId, fileHash, ['general', 'finalVerdict']);
      console.log('[Filescan] Basic report response received');
      if (fullReport.reports && fullReport.reports[reportId]) {
        fullReportData = fullReport.reports[reportId];
        // Update file info from full report if available
        if (fullReportData.file?.hash) {
          fileHash = fullReportData.file.hash;
          fileName = fullReportData.file.name || fileName;
          fileType = fullReportData.file.type || fileType;
          fileSize = fullReportData.file.size;
        }
      }
    } catch (error) {
      console.warn('[Filescan] Could not fetch basic report, using status data:', error);
    }

    // Get extracted files - handle gracefully for simple files
    let extractedFiles: FileScanFileItem[] = [];
    try {
      // For simple files like EICAR (type: "other"), skip the extracted files request
      // as it causes 500 errors
      if (fileType && fileType.toLowerCase() !== 'other' && fileType.toLowerCase() !== 'text') {
        // Only try for non-simple file types
        const detailedReport = await this.getReport(reportId, fileHash, ['f:extractedFiles']);
        console.log('[Filescan] Trying to get extracted files via filter');

        if (detailedReport.reports && detailedReport.reports[reportId]) {
          const reportData = detailedReport.reports[reportId] as any;
          // Try different possible locations for extracted files
          if (reportData.extractedFiles && Array.isArray(reportData.extractedFiles)) {
            extractedFiles = reportData.extractedFiles;
          } else if (reportData.f?.extractedFiles && Array.isArray(reportData.f.extractedFiles)) {
            extractedFiles = reportData.f.extractedFiles;
          } else if (reportData.fileScanResults?.extractedFiles && Array.isArray(reportData.fileScanResults.extractedFiles)) {
            extractedFiles = reportData.fileScanResults.extractedFiles;
          }
        }
      } else {
        console.log('[Filescan] Skipping extracted files request for file type:', fileType);
      }
      console.log(`[Filescan] Extracted files: ${extractedFiles.length}`);
    } catch (error) {
      console.warn('[Filescan] Could not fetch extracted files:', error);
      // Don't throw, just continue with empty extracted files
    }

    // Get similar files with proper typing
    let similarFiles: FileScanSimilarityResult[] = [];
    try {
      const similarity = await this.similaritySearch(fileHash);
      similarFiles = similarity.most_similar || [];
      console.log(`[Filescan] Similar files: ${similarFiles.length}`);
    } catch (error) {
      console.warn('[Filescan] Could not fetch similar files:', error);
    }

    // Use the verdict from the status response (which has it)
    // If not available in status, check full report data
    const finalVerdict = statusReport.finalVerdict || fullReportData.finalVerdict;

    if (!finalVerdict) {
      console.error('[Filescan] Missing finalVerdict in both status and report data');
      console.error('[Filescan] Available keys in statusReport:', Object.keys(statusReport));
      console.error('[Filescan] Available keys in fullReportData:', Object.keys(fullReportData));
      throw new Error('Invalid report data: missing finalVerdict');
    }

    // Construct the file object
    const fileInfo = {
      name: fileName,
      hash: fileHash,
      type: fileType,
      size: fileSize
    };

    console.log('[Filescan] Constructed file info:', fileInfo);

    const result: AnalysisResult = {
      flowId: status.flowId,
      scanId: reportId,
      file: fileInfo,
      state: status.state,
      verdict: finalVerdict,
      interestingScore: statusReportAny.interestingScore,
      vtRate: statusReportAny.vtRate,
      created_date: fullReportData.created_date || statusReportAny.created_date || new Date().toISOString(),
      scanOptions: fullReportData.scanOptions || statusReportAny.scanOptions || {},
      chatGptSummary: fullReportData.chatGptSummary || statusReportAny.chatGptSummary,
      extractedFiles,
      similarFiles,
      report_url: `https://www.filescan.io/reports/${reportId}/${fileHash}`,
      scan_url: `https://www.filescan.io/scan/${flowId}`,
      timestamp: new Date().toISOString(),
    };

    console.log('[Filescan] Final result object created:', {
      verdict: result.verdict.verdict,
      hasFile: !!result.file,
      fileHash: result.file?.hash
    });
    return result;
  }

  // In D:\FYP\Chameleon Frontend\lib\threat-intel\filescan-service.ts
  // Replace the getDetailedAnalysis method with this:

  async getDetailedAnalysis(reportId: string, fileHash: string): Promise<DetailedAnalysisResult> {
    console.log(`[Filescan] Getting detailed analysis for: ${reportId}/${fileHash}`);

    try {
      // Use comprehensive filters to get all available data
      const comprehensiveFilters = [
        'general',
        'finalVerdict',
        'allSignalGroups',
        'allTags',
        'taskReference',
        'subtaskReferences',
        'f:all',  // File analysis data
        'o:all',  // OSINT data
        'v:all',  // Visualization data
        'y:all',  // YARA matches
        'n:all',  // Network data
        'fd:all', // File download data
        'wi:all', // WHOIS data
        'dr:all', // Domain resolution
        's:all',  // Strings
        'r:all',  // Resources
        'i:all',  // Imports
        'e:all',  // Exports
        'p:all'   // PE info
      ];

      console.log(`[Filescan] Using comprehensive filters: ${comprehensiveFilters.length} filters`);

      const detailedReport = await this.getReport(reportId, fileHash, comprehensiveFilters);

      if (!detailedReport.reports || !detailedReport.reports[reportId]) {
        throw new Error('Detailed report not found');
      }

      const reportData = detailedReport.reports[reportId] as any;

      // Debug: Log available data sections
      console.log('[Filescan] Available report data sections:', {
        hasFileAnalysis: !!reportData.f,
        hasOSINT: !!reportData.o,
        hasYARA: !!reportData.y || !!reportData.f?.yara_matches,
        hasNetwork: !!reportData.n,
        hasStrings: !!reportData.s,
        hasImports: !!reportData.i,
        hasExports: !!reportData.e,
        hasPEInfo: !!reportData.p,
        hasSignalGroups: !!reportData.allSignalGroups,
        hasTags: !!reportData.allTags,
        reportDataKeys: Object.keys(reportData)
      });

      // Extract data from different sections
      const fileAnalysis = reportData.f || {};
      const osintData = reportData.o || {};
      const yaraData = reportData.y || fileAnalysis.yara_matches || [];
      const networkData = reportData.n || {};
      const stringsData = reportData.s || [];
      const importsData = reportData.i || [];
      const exportsData = reportData.e || [];
      const peInfoData = reportData.p || {};
      const resourcesData = reportData.r || [];

      // Extract network indicators
      const networkConnections = networkData.network_connections || networkData.connections || [];
      const extractedUrls = osintData.extracted_urls || networkData.urls || [];
      const extractedDomains = osintData.extracted_domains || networkData.domains || [];
      const extractedIps = osintData.extracted_ips || networkData.ips || [];

      // Extract behavioral analysis and MITRE techniques
      const signalGroups = reportData.allSignalGroups || [];
      const mitreTechniques = signalGroups
        .filter((sg: any) => sg.mitre_techniques && Array.isArray(sg.mitre_techniques))
        .flatMap((sg: any) => sg.mitre_techniques);

      // Extract extracted files
      const extractedFiles = fileAnalysis.extracted_files || [];

      // Build the detailed result
      const detailedResult: DetailedAnalysisResult = {
        // Basic info
        reportId,
        fileHash,

        // File information
        file: reportData.file || { name: '', hash: fileHash, type: '' },

        // Verdict - should always be available
        verdict: reportData.finalVerdict || { verdict: 'UNKNOWN', threatLevel: 0, confidence: 0 },

        // Scan information
        scanOptions: reportData.scanOptions || {} as FileScanOptions,
        scanEngine: reportData.scanEngine,
        created_date: reportData.created_date || new Date().toISOString(),

        // Signal groups and tags
        signalGroups: signalGroups,
        tags: reportData.allTags || reportData.tags || [],

        // Task references
        taskReference: reportData.taskReference,
        subtaskReferences: reportData.subtaskReferences || [],

        // Analysis results
        yaraMatches: Array.isArray(yaraData) ? yaraData : [],
        extractedFiles: Array.isArray(extractedFiles) ? extractedFiles : [],
        networkConnections: Array.isArray(networkConnections) ? networkConnections : [],
        extractedUrls: Array.isArray(extractedUrls) ? extractedUrls : [],
        extractedDomains: Array.isArray(extractedDomains) ? extractedDomains : [],
        extractedIps: Array.isArray(extractedIps) ? extractedIps : [],
        strings: Array.isArray(stringsData) ? stringsData : [],
        resources: Array.isArray(resourcesData) ? resourcesData : [],
        osintResults: osintData,
        visualization: reportData.v || {},
        mitreTechniques: Array.isArray(mitreTechniques) ? mitreTechniques : [],
        behavioralAnalysis: fileAnalysis.behavioral_analysis || {},
        peInfo: peInfoData,
        imports: Array.isArray(importsData) ? importsData : [],
        exports: Array.isArray(exportsData) ? exportsData : [],
        sections: peInfoData.sections || [],

        // Raw detailed data
        raw_detailed_data: reportData,

        // URLs
        report_url: `https://www.filescan.io/reports/${reportId}/${fileHash}`,
        timestamp: new Date().toISOString(),
      };

      console.log('[Filescan] Detailed analysis created successfully:', {
        verdict: detailedResult.verdict.verdict,
        yaraMatches: detailedResult.yaraMatches?.length || 0,
        extractedFiles: detailedResult.extractedFiles?.length || 0,
        networkConnections: detailedResult.networkConnections?.length || 0,
        mitreTechniques: detailedResult.mitreTechniques?.length || 0,
        strings: detailedResult.strings?.length || 0,
        signalGroups: detailedResult.signalGroups?.length || 0
      });

      return detailedResult;

    } catch (error) {
      console.error('[Filescan] Failed to get detailed analysis:', error);

      // Fallback: Try with minimal filters
      try {
        console.log('[Filescan] Trying fallback with minimal filters...');
        const minimalFilters = ['general', 'finalVerdict', 'allSignalGroups', 'allTags'];
        const minimalReport = await this.getReport(reportId, fileHash, minimalFilters);

        if (minimalReport.reports && minimalReport.reports[reportId]) {
          const minimalData = minimalReport.reports[reportId];

          const fallbackResult: DetailedAnalysisResult = {
            reportId,
            fileHash,
            file: minimalData.file || { name: '', hash: fileHash, type: '' },
            verdict: minimalData.finalVerdict || { verdict: 'UNKNOWN', threatLevel: 0, confidence: 0 },
            scanOptions: minimalData.scanOptions || {} as FileScanOptions,
            created_date: minimalData.created_date || new Date().toISOString(),
            signalGroups: minimalData.allSignalGroups || [],
            tags: minimalData.allTags || [],
            taskReference: minimalData.taskReference,
            subtaskReferences: minimalData.subtaskReferences || [],
            yaraMatches: [],
            extractedFiles: [],
            networkConnections: [],
            extractedUrls: [],
            extractedDomains: [],
            extractedIps: [],
            strings: [],
            resources: [],
            osintResults: {},
            visualization: {},
            mitreTechniques: [],
            behavioralAnalysis: {},
            peInfo: {},
            imports: [],
            exports: [],
            sections: [],
            report_url: `https://www.filescan.io/reports/${reportId}/${fileHash}`,
            timestamp: new Date().toISOString(),
          };

          console.warn('[Filescan] Returning minimal detailed analysis');
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.error('[Filescan] Fallback also failed:', fallbackError);
      }

      // Return empty result as last resort
      const emptyResult: DetailedAnalysisResult = {
        reportId,
        fileHash,
        file: { name: '', hash: fileHash, type: '' },
        verdict: { verdict: 'UNKNOWN', threatLevel: 0, confidence: 0 },
        scanOptions: {} as FileScanOptions,
        created_date: new Date().toISOString(),
        signalGroups: [],
        tags: [],
        yaraMatches: [],
        extractedFiles: [],
        networkConnections: [],
        extractedUrls: [],
        extractedDomains: [],
        extractedIps: [],
        strings: [],
        resources: [],
        osintResults: {},
        visualization: {},
        mitreTechniques: [],
        behavioralAnalysis: {},
        peInfo: {},
        imports: [],
        exports: [],
        sections: [],
        subtaskReferences: [],
        report_url: `https://www.filescan.io/reports/${reportId}/${fileHash}`,
        timestamp: new Date().toISOString(),
      };

      console.error('[Filescan] Returning empty detailed analysis');
      return emptyResult;
    }
  }

  async pollUntilComplete(
    flowId: string,
    interval: number = 3000,
    maxAttempts: number = 100
  ): Promise<AnalysisResult> {
    console.log(`[Filescan] Starting to poll flow: ${flowId}`);
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await this.getScanStatus(flowId);
        console.log(`[Filescan] Poll attempt ${attempts + 1}/${maxAttempts}: ${status.state}`);

        if (status.state === 'finished') {
          console.log(`[Filescan] Scan ${flowId} completed`);
          return this.getFullAnalysis(flowId);
        } else if (status.state === 'error') {
          throw new Error(`Scan failed: ${flowId}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        console.error(`[Filescan] Polling error on attempt ${attempts + 1}:`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Scan timed out after ${maxAttempts} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Scan timed out after ${maxAttempts} attempts`);
  }
}

export const filescanService = new FilescanService();