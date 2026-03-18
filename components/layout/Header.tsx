// components/layout/Header.tsx
"use client"

import { Bell, Settings, LogOut, UserCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { apiService } from "@/services/api/api.service"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/upload": "Upload & Analyze",
  "/dashboard/reports": "Analysis Reports",
  "/dashboard/threat-intel": "Threat Intelligence",
  "/dashboard/threat-intel/virustotal": "VirusTotal Scanner",
  "/dashboard/integrations": "Integrations",
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTitle, setCurrentTitle] = useState("Dashboard")
  const [userName, setUserName] = useState("Analyst")

  useEffect(() => {
    const storedUser = apiService.getStoredUser()
    if (storedUser?.name) {
      setUserName(storedUser.name)
    }
  }, [])

  useEffect(() => {
    // Find the best matching title
    let title = "Dashboard"
    const matchingPath = Object.keys(pageTitles)
      .filter(path => pathname?.startsWith(path))
      .sort((a, b) => b.length - a.length)[0]
    
    if (matchingPath) {
      title = pageTitles[matchingPath]
    }
    
    setCurrentTitle(title)
  }, [pathname])

  return (
    <header className="h-14 border-b border-border/80 bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-foreground">{currentTitle}</h1>
        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-border"
          title="Profile"
        >
          <UserCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{userName}</span>
        </button>
        <button
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
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