// components/layout/Sidebar.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Upload, FileText, Shield, ChevronDown, ChevronRight, Plug, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Upload & Analyze", path: "/dashboard/upload" },
  { icon: FileText, label: "Reports", path: "/dashboard/reports" },
  { 
    icon: Shield, 
    label: "Threat Intel", 
    path: "/dashboard/threat-intel",
    submenu: [
      { icon: Cpu, label: "VirusTotal", path: "/dashboard/threat-intel/virustotal" },
      // We'll add more threat intel sources here as they become available
    ]
  },
  { 
    icon: Plug, 
    label: "Integrations", 
    path: "/dashboard/integrations",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const isActive = (itemPath: string) => {
    return pathname === itemPath || pathname?.startsWith(itemPath + '/')
  }

  const renderMenuItem = (item: any, depth = 0) => {
    const Icon = item.icon
    const isItemActive = isActive(item.path)
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = expandedMenus[item.label] || false

    return (
      <div key={item.path} className="space-y-1">
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.label)
            } else {
              router.push(item.path)
            }
          }}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            isItemActive
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            depth > 0 && "ml-4"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </div>
          {hasSubmenu && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          )}
        </button>

        {hasSubmenu && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.submenu.map((subItem: any) => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 glass border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary neon-text" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Chameleon</h1>
            <p className="text-xs text-muted-foreground">Malware Analysis</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="glass rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Backend Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-foreground">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}