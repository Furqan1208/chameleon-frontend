// lib/threat-intel/ha-types.ts
export type HAIndicatorType = 'hash' | 'url' | 'filename';

export interface HADetectionStats {
  malicious: number;
  suspicious: number;
  no_specific_threat: number;
  no_verdict: number;
  whitelisted: number;
  total: number;
}

export interface HAFileInfo {
  sha256: string;
  md5?: string;
  sha1?: string;
  sha512?: string;
  filename?: string;
  size?: number;
  type?: string;
  type_short?: string[];
  mime?: string;
  ssdeep?: string;
  imphash?: string;
}

export interface HAEnvironmentInfo {
  environment_id: number;
  environment_description: string;
  state: string;
  error_type?: string;
  error_origin?: string;
}

export interface HAMitreAttack {
  tactic: string;
  technique: string;
  attck_id?: string;
  attck_id_wiki?: string;
  parent?: {
    technique: string;
    attck_id?: string;
    attck_id_wiki?: string;
  };
  malicious_identifiers?: string[];
  suspicious_identifiers?: string[];
  informative_identifiers?: string[];
}

export interface HASignature {
  name: string;
  description: string;
  threat_level: number;
  threat_level_human: string;
  category: string;
  identifier: string;
  type: string;
  relevance: number;
  origin?: string;
  attck_id?: string;
  capec_id?: string;
  attck_id_wiki?: string;
}

export interface HAExtractedFile {
  name: string;
  file_path: string;
  file_size: number;
  sha1: string;
  sha256: string;
  md5: string;
  type_tags: string[];
  description: string;
  runtime_process: string;
  threat_level: number;
  threat_level_readable: string;
  av_label?: string;
  av_matched?: number;
  av_total?: number;
  file_available_to_download: boolean;
}

export interface HAProcess {
  process_id: number;
  name: string;
  command_line?: string;
  parent_process_id?: number;
  children?: number[];
  integrity_level?: string;
  thread_count?: number;
  handles?: number;
  start_time?: string;
  end_time?: string;
}

export interface HANetworkConnection {
  protocol: string;
  remote_ip?: string;
  remote_port?: number;
  local_ip?: string;
  local_port?: number;
  domain?: string;
  country?: string;
  asn?: number;
  owner?: string;
  direction: string;
  packet_count?: number;
  byte_count?: number;
}

export interface HARelationships {
  contacted_ips: string[];
  contacted_domains: string[];
  contacted_urls: string[];
  dropped_files: string[];
  registry_keys: string[];
  mutexes: string[];
}

export interface HAAnalysisResult {
  // Basic Information
  ioc: string;
  ioc_type: HAIndicatorType;
  found: boolean;
  
  // Overview Data
  sha256: string;
  last_file_name?: string;
  other_file_name?: string[];
  threat_score?: number;
  verdict?: string;
  verdict_numeric?: number;
  url_analysis: boolean;
  size?: number;
  type?: string;
  type_short?: string[];
  submitted_at?: string;
  analysis_start_time?: string;
  last_multi_scan?: string;
  tags: string[];
  architecture?: string;
  vx_family?: string;
  multiscan_result?: number;
  
  // Reports
  reports?: Array<{
    id?: string;
    environment_id?: number;
    environment_description?: string;
    state?: string;
    error_type?: string;
    error_origin?: string;
    verdict?: string;
  }>;
  
  // Scanner Results
  scanners?: Record<string, any>;
  
  // Related Hashes
  related_parent_hashes?: string[];
  related_children_hashes?: string[];
  related_reports?: Array<{
    job_id?: string;
    environment_id?: number;
    state?: string;
    error_type?: string;
    error_origin?: string;
    sha256?: string;
    verdict?: string;
  }>;
  
  // Summary Data
  summary?: {
    job_id?: string;
    environment_description?: string;
    target_url?: string;
    state?: string;
    error_type?: string;
    error_origin?: string;
    submit_name?: string;
    entrypoint?: string;
    entrypoint_section?: string;
    image_base?: string;
    subsystem?: string;
    image_file_characteristics?: string[];
    dll_characteristics?: string[];
    major_os_version?: number;
    minor_os_version?: number;
    av_detect?: number;
    interesting?: boolean;
    threat_level?: number;
    certificates?: Array<{
      owner?: string;
      issuer?: string;
      serial_number?: string;
      md5?: string;
      sha1?: string;
      valid_from?: string;
      valid_until?: string;
    }>;
    is_certificates_valid?: boolean;
    certificates_validation_message?: string;
    domains?: string[];
    compromised_hosts?: string[];
    hosts?: string[];
    total_network_connections?: number;
    total_processes?: number;
    total_signatures?: number;
  };
  
  // Behavioral Data
  extracted_files?: HAExtractedFile[];
  file_metadata?: {
    file_compositions?: any[];
    imported_objects?: any[];
    file_analysis?: any[];
    total_file_compositions_imports?: number;
  };
  processes?: HAProcess[];
  mitre_attcks?: HAMitreAttack[];
  signatures?: HASignature[];
  classification_tags?: string[];
  
  // Network Data
  network_connections?: HANetworkConnection[];
  
  // Relationships
  relationships?: HARelationships;
  
  // Community
  whitelisted: boolean;
  children_in_queue?: number;
  children_in_progress?: number;
  community_score_votes_down?: number;
  community_score_votes_up?: number;
  
  // Additional
  submissions?: Array<{
    submission_id: string;
    filename: string;
    url: string;
    created_at: string;
  }>;
  machine_learning_models?: any[];
  crowdstrike_ai?: any;
  warnings?: string[];
  
  // Metadata
  threat_level: 'malicious' | 'suspicious' | 'no_specific_threat' | 'no_verdict' | 'whitelisted' | 'unknown';
  threat_score_computed: number;
  analysis_date: string;
  vt_url?: string;
  ha_url: string;
  timestamp: string;
  raw_data?: any;
}

export interface HAScanRequest {
  indicator: string;
  type: HAIndicatorType;
  include_metadata?: boolean;
  include_summary?: boolean;
  environment_id?: string;
}

export interface HAThreatFeedItem {
  report_id?: string;
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha512?: string;
  submit_name?: string;
  url_analysis: boolean;
  size?: number;
  mime?: string;
  type?: string;
  type_short?: string[];
  environment_id?: number;
  environment_description?: string;
  verdict?: number;
  verdict_human?: string;
}

export interface HARateLimitInfo {
  remaining: number;
  limit: number;
  resetTime: Date;
  minutesUntilReset: number;
}