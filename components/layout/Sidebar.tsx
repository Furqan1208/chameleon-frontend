// components/layout/Sidebar.tsx
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
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Logo } from "@/components/ui/Logo"

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
        "fixed md:relative h-screen z-40 bg-background",
        "md:translate-x-0 transition-transform",
        isMobile && isCollapsed && "-translate-x-full",
        isMobile && !isCollapsed && "translate-x-0"
      )}>
        {/* Logo section - Clickable to go to home page */}
        <div className={cn(
          "border-b border-border flex items-center transition-all duration-300",
          isCollapsed ? "p-4 justify-center" : "p-4 justify-center"
        )}>
          {/* Clickable logo to go to home page */}
          <button 
            onClick={() => router.push("/")}
            className={cn(
              "flex items-center gap-3 transition-all duration-300 group cursor-pointer hover:opacity-80",
              isCollapsed ? "justify-center" : ""
            )}
            title="Go to Home"
          >
            <Logo type="icon" size="md" className="text-primary neon-text flex-shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">Chameleon</h1>
                <p className="text-xs text-muted-foreground truncate">Malware Analysis</p>
              </div>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Footer section with toggle button */}
        <div className="p-4 border-t border-border">
          {/* Desktop toggle button */}
          {!isMobile && (
            <div className="flex justify-end">
              <button
                onClick={toggleSidebar}
                className={cn(
                  "p-2 rounded-lg hover:bg-muted transition-all duration-200 flex items-center justify-center group relative",
                  "border border-border hover:border-primary/30",
                  isCollapsed ? "w-10 h-10" : "w-10 h-10"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {/* Fixed arrow direction: left arrow when expanded, right arrow when collapsed */}
                {isCollapsed ? (
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Expand
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Version info */}
          {!isCollapsed && !isMobile && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          )}
          
          {/* Minimal version info for collapsed state */}
          {isCollapsed && !isMobile && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground rotate-90 whitespace-nowrap">v1.0</p>
            </div>
          )}
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