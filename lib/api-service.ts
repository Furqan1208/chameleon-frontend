// D:\FYP\Chameleon Frontend\lib\api-service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

class APIService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  async uploadFile(
    file: File, 
    analysisType: "complete" | "parse" | "parse_and_ai" | "ai" = "complete", 
    aiModel = "gemini-2.5-flash"
  ) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("model_name", aiModel)

    let endpoint = ""
    
    switch(analysisType) {
      case "complete":
        endpoint = "/complete"
        break
      case "parse":
        endpoint = "/parse-only"
        break
      case "parse_and_ai":
        endpoint = "/parse-and-ai"
        break
      case "ai":
        endpoint = "/ai-only"
        break
      default:
        endpoint = "/complete"
    }

    console.log(`📤 Uploading file for ${analysisType} analysis to ${endpoint}`)

    const response = await fetch(`${this.baseUrl}/analysis${endpoint}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }))
      throw new Error(error.detail || `${analysisType} analysis failed`)
    }

    return response.json()
  }

  async getAnalysis(analysisId: string) {
    const response = await fetch(`${this.baseUrl}/analysis/${analysisId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch analysis")
    }

    const result = await response.json()
    return result.data || result
  }

  async getAllReports() {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/reports`)

      if (!response.ok) {
        console.warn("Could not fetch reports from backend, using fallback data")
        return this.getMockReports()
      }

      const result = await response.json()
      return result.data || result
    } catch (error) {
      console.warn("Network error fetching reports, using fallback data:", error)
      return this.getMockReports()
    }
  }

  async getAnalysisComponents(analysisId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/${analysisId}/components`)
      
      if (!response.ok) {
        throw new Error("Failed to get components")
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.warn("Failed to get components:", error)
      return {
        analysis_id: analysisId,
        components: {
          cape: true,
          parsed: true,
          ai_analysis: true
        },
        available: ["cape", "parsed", "ai_analysis"]
      }
    }
  }

  async getCapeReport(analysisId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/${analysisId}/cape`)
      
      if (!response.ok) {
        throw new Error("Failed to get CAPE report")
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.warn("Failed to get CAPE report:", error)
      throw error
    }
  }

  async getParsedSection(analysisId: string, sectionName: string = "all") {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/${analysisId}/parsed/${sectionName}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get parsed section: ${sectionName}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.warn(`Failed to get parsed section ${sectionName}:`, error)
      throw error
    }
  }

  async getAiAnalysis(analysisId: string, sectionName: string = "summary") {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/${analysisId}/ai/${sectionName}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get AI analysis: ${sectionName}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.warn(`Failed to get AI analysis ${sectionName}:`, error)
      throw error
    }
  }

  async downloadReport(analysisId: string, format: "json" | "pdf" = "json") {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/${analysisId}/download?format=${format}`)

      if (!response.ok) {
        throw new Error("Failed to download report")
      }

      if (format === "json") {
        return response.json()
      } else {
        // For PDF or other formats, download as blob
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analysis_${analysisId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.warn("Failed to download report:", error)
      throw error
    }
  }

  // Mock data for demonstration/fallback
  private getMockReports() {
    return [
      {
        analysis_id: "analysis_demo_001",
        filename: "sample_malware.exe",
        created_at: new Date().toISOString(),
        status: "complete",
        malscore: 7.5,
        components: {
          cape: true,
          parsed: true,
          ai_analysis: true
        },
        analysis_type: "complete"
      },
      {
        analysis_id: "analysis_demo_002",
        filename: "cape_report.json",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: "complete",
        malscore: 4.2,
        components: {
          cape: true,
          parsed: true,
          ai_analysis: false
        },
        analysis_type: "parse_only"
      },
      {
        analysis_id: "analysis_demo_003",
        filename: "parsed_data.json",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        status: "complete",
        malscore: 8.1,
        components: {
          cape: false,
          parsed: true,
          ai_analysis: true
        },
        analysis_type: "parse_and_ai"
      }
    ]
  }

  // Helper method to test backend connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const apiService = new APIService()