// lib/threat-intel/abuseipdb-types.ts
export interface AbuseIPDBReportRequest {
  ip: string;
  categories: string;
  comment: string;
}

export interface AbuseIPDBReportResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    countryName: string;
    usageType: string;
    isp: string;
    domain: string;
    hostnames: string[];
    isTor: boolean;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string;
    reports: Array<{
      reportedAt: string;
      comment: string;
      categories: number[];
      reporterId: number;
      reporterCountryCode: string;
      reporterCountryName: string;
    }>;
  };
}

export interface AbuseIPDBBlacklistResponse {
  data: Array<{
    ipAddress: string;
    countryCode: string;
    abuseConfidenceScore: number;
    lastReportedAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    count: number;
    perPage: number;
    pages: number;
  };
}

export interface AbuseIPDBCheckResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    usageType: string;
    isp: string;
    domain: string;
    hostnames: string[];
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string;
    reports: Array<{
      reportedAt: string;
      comment: string;
      categories: number[];
      reporterId: number;
      reporterCountryCode: string;
      reporterCountryName: string;
    }>;
  };
}

export interface AbuseIPDBBulkReportResponse {
  data: {
    saved: boolean;
    ipAddress: string;
    abuseConfidenceScore: number;
  }[];
}

export interface AbuseIPDBBlacklistRequest {
  confidenceMinimum?: number;
  limit?: number;
  onlyCountries?: string[];
  exceptCountries?: string[];
}

export interface AbuseIPDBCheckBulkResponse {
  data: {
    [ip: string]: AbuseIPDBCheckResponse['data'];
  };
}

export interface AbuseIPDBHistoricalReport {
  ipAddress: string;
  abuseConfidenceScore: number;
  totalReports: number;
  numDistinctUsers: number;
  lastReportedAt: string;
  firstReportedAt: string;
  isPublic: boolean;
  isp: string;
  domain: string;
  countryCode: string;
  categories: number[];
  tags: string[];
}

export interface AbuseIPDBAnalysisResult {
  ip: string;
  found: boolean;
  confidence_score: number;
  threat_level: 'high' | 'medium' | 'low' | 'clean' | 'unknown';
  country: string;
  isp: string;
  domain: string;
  usage_type: string;
  is_tor: boolean;
  is_whitelisted: boolean;
  total_reports: number;
  distinct_users: number;
  last_reported: string;
  first_reported: string;
  categories: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  reports: Array<{
    date: string;
    comment: string;
    categories: string[];
    reporter_country: string;
  }>;
  hostnames: string[];
  raw_data: any;
  timestamp: string;
}