// components/layout/Sidebar.tsx - Updated logo section
"use client"

import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  Upload, 
  FileText, 
  Shield, 
  ChevronDown, 
  ChevronRight, 
  Plug, 
  Cpu,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Fixed isActive function
  const isActive = (itemPath: string, hasSubmenu = false) => {
    // For dashboard, only match exact path
    if (itemPath === "/dashboard") {
      return pathname === "/dashboard"
    }
    
    // For items with submenus, check if current path starts with itemPath
    if (hasSubmenu) {
      return pathname?.startsWith(itemPath)
    }
    
    // For other items, check exact match or if it's a direct child
    return pathname === itemPath || pathname?.startsWith(`${itemPath}/`)
  }

  const renderMenuItem = (item: any, depth = 0) => {
    const Icon = item.icon
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isItemActive = isActive(item.path, hasSubmenu)
    const isExpanded = expandedMenus[item.label] || false

    return (
      <div key={item.path} className="space-y-1">
        <button
          onClick={() => {
            if (hasSubmenu) {
              if (!isCollapsed) {
                toggleSubmenu(item.label)
              }
            } else {
              router.push(item.path)
              if (isMobile) {
                setIsCollapsed(true)
              }
            }
          }}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            isItemActive
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            depth > 0 && "ml-4",
            isCollapsed && "justify-center px-3"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            )}
          </div>
          
          {hasSubmenu && !isCollapsed && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )
          )}
        </button>

        {hasSubmenu && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.submenu.map((subItem: any) => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-lg md:hidden shadow-lg"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "glass border-r border-border flex flex-col transition-all duration-300 overflow-hidden",
        isCollapsed 
          ? "w-16" 
          : "w-64",
        "fixed md:relative h-screen z-40 bg-background"
      )}>
        {/* Logo and toggle - FIXED */}
        <div className={cn(
          "border-b border-border flex items-center transition-all duration-300",
          isCollapsed ? "p-3 justify-center" : "p-4 justify-between"
        )}>
          {/* Logo when expanded */}
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          )}>
            <Shield className="w-8 h-8 text-primary neon-text flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">Chameleon</h1>
              <p className="text-xs text-muted-foreground truncate">Malware Analysis</p>
            </div>
          </div>
          
          {/* Desktop toggle button */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0",
                isCollapsed ? "absolute right-1.5" : ""
              )}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4 rotate-180" />
              )}
            </button>
          )}
          
          {/* Logo when collapsed (centered) */}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <Shield className="w-8 h-8 text-primary neon-text" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-border">
          <div className={cn(
            "glass rounded-lg transition-all duration-300",
            isCollapsed ? "p-2 flex flex-col items-center" : "p-4"
          )}>
            {!isCollapsed ? (
              <>
                <p className="text-xs text-muted-foreground mb-2">Backend Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-foreground">Connected</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse mb-1" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}