// lib/mock-chart-data.ts
export const mockTimelineEvents = [
  {
    timestamp: "2024-01-15 14:30:22",
    process: "svchost.exe",
    action: "Created registry key: HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    severity: "high" as const,
    details: "Attempted persistence mechanism"
  },
  {
    timestamp: "2024-01-15 14:31:05",
    process: "explorer.exe",
    action: "Network connection to 192.168.1.100:443",
    severity: "medium" as const,
    details: "Outbound HTTPS connection to suspicious IP"
  },
  {
    timestamp: "2024-01-15 14:32:18",
    process: "powershell.exe",
    action: "Downloaded file from http://malicious.com/payload.exe",
    severity: "high" as const,
    details: "File download from known malicious domain"
  },
  {
    timestamp: "2024-01-15 14:33:42",
    process: "payload.exe",
    action: "Process injection into lsass.exe",
    severity: "high" as const,
    details: "Credential dumping attempt detected"
  },
  {
    timestamp: "2024-01-15 14:35:10",
    process: "system.exe",
    action: "Disabled Windows Defender",
    severity: "medium" as const,
    details: "Antivirus tampering detected"
  }
]