type AnyRecord = Record<string, any>

function cleanText(value: any): string {
  if (typeof value !== "string") return ""
  return value.replace(/\s+/g, " ").trim()
}

function extractText(value: any, seen = new Set<any>()): string {
  if (typeof value === "string") return cleanText(value)
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (!value || typeof value !== "object" || seen.has(value)) return ""

  seen.add(value)

  const preferredKeys = [
    "executive_summary",
    "overview",
    "summary",
    "text",
    "content",
    "narrative",
    "report",
    "analysis",
    "details",
  ]

  for (const key of preferredKeys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      const nested = extractText(value[key], seen)
      if (nested) return nested
    }
  }

  for (const nested of Object.values(value)) {
    const text = extractText(nested, seen)
    if (text) return text
  }

  return ""
}

export function extractFinalExecutiveSummary(aiData: AnyRecord): string {
  const candidates = [
    aiData?.results?.final_synthesis?.analysis?.report?.executive_summary,
    aiData?.results?.final_synthesis?.analysis?.executive_summary,
    aiData?.results?.final_synthesis?.analysis?.analysis?.report?.executive_summary,
    aiData?.results?.final_synthesis?.analysis?.analysis?.executive_summary,
    aiData?.results?.final_synthesis?.report?.executive_summary,
    aiData?.final_synthesis?.analysis?.report?.executive_summary,
    aiData?.final_synthesis?.analysis?.executive_summary,
  ]

  for (const candidate of candidates) {
    const text = extractText(candidate)
    if (text) return text
  }

  return ""
}
