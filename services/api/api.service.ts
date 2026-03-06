import { authApi } from "./auth/auth.api";
import { analysisApi } from "./analysis/analysis.api";
import { userApi } from "./user/user.api";
import { virusTotalApi } from "./threat-intel/virusTotal.api";
import { malwareBazaarApi } from "./threat-intel/malwareBazaar.api";
import { alienVaultApi } from "./threat-intel/alienVault.api";
import { abuseIPDBApi } from "./threat-intel/abuseipdb.api";
import { threatFoxApi } from "./threat-intel/threatFox.api";
import { fileScanApi } from "./threat-intel/fileScan.api";
import { hybridAnalysisApi } from "./threat-intel/hybridAnalysis.api";
import { unifiedThreatApi } from "./threat-intel/unified.api";

export const apiService = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  googleAuth: (idToken: string) => authApi.googleAuth(idToken),
  getMe: () => authApi.getMe(),
  logout: () => authApi.logout(),
  isAuthenticated: () => authApi.isAuthenticated(),
  getStoredUser: () => authApi.getStoredUser(),

  // ── Analysis ──────────────────────────────────────────────────────────────
  uploadFile: (...a: Parameters<typeof analysisApi.uploadFile>) =>
    analysisApi.uploadFile(...a),
  getAnalysis: (id: string) => analysisApi.getAnalysis(id),
  getAllReports: () => analysisApi.getAllReports(),
  getAnalysisComponents: (id: string) => analysisApi.getAnalysisComponents(id),
  getCapeReport: (id: string) => analysisApi.getCapeReport(id),
  getParsedSection: (...a: Parameters<typeof analysisApi.getParsedSection>) =>
    analysisApi.getParsedSection(...a),
  getAiAnalysis: (...a: Parameters<typeof analysisApi.getAiAnalysis>) =>
    analysisApi.getAiAnalysis(...a),
  downloadReport: (...a: Parameters<typeof analysisApi.downloadReport>) =>
    analysisApi.downloadReport(...a),
  deleteAnalysis: (id: string) => analysisApi.deleteAnalysis(id),

  // ── User ──────────────────────────────────────────────────────────────────
  updateProfile: (data: Parameters<typeof userApi.updateProfile>[0]) =>
    userApi.updateProfile(data),
  deleteAccount: () => userApi.deleteAccount(),

  // ── Threat Intel — VirusTotal ─────────────────────────────────────────────
  scanVirusTotal: (req: Parameters<typeof virusTotalApi.scan>[0]) =>
    virusTotalApi.scan(req),
  getVirusTotalHash: (...a: Parameters<typeof virusTotalApi.lookupHash>) =>
    virusTotalApi.lookupHash(...a),

  // ── Threat Intel — MalwareBazaar ──────────────────────────────────────────
  searchMalwareBazaar: (req: Parameters<typeof malwareBazaarApi.search>[0]) =>
    malwareBazaarApi.search(req),
  getMalwareBazaarRecent: (limit?: number) =>
    malwareBazaarApi.getRecentSamples(limit),

  // ── Threat Intel — AlienVault OTX ─────────────────────────────────────────
  scanAlienVaultOTX: (req: Parameters<typeof alienVaultApi.scan>[0]) =>
    alienVaultApi.scan(req),

  // ── Threat Intel — AbuseIPDB ──────────────────────────────────────────────
  checkAbuseIPDB: (...a: Parameters<typeof abuseIPDBApi.checkIp>) =>
    abuseIPDBApi.checkIp(...a),

  // ── Threat Intel — ThreatFox ──────────────────────────────────────────────
  searchThreatFox: (indicator: string) => threatFoxApi.search(indicator),
  getThreatFoxRecent: (...a: Parameters<typeof threatFoxApi.getRecentIocs>) =>
    threatFoxApi.getRecentIocs(...a),
  getThreatFoxMalwareList: () => threatFoxApi.getMalwareList(),

  // ── Threat Intel — FileScan ───────────────────────────────────────────────
  filescanUploadFile: (...a: Parameters<typeof fileScanApi.uploadFile>) =>
    fileScanApi.uploadFile(...a),
  filescanScanUrl: (req: Parameters<typeof fileScanApi.scanUrl>[0]) =>
    fileScanApi.scanUrl(req),
  filescanGetStatus: (...a: Parameters<typeof fileScanApi.getStatus>) =>
    fileScanApi.getStatus(...a),
  filescanGetReport: (...a: Parameters<typeof fileScanApi.getReport>) =>
    fileScanApi.getReport(...a),
  filescanGetFullAnalysis: (flowId: string) =>
    fileScanApi.getFullAnalysis(flowId),
  filescanSimilaritySearch: (
    req: Parameters<typeof fileScanApi.similaritySearch>[0],
  ) => fileScanApi.similaritySearch(req),

  // ── Threat Intel — Hybrid Analysis ───────────────────────────────────────
  scanHybridAnalysis: (req: Parameters<typeof hybridAnalysisApi.scan>[0]) =>
    hybridAnalysisApi.scan(req),
  getHybridAnalysisHash: (
    ...a: Parameters<typeof hybridAnalysisApi.lookupHash>
  ) => hybridAnalysisApi.lookupHash(...a),
  getHybridAnalysisFeed: (limit?: number) =>
    hybridAnalysisApi.getThreatFeed(limit),
  getHybridAnalysisQuickScanFeed: (limit?: number) =>
    hybridAnalysisApi.getQuickScanFeed(limit),

  // ── Threat Intel — Unified ────────────────────────────────────────────────
  unifiedThreatSearch: (indicator: string) =>
    unifiedThreatApi.search(indicator),
  detectIndicatorType: (indicator: string) =>
    unifiedThreatApi.detectType(indicator),

  // ── Utilities ─────────────────────────────────────────────────────────────
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/health`,
      );
      return response.ok;
    } catch {
      return false;
    }
  },
};
