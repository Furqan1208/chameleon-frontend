// lib/threat-intel/urlhaus-types.ts - COMPLETE
export interface URLhausURLRequest {
  url: string;
}

export interface URLhausHashRequest {
  hash: string;
}

export interface URLhausHostRequest {
  host: string;
}

export interface URLhausTagRequest {
  tag: string;
}

export interface URLhausPayload {
  firstseen: string;
  filename: string;
  file_type: string;
  response_size: string;
  response_md5: string;
  response_sha256: string;
  urlhaus_download: string;
  signature: string;
  virustotal: string | null;
  imphash: string;
  ssdeep: string;
  tlsh: string;
}

export interface URLhausBlacklistInfo {
  spamhaus_dbl: string;
  surbl: string;
}

export interface URLhausAnalysisResult {
  query_status: "ok" | "no_results" | "invalid_url" | "invalid_hash" | "unknown";
  id?: string;
  urlhaus_reference?: string;
  url?: string;
  url_status?: "online" | "offline" | "unknown";
  host?: string;
  date_added?: string;
  last_online?: string | null;
  threat?: string;
  blacklists?: URLhausBlacklistInfo;
  reporter?: string;
  larted?: string;
  takedown_time_seconds?: number | null;
  tags?: string[];
  payloads?: URLhausPayload[];
  raw_data?: any;
  timestamp: string;
}

export interface URLhausTagResponse {
  query_status: "ok" | "no_results";
  tag: string;
  urls: Array<{
    url: string;
    url_status: string;
    date_added: string;
    threat: string;
    tags: string[];
  }>;
}

export type URLhausIndicatorType = "url" | "hash" | "host" | "tag";