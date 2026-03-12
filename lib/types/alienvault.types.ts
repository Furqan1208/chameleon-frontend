// lib/types/alienvault.types.ts

export type OTXIndicatorType = 'IPv4' | 'IPv6' | 'domain' | 'hostname' | 'url' | 'file' | 'hash' | 'cve' | 'email' | 'mutex';

export interface OTXPulse {
  id: string;
  name: string;
  description?: string;
  modified: string;
  created: string;
  tags: string[];
  references: string[];
  malware_families: string[];
  attack_ids: string[];
  industries: string[];
  targeted_countries: string[];
}

export interface OTXPulseInfo {
  count: number;
  pulses?: OTXPulse[];
  references?: string[];
  related?: {
    alienvault?: {
      adversary?: string[];
      malware_families?: string[];
      industries?: string[];
    };
    other?: {
      adversary?: string[];
      malware_families?: string[];
      industries?: string[];
    };
  };
}

export interface OTXGeneralData {
  indicator: string;
  type?: string;
  asn?: string;
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
  whois?: string;
  reputation?: number;
}

export interface OTXMalwareEntry {
  datetime_int?: number;
  hash?: string;
  detections?: Record<string, string | null>;
  date?: string;
  family?: string;
  count?: number;
}

export interface OTXMalwareData {
  data: OTXMalwareEntry[];
  count?: number;
}

export interface OTXPassiveDNSEntry {
  address?: string;
  hostname?: string;
  record_type?: string;
  first?: string;
  last?: string;
  asn?: string | null;
  record?: string;
  last_seen?: string;
  first_seen?: string;
}

export interface OTXPassiveDNS {
  passive_dns: OTXPassiveDNSEntry[];
  count?: number;
}

export interface OTXURLEntry {
  url?: string;
  date?: string;
  domain?: string;
  hostname?: string;
  httpcode?: number;
}

export interface OTXURLList {
  url_list: OTXURLEntry[];
  count?: number;
}

export interface OTXSections {
  general?: OTXGeneralData;
  malware?: OTXMalwareData;
  passive_dns?: OTXPassiveDNS;
  url_list?: OTXURLList;
}

export interface OTXResult {
  ioc: string;
  ioc_type: OTXIndicatorType | string;
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
  
  // Optional error field when scan fails
  error?: string;
  
  // Additional metadata
  file_type?: string;
  asn?: string;
  country?: string;
  city?: string;
  region?: string;
  organization?: string;
  isp?: string;
  
  // Additional fields from backend
  tags?: string[];
  adversaries?: string[];
  raw_data?: any;
}

export interface OTXScanRequest {
  indicator: string;
  type: OTXIndicatorType | string; // Frontend uses OTXIndicatorType, backend expects ip/domain/url/hash
  include_all_sections?: boolean;
}
