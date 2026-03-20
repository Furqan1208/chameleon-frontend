// components/layout/Header.tsx
"use client"

import { Bell, Settings, LogOut, Command, ChevronRight, Clock3 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { apiService } from "@/services/api/api.service"

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Operational overview" },
  "/dashboard/upload": { title: "Upload & Analyze", subtitle: "Submit binaries and inspect behavior" },
  "/dashboard/reports": { title: "Analysis Reports", subtitle: "Review completed investigations" },
  "/dashboard/threat-intel": { title: "Threat Intelligence", subtitle: "Cross-source IOC intelligence" },
  "/dashboard/threat-intel/virustotal": { title: "VirusTotal Scanner", subtitle: "Multi-engine detection telemetry" },
  "/dashboard/threat-intel/unified": { title: "Unified Scanner", subtitle: "Single query across intel providers" },
  "/dashboard/integrations": { title: "Integrations", subtitle: "Connected provider management" },
  "/dashboard/frameworks": { title: "Frameworks", subtitle: "Mapping to security knowledge bases" },
}

const breadcrumbNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload",
  reports: "Reports",
  "threat-intel": "Threat Intel",
  virustotal: "VirusTotal",
  abuseipdb: "AbuseIPDB",
  abusech: "Abuse.ch",
  alienvault: "AlienVault",
  malwarebazaar: "MalwareBazaar",
  filescan: "Filescan",
  hybridanalysis: "Hybrid Analysis",
  unified: "Unified Scanner",
  integrations: "Integrations",
  frameworks: "Frameworks",
  "mitre-attack": "MITRE ATT&CK",
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTitle, setCurrentTitle] = useState("Dashboard")
  const [currentSubtitle, setCurrentSubtitle] = useState("Operational overview")
  const [userName, setUserName] = useState("Analyst")
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const storedUser = apiService.getStoredUser()
    if (storedUser?.name) {
      setUserName(storedUser.name)
    }
  }, [])

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }

    updateTime()
    const timer = window.setInterval(updateTime, 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    // Find the best matching title
    let page = { title: "Dashboard", subtitle: "Operational overview" }
    const matchingPath = Object.keys(pageTitles)
      .filter(path => pathname?.startsWith(path))
      .sort((a, b) => b.length - a.length)[0]
    
    if (matchingPath) {
      page = pageTitles[matchingPath]
    }
    
    setCurrentTitle(page.title)
    setCurrentSubtitle(page.subtitle)
  }, [pathname])

  const breadcrumbSegments = (pathname || "/dashboard")
    .split("/")
    .filter(Boolean)
    .slice(1)

  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: breadcrumbNameMap[segment] || segment.replace(/-/g, " "),
    path: `/${["dashboard", ...breadcrumbSegments.slice(1, index + 1)].join("/")}`,
    isLast: index === breadcrumbSegments.length - 1,
  }))
  const shouldShowBreadcrumbs = breadcrumbItems.length > 1

  const userInitial = (userName || "A").trim().charAt(0).toUpperCase()

  return (
    <header className="h-16 border-b border-border/80 bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate">{currentTitle}</h1>
          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
          <p className="hidden xl:block text-xs text-muted-foreground truncate">{currentSubtitle}</p>
        </div>

        {shouldShowBreadcrumbs && (
          <div className="mt-1 hidden md:flex items-center gap-1 text-xs text-muted-foreground/90">
            {breadcrumbItems.map((item) => (
              <div key={item.path} className="inline-flex items-center gap-1">
                {item.isLast ? (
                  <span className="text-foreground/90">{item.label}</span>
                ) : (
                  <button
                    className="hover:text-foreground transition-colors"
                    onClick={() => router.push(item.path)}
                  >
                    {item.label}
                  </button>
                )}
                {!item.isLast && <ChevronRight className="w-3 h-3" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden lg:inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
          title="Command palette coming soon"
        >
          <Command className="w-3.5 h-3.5" />
          Quick Actions
          <span className="rounded border border-border/70 px-1.5 py-0.5 text-[10px]">Ctrl+K</span>
        </button>

        <div className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/50 px-2.5 py-1.5 text-xs text-muted-foreground">
          <Clock3 className="w-3.5 h-3.5" />
          {currentTime}
        </div>

        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/50 px-2.5 md:px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
          title="Profile"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
            {userInitial}
          </span>
          <span className="hidden md:inline">{userName}</span>
        </button>

        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          title="Notifications"
        >
          <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push("/dashboard/integrations")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            apiService.logout()
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}