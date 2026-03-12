// lib/types/filescan.types.ts

export type FileScanVerdict = 
  | 'UNKNOWN' 
  | 'BENIGN' 
  | 'INFORMATIONAL' 
  | 'NO_THREAT' 
  | 'SUSPICIOUS' 
  | 'LIKELY_MALICIOUS' 
  | 'MALICIOUS';

export type FileScanThreatLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface FileScanUploadResponse {
  flow_id: string;
  priority: {
    applied: number;
    max_possible: number;
  };
}

export interface FileScanFileInfo {
  name: string;
  hash: string;
  type: string;
  size?: number;
}

export interface FileScanVerdictInfo {
  verdict: FileScanVerdict;
  threatLevel: FileScanThreatLevel;
  confidence: number;
}

export interface FileScanOptions {
  description?: string;
  osint?: boolean;
  extended_osint?: boolean;
  resolve_domains?: boolean;
  whois?: boolean;
  url_analysis?: boolean;
  phishing_detection?: boolean;
}

export interface FileScanStatusResponse {
  flowId: string;
  allFinished: boolean;
  state: string;
  scanStartedDate: string;
  reports: {
    [reportId: string]: FileScanReport;
  };
}

export interface FileScanReport {
  overallState: string;
  finalVerdict?: FileScanVerdictInfo;
  interestingScore?: number;
  vtRate?: number;
  file: FileScanFileInfo;
  created_date: string;
  scanOptions: FileScanOptions;
}

export interface AnalysisResult {
  flowId: string;
  scanId: string;
  file: FileScanFileInfo;
  state: string;
  verdict: FileScanVerdictInfo;
  interestingScore?: number;
  vtRate?: number;
  created_date: string;
  scanOptions: Partial<FileScanOptions>;
  report_url: string;
  scan_url: string;
  timestamp: string;
}

export interface DetailedAnalysisResult {
  reportId: string;
  fileHash: string;
  file: FileScanFileInfo;
  verdict: FileScanVerdictInfo;
  scanOptions?: FileScanOptions;
  scanEngine?: string;
  created_date?: string;
  yaraMatches?: any[];
  extractedFiles?: any[];
  networkConnections?: any[];
  extractedUrls?: any[];
  extractedDomains?: any[];
  extractedIps?: any[];
  strings?: any[];
  resources?: any[];
  osintResults?: any;
  visualization?: any;
  signalGroups?: any[];
  tags?: any[];
  mitreTechniques?: any[];
  behavioralAnalysis?: any;
  peInfo?: any;
  imports?: any[];
  exports?: any[];
  sections?: any[];
  taskReference?: any;
  subtaskReferences?: any[];
  raw_detailed_data?: any;
  report_url?: string;
  timestamp?: string;
}

export interface FileScanUrlRequest {
  url: string;
  description?: string;
  tags?: string[];
  osint?: boolean;
  extended_osint?: boolean;
  url_analysis?: boolean;
  resolve_domains?: boolean;
  whois?: boolean;
}
