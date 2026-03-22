import { BaseApi } from "../base.api";

type AnalysisType = "complete" | "parse" | "parse_and_ai" | "ai";

const ENDPOINT_MAP: Record<AnalysisType, string> = {
  complete: "/complete",
  parse: "/parse-only",
  parse_and_ai: "/parse-and-ai",
  ai: "/ai-only",
};

const MOCK_REPORTS = [
  {
    analysis_id: "analysis_demo_001",
    filename: "sample_malware.exe",
    created_at: new Date().toISOString(),
    status: "complete",
    malscore: 7.5,
    components: { cape: true, parsed: true, ai_analysis: true },
    analysis_type: "complete",
  },
  {
    analysis_id: "analysis_demo_002",
    filename: "cape_report.json",
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
    status: "complete",
    malscore: 4.2,
    components: { cape: true, parsed: true, ai_analysis: false },
    analysis_type: "parse_only",
  },
  {
    analysis_id: "analysis_demo_003",
    filename: "parsed_data.json",
    created_at: new Date(Date.now() - 172_800_000).toISOString(),
    status: "complete",
    malscore: 8.1,
    components: { cape: false, parsed: true, ai_analysis: true },
    analysis_type: "parse_and_ai",
  },
];

export class AnalysisApi extends BaseApi {
  async uploadFile(
    file: File,
    analysisType: AnalysisType = "complete",
    aiModel = "gemini-2.5-flash",
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_name", aiModel);
    return this.request(`/analysis${ENDPOINT_MAP[analysisType]}`, {
      method: "POST",
      body: formData,
    });
  }

  async getAnalysis(analysisId: string) {
    const result = await this.request(`/analysis/${analysisId}`);
    return result.data ?? result;
  }

  async getAllReports() {
    try {
      const result = await this.request("/analysis/reports");
      return result.data ?? result;
    } catch (error) {
      console.warn("Could not fetch reports:", error);
      return MOCK_REPORTS;
    }
  }

  async getAnalysisComponents(analysisId: string) {
    try {
      return await this.request(`/analysis/${analysisId}/components`);
    } catch {
      return {
        analysis_id: analysisId,
        components: { cape: true, parsed: true, ai_analysis: true },
        available: ["cape", "parsed", "ai_analysis"],
      };
    }
  }

  async getCapeReport(analysisId: string) {
    return this.request(`/analysis/${analysisId}/cape`);
  }

  async getParsedSection(analysisId: string, sectionName = "all") {
    const url =
      sectionName !== "all"
        ? `/analysis/${analysisId}/parsed?section=${encodeURIComponent(sectionName)}`
        : `/analysis/${analysisId}/parsed`;
    return this.request(url);
  }

  async getAiAnalysis(analysisId: string, sectionName = "summary") {
    const url =
      sectionName !== "summary"
        ? `/analysis/${analysisId}/ai?section=${encodeURIComponent(sectionName)}`
        : `/analysis/${analysisId}/ai`;
    return this.request(url);
  }

  async downloadReport(analysisId: string, format: "json" | "pdf" = "json") {
    const response = await fetch(
      `${this.baseUrl}/analysis/${analysisId}/download?format=${format}`,
      { headers: this.getAuthHeaders() },
    );
    if (response.status === 401) {
      this.clearSession();
      window.location.href = "/login";
      throw new Error("Session expired.");
    }
    if (!response.ok) throw new Error("Failed to download report");

    if (format === "json") return response.json();

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis_${analysisId}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async downloadPdfReport(analysisId: string) {
    const response = await fetch(
      `${this.baseUrl}/analysis/${analysisId}/download/pdf`,
      { headers: this.getAuthHeaders() },
    );

    if (response.status === 401) {
      this.clearSession();
      window.location.href = "/login";
      throw new Error("Session expired.");
    }
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Failed to generate PDF report" }));
      throw new Error(error.detail || "Failed to generate PDF report");
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition") || "";
    const match = contentDisposition.match(/filename="?([^\";]+)"?/i);
    const filename = match?.[1] || `analysis_${analysisId}_report.pdf`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async deleteAnalysis(analysisId: string) {
    return this.request(`/analysis/${analysisId}`, { method: "DELETE" });
  }
}

export const analysisApi = new AnalysisApi();
