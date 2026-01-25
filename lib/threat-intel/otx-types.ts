// D:\FYP\Chameleon Frontend\lib\threat-intel\otx-types.ts

export type OTXIndicatorType = 'IPv4' | 'IPv6' | 'domain' | 'hostname' | 'url' | 'file' | 'cve' | 'email' | 'mutex' | 'auto';

export interface OTXPulseAuthor {
  username: string;
  id: string;
  avatar_url?: string;
  is_subscribed?: boolean;
  is_following?: boolean;
}

export interface OTXMalwareFamily {
  id: string;
  display_name: string;
  target?: string | null;
}

export interface OTXAttackID {
  id: string;
  name: string;
  display_name: string;
}

export interface OTXPulse {
  id: string;
  name: string;
  description?: string;
  modified: string;
  created: string;
  tags: string[];
  references: string[];
  public: number;
  adversary?: string;
  targeted_countries: string[];
  malware_families: OTXMalwareFamily[];
  attack_ids: OTXAttackID[];
  industries: string[];
  TLP?: string;
  author: OTXPulseAuthor;
  indicator_type_counts: Record<string, number>;
  indicator_count: number;
  subscriber_count: number;
  related?: {
    alienvault?: {
      adversary: string[];
      malware_families: string[];
      industries: string[];
      unique_indicators?: number;
    };
    other?: {
      adversary: string[];
      malware_families: string[];
      industries: string[];
      unique_indicators?: number;
    };
  };
}

export interface OTXPulseInfo {
  count: number;
  pulses: OTXPulse[];
  references: string[];
  related: {
    alienvault: {
      adversary: string[];
      malware_families: string[];
      industries: string[];
      unique_indicators?: number;
    };
    other: {
      adversary: string[];
      malware_families: string[];
      industries: string[];
      unique_indicators?: number;
    };
  };
}

export interface OTXGeneralData {
  indicator: string;
  type?: string;
  asn?: string;
  reputation?: number;
  pulse_info: OTXPulseInfo;
  latitude?: number;
  longitude?: number;
  malware?: string[];
  country_code?: string;
  city?: string;
  region?: string;
  isp?: string;
  organization?: string;
  country_name?: string;
  continent_code?: string;
  accuracy_radius?: number;
  timezone?: string;
  area_code?: number;
  postal_code?: string;
  dma_code?: number;
  metro_code?: number;
}

export interface OTXMalwareEntry {
  datetime_int: number;
  hash: string;
  detections: Record<string, string | null>;
  date: string;
  filesize?: number;
  filetype?: string;
  ssdeep?: string;
  type?: string;
  malware_families?: string[];
  yara_rules?: Array<{
    name: string;
    author: string;
    description: string;
    reference: string;
  }>;
}

export interface OTXMalwareData {
  data: OTXMalwareEntry[];
  count?: number;
}

export interface OTXPassiveDNSEntry {
  address: string;
  hostname: string;
  record_type: string;
  first: string;
  last: string;
  asn: string | null;
  provider?: string;
  country_code?: string;
  region?: string;
  city?: string;
}

export interface OTXPassiveDNS {
  passive_dns: OTXPassiveDNSEntry[];
  count?: number;
}

export interface OTXURLWorkerResult {
  url?: string;
  ip?: string;
  filetype?: string;
  fileclass?: string;
  filemagic?: string;
  http_response?: Record<string, string>;
  sha256?: string;
  http_code: number;
  md5?: string;
  has_file_analysis?: boolean;
}

export interface OTXSafebrowsingMatch {
  threat_type: string;
  platform_type: string;
  threat_entry_type: string;
}

export interface OTXURLEntry {
  url: string;
  date: string;
  domain: string;
  hostname: string;
  result?: {
    urlworker: OTXURLWorkerResult;
    safebrowsing: {
      matches: OTXSafebrowsingMatch[];
    };
    tlp?: string;
  };
  httpcode: number;
  gsb: any[];
  encoded: string;
  params?: Record<string, any>;
  checked?: number;
  deep_analysis?: boolean;
  secs?: number;
  size?: number;
  filename?: string;
}

export interface OTXURLList {
  url_list: OTXURLEntry[];
  latitude?: number;
  longitude?: number;
  count?: number;
}

export interface OTXHTTPScanEntry {
  key: string;
  name: string;
  value: string | number | boolean;
  type?: string;
}

export interface OTXHTTPScan {
  data: OTXHTTPScanEntry[];
  count?: number;
}

export interface OTXAnalysisInfo {
  info?: {
    results?: {
      file_class?: string;
      file_type?: string;
      file_magic?: string;
      filesize?: number;
      ssdeep?: string;
      tlsh?: string;
      sha256?: string;
      sha1?: string;
      md5?: string;
      imphash?: string;
    };
    file_type?: string;
    filesize?: number;
  };
  analysis: Record<string, any>;
  yara?: Array<{
    rule_name: string;
    author: string;
    description: string;
    reference: string;
  }>;
  sigma?: Array<{
    rule_name: string;
    author: string;
    description: string;
    reference: string;
  }>;
}

export interface OTXAnalysis {
  analysis: OTXAnalysisInfo;
}

export interface OTXGeoData {
  country_name?: string;
  country_code?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  continent_code?: string;
  accuracy_radius?: number;
  timezone?: string;
  area_code?: number;
  postal_code?: string;
  dma_code?: number;
  metro_code?: number;
}

export interface OTXWhoisData {
  registrant?: string;
  registrar?: string;
  creation_date?: string;
  expiration_date?: string;
  updated_date?: string;
  name_servers?: string[];
  emails?: string[];
  domains?: string[];
  status?: string[];
}

export interface OTXSections {
  general?: OTXGeneralData;
  malware?: OTXMalwareData;
  passive_dns?: OTXPassiveDNS;
  url_list?: OTXURLList;
  http_scans?: OTXHTTPScan;
  analysis?: OTXAnalysis;
  geo?: OTXGeoData;
  whois?: OTXWhoisData;
}

export interface OTXResult {
  ioc: string;
  ioc_type: OTXIndicatorType;
  found: boolean;
  sections: OTXSections;
  threat_level: 'high' | 'medium' | 'low' | 'clean' | 'unknown';
  threat_score: number;
  pulse_count: number;
  malware_count: number;
  url_count: number;
  passive_dns_count: number;
  otx_url: string;
  timestamp: string;
  raw_data?: any;
  
  // Additional metadata from our service
  file_type?: string;
  asn?: string;
  country?: string;
  city?: string;
  region?: string;
  organization?: string;
  isp?: string;
  reputation_score?: number;
  detection_confidence?: number;
  
  // Analysis metadata
  analysis_info?: {
    file_class?: string;
    file_magic?: string;
    file_size?: number;
    ssdeep_hash?: string;
    imphash?: string;
    yara_matches?: number;
    sigma_matches?: number;
  };
}

export interface OTXScanRequest {
  indicator: string;
  type: OTXIndicatorType;
  include_all_sections?: boolean;
  force_refresh?: boolean;
  timeout?: number;
}

export interface OTXScanHistory {
  id: string;
  indicator: string;
  type: OTXIndicatorType;
  result: OTXResult;
  timestamp: string;
  favorite?: boolean;
  updatedAt?: string;
  source?: 'manual' | 'batch' | 'import';
  tags?: string[];
  notes?: string;
}

export interface OTXDetectionStats {
  pulse_count: number;
  malware_count: number;
  url_count: number;
  passive_dns_count: number;
  threat_score: number;
  detection_ratio: string;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  clean_count: number;
}

export interface OTXRateLimitInfo {
  remaining: number;
  resetTime: Date;
  minutesUntilReset: number;
  used: number;
  limit: number;
  isLimited: boolean;
}

export interface OTXApiResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
  rate_limit?: {
    remaining: number;
    reset: string;
    limit: number;
  };
}

export interface OTXBatchScanResult {
  results: OTXResult[];
  total: number;
  successful: number;
  failed: number;
  duration: number;
  rate_limit_remaining: number;
}

export interface OTXSearchFilters {
  threat_level?: ('high' | 'medium' | 'low' | 'clean' | 'unknown')[];
  ioc_type?: OTXIndicatorType[];
  date_range?: {
    start: string;
    end: string;
  };
  has_pulses?: boolean;
  has_malware?: boolean;
  min_threat_score?: number;
  max_threat_score?: number;
  tags?: string[];
  search_query?: string;
}

export interface OTXExportOptions {
  format: 'json' | 'csv' | 'txt' | 'stix' | 'misp';
  include_sections?: ('general' | 'malware' | 'url_list' | 'passive_dns' | 'analysis')[];
  include_raw_data?: boolean;
  compress?: boolean;
}

export interface OTXStatistics {
  total_scans: number;
  unique_iocs: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  clean_count: number;
  average_threat_score: number;
  total_pulses: number;
  total_malware: number;
  total_urls: number;
  total_dns_records: number;
  detection_rate: number;
  recent_activity: number;
  favorite_count: number;
  most_common_type: string;
  pulse_growth: number;
  scan_timeline: Array<{
    date: string;
    count: number;
    threats: number;
  }>;
}

// Utility types for component props
export interface OTXResultWithMetadata extends OTXResult {
  metadata?: {
    isCached?: boolean;
    cacheAge?: number;
    scanDuration?: number;
    source?: string;
  };
}

export interface OTXPulseWithMetadata extends OTXPulse {
  metadata?: {
    occurrenceCount: number;
    relatedScans: OTXScanHistory[];
    threatLevel: OTXResult['threat_level'];
    firstSeen?: string;
    lastSeen?: string;
  };
}

// Type guards
export function isOTXResult(obj: any): obj is OTXResult {
  return obj && 
    typeof obj.ioc === 'string' &&
    typeof obj.ioc_type === 'string' &&
    typeof obj.found === 'boolean' &&
    obj.sections && typeof obj.sections === 'object';
}

export function isOTXScanHistory(obj: any): obj is OTXScanHistory {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.indicator === 'string' &&
    typeof obj.type === 'string' &&
    isOTXResult(obj.result) &&
    typeof obj.timestamp === 'string';
}

export function isValidIndicatorType(type: string): type is OTXIndicatorType {
  const validTypes: OTXIndicatorType[] = [
    'IPv4', 'IPv6', 'domain', 'hostname', 'url', 'file', 'cve', 'email', 'mutex', 'auto'
  ];
  return validTypes.includes(type as OTXIndicatorType);
}

// Helper functions
export function getIndicatorTypeColor(type: OTXIndicatorType): string {
  const colorMap: Record<OTXIndicatorType, string> = {
    'IPv4': 'text-blue-500',
    'IPv6': 'text-blue-600',
    'domain': 'text-green-500',
    'hostname': 'text-green-600',
    'url': 'text-orange-500',
    'file': 'text-purple-500',
    'cve': 'text-red-500',
    'email': 'text-pink-500',
    'mutex': 'text-indigo-500',
    'auto': 'text-gray-500'
  };
  return colorMap[type] || 'text-gray-500';
}

export function getIndicatorTypeIcon(type: OTXIndicatorType): string {
  const iconMap: Record<OTXIndicatorType, string> = {
    'IPv4': 'Network',
    'IPv6': 'Globe',
    'domain': 'Globe',
    'hostname': 'Globe',
    'url': 'Link',
    'file': 'FileText',
    'cve': 'Shield',
    'email': 'Mail',
    'mutex': 'Lock',
    'auto': 'Search'
  };
  return iconMap[type] || 'Search';
}

export function getThreatLevelColor(level: OTXResult['threat_level']): string {
  const colorMap: Record<OTXResult['threat_level'], string> = {
    'high': 'text-destructive',
    'medium': 'text-accent',
    'low': 'text-yellow-500',
    'clean': 'text-green-500',
    'unknown': 'text-muted-foreground'
  };
  return colorMap[level] || 'text-muted-foreground';
}

export function getThreatLevelDescription(level: OTXResult['threat_level']): string {
  const descriptionMap: Record<OTXResult['threat_level'], string> = {
    'high': 'High risk indicator with significant malicious activity',
    'medium': 'Medium risk indicator with suspicious characteristics',
    'low': 'Low risk indicator with minimal threat indicators',
    'clean': 'Clean indicator with no significant threats detected',
    'unknown': 'Unknown risk level - insufficient data for analysis'
  };
  return descriptionMap[level] || 'Unknown risk level';
}