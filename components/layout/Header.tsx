// components/layout/Header.tsx
"use client"

import { Bell, Settings, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/upload": "Upload & Analyze",
  "/dashboard/reports": "Analysis Reports",
  "/dashboard/threat-intel": "Threat Intelligence",
  "/dashboard/threat-intel/virustotal": "VirusTotal Scanner",
  "/dashboard/integrations": "Integrations",
}

export function Header() {
  const pathname = usePathname()
  const [currentTitle, setCurrentTitle] = useState("Dashboard")

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
    <header className="h-16 glass border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">{currentTitle}</h1>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button 
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}