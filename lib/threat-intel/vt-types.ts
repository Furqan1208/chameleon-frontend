// lib/threat-intel/vt-types.ts
export type VTIndicatorType = 'hash' | 'ip' | 'domain' | 'url' | 'filename';

export interface VTDetectionStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout: number;
  total: number;
  detection_ratio: string;
  threat_score: number;
}

export interface VTFileInfo {
  hash: string;
  filename?: string;
  size?: number;
  type_description?: string;
  first_seen?: string;
  last_analysis?: string;
  reputation?: number;
  tags: string[];
}

export interface VTNetworkInfo {
  asn?: number;
  as_owner?: string;
  country?: string;
  network?: string;
  registrar?: string;
  categories: string[];
}

export interface VTAnalysisResult {
  ioc: string;
  ioc_type: VTIndicatorType;
  found: boolean;
  detection_stats: VTDetectionStats;
  threat_level: 'high' | 'medium' | 'low' | 'clean' | 'unknown';
  threat_score: number;
  file_info?: VTFileInfo;
  network_info?: VTNetworkInfo;
  behavioral_indicators: string[];
  relationships: Record<string, string[]>;
  sandbox_data?: any;
  raw_data?: any;
  vt_url: string;
  timestamp: string;
}

export interface VTScanRequest {
  indicator: string;
  type: VTIndicatorType;
  include_relationships?: boolean;
}

export interface VTScanHistory {
  id: string;
  indicator: string;
  type: VTIndicatorType;
  result: VTAnalysisResult;
  timestamp: string;
  favorite?: boolean;
}