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

export interface FileScanOptions {
  description?: string;
  tags?: string[];
  propagate_tags?: boolean;
  password?: string;
  is_private?: boolean;
  is_private_report?: boolean;
  skip_whitelisted?: boolean;
  scan_profile?: string;
  scan_engine?: string;
  rapid_mode?: boolean;
  early_termination?: boolean;
  osint?: boolean;
  extended_osint?: boolean;
  extracted_files_osint?: boolean;
  visualization?: boolean;
  files_download?: boolean;
  resolve_domains?: boolean;
  input_file_yara?: boolean;
  extracted_files_yara?: boolean;
  whois?: boolean;
  ips_meta?: boolean;
  images_ocr?: boolean;
  certificates?: boolean;
  url_analysis?: boolean;
  extract_strings?: boolean;
  ocr_qr?: boolean;
  phishing_detection?: boolean;
}

export interface FileScanFileInfo {
  name: string;
  hash: string;
  type: string;
  size?: number;
}

// Update FileScanVerdictInfo to include verdictLabel
export interface FileScanVerdictInfo {
  verdict: FileScanVerdict;
  threatLevel: FileScanThreatLevel;
  confidence: number;
  verdictLabel?: string; // Add this optional property
}

export interface FileScanChatGPT {
  data: string;
  created_date: string;
}

// Update the FileScanReport interface to include all possible properties
export interface FileScanReport {
  overallState: string;
  positionInQueue: number;
  finalVerdict?: FileScanVerdictInfo;
  interestingScore?: number;
  vtRate?: number;
  file: FileScanFileInfo;
  filesDownloadFinished: boolean;
  additionalStepsRunning: string[];
  additionalStepsDone: boolean;
  created_date: string;
  taskReference?: TaskReference;
  subtaskReferences?: SubtaskReference[];
  defaultOptionsUsed: boolean;
  scanOptions: FileScanOptions;
  chatGptSummary?: FileScanChatGPT;
  estimatedTime?: string;
  estimated_progress: number;
  
  // Add the missing properties that might exist in the API response
  hash?: string;
  inputFileHash?: string;
  filename?: string;
  name?: string;
  
  // Add nested data structures that come from filters
  f?: any; // File scan results from f:all filter
  o?: any; // OSINT results from o:all filter
  fd?: any; // File download results from fd:all filter
  v?: any; // Visualization results from v:all filter
  wi?: any; // WHOIS results from wi:all filter
  dr?: any; // Domain resolve results from dr:all filter
  
  // Add specific fields that might be directly on the report
  extractedFiles?: any[];
  fileScanResults?: any;
  yaraMatches?: any[];
  networkConnections?: any[];
  extractedUrls?: any[];
  extractedDomains?: any[];
  extractedIps?: any[];
  strings?: any[];
  resources?: any[];
  osintResults?: any;
  visualization?: any;
  allSignalGroups?: any[];
  allTags?: any[];
  mitreTechniques?: any[];
  behavioralAnalysis?: any;
  peInfo?: any;
  imports?: any[];
  exports?: any[];
  sections?: any[];
}

export interface FileScanStatusResponse {
  flowId: string;
  allFinished: boolean;
  allFilesDownloadFinished: boolean;
  allAdditionalStepsDone: boolean;
  reportsAmount: number;
  priority: string | { applied: number; max_possible: number };
  pollPause: number;
  state: string;
  scanStartedDate: string;
  fileSize?: number;
  fileReadProgressBytes?: number;
  reports: {
    [reportId: string]: FileScanReport;
  };
}

export interface FileScanFileItem {
  id: string;
  hash: string;
  size: number;
  mediaType: string;
  type: string;
  name?: string;
}

export interface FileScanSimilarityDetails {
  start_date: string;
  file_size: number;
  tags: string[];
  verdict: string;
  is_dotnet: number;
  architecture: string;
  entropy: number;
}

export interface FileScanSimilarityResult {
  sha256: string;
  overall_similarity: number;
  similarities: {
    extracted?: number;
    threat_indicators?: number;
    sections?: number;
    mitre_techniques?: number;
    binary_metadata?: number;
    characteristic?: number;
    disassembly_sections?: number;
    dotnet_info?: number;
    header_info?: number;
    imports?: number;
    resources?: number;
    rich_header_compiler_ids?: number;
    strings?: number;
    version_info?: number;
  };
  details: FileScanSimilarityDetails;
}

export interface FileScanSimilaritySearch {
  most_similar: FileScanSimilarityResult[];
  most_recent: FileScanSimilarityResult[];
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
  chatGptSummary?: FileScanChatGPT;
  extractedFiles?: FileScanFileItem[];
  similarFiles?: FileScanSimilarityResult[];
  report_url: string;
  scan_url: string;
  timestamp: string;
}

// Add to existing types...

export interface DetailedAnalysisResult {
  // Basic info
  reportId: string;
  fileHash: string;
  
    // Task references
  taskReference?: TaskReference;
  subtaskReferences?: SubtaskReference[];
  // File information
  file: FileScanFileInfo;
  
  // Verdict
  verdict: FileScanVerdictInfo;
  
  // Scan information
  scanOptions: FileScanOptions;
  scanEngine?: string;
  created_date: string;
  
  // YARA matches
  yaraMatches?: any[];
  
  // Extracted files
  extractedFiles?: any[];
  
  // Network indicators
  networkConnections?: any[];
  extractedUrls?: any[];
  extractedDomains?: any[];
  extractedIps?: any[];
  
  // Strings and resources
  strings?: any[];
  resources?: any[];
  
  // OSINT results
  osintResults?: any;
  
  // Visualization
  visualization?: any;
  
  // Signal groups (detections)
  signalGroups?: any[];
  
  // Tags
  tags?: any[];
  
  // MITRE ATT&CK techniques
  mitreTechniques?: any[];
  
  // Behavioral analysis
  behavioralAnalysis?: any;
  
  // PE file specific data
  peInfo?: any;
  imports?: any[];
  exports?: any[];
  sections?: any[];
  
  // Raw detailed data
  raw_detailed_data?: any;
  
  // URLs
  report_url: string;
  timestamp: string;
}

export interface TaskReference {
  id: string;
  state: string;
  error?: string;
  progress?: number;
  result?: any;
}

// Add SubtaskReference interface
export interface SubtaskReference {
  id: string;
  type: string;
  state: string;
  error?: string;
  progress?: number;
  result?: any;
}