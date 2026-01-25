// lib/threat-intel/threatfox-types.ts

export interface ThreatFoxSearchRequest {
  query: 'search_hash' | 'search_ioc' | 'ioc';
  hash?: string;
  search_term?: string;
  id?: number;
  exact_match?: boolean;
}

export interface ThreatFoxMalwareSample {
  time_stamp: string;
  md5_hash: string;
  sha256_hash: string;
  malware_bazaar: string | null;
  intel471: string | null;
  vmray: string | null;
}

export interface ThreatFoxTag {
  tag: string;
  tagset: string;
  threat: string;
}

export interface ThreatFoxAnalysisResult {
  query_status: "ok" | "no_results" | "invalid_search_term" | "unknown";
  id?: string;
  ioc?: string;
  threat_type?: string;
  threat_type_desc?: string;
  ioc_type?: string;
  ioc_type_desc?: string;
  malware?: string;
  malware_printable?: string;
  malware_alias?: string | null;
  malware_malpedia?: string | null;
  confidence_level?: number;
  first_seen?: string;
  last_seen?: string | null;
  reference?: string | null;
  reporter?: string;
  tags?: ThreatFoxTag[];
  malware_samples?: ThreatFoxMalwareSample[];
  raw_data?: any;
  timestamp: string;
}

export interface ThreatFoxSearchResponse {
  query_status: "ok" | "no_results";
  data: ThreatFoxAnalysisResult[];
}

export type ThreatFoxIndicatorType = 'hash' | 'ioc' | 'id';