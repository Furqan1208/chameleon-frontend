// components/layout/Sidebar.tsx - FIXED SCROLLING VERSION
"use client"

import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  Upload, 
  FileText, 
  Shield, 
  ChevronDown, 
  Cpu, 
  Globe,
  Menu,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Database,
  Activity,
  Zap,
  Sparkles,
  ShieldCheck,
  Lock,
  Fingerprint,
  Brain,
  Network,
  Cloud,
  Radar,
  Bot,
  Scan,
  Eye,
  AlertOctagon,
  Gauge,
  Layers,
  Workflow,
  Compass,
  Box,
  Server,
  Target,
  Radio,
  Satellite,
  Atom,
  Search,
  Command,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import { useUiPreferences } from "@/hooks/useUiPreferences"
import { SidebarPreferences } from "@/lib/types/preferences"
import { Logo } from "@/components/ui/Logo"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced menu items with better icons
const menuItems = [
  { 
    icon: Home, 
    label: "Dashboard", 
    path: "/dashboard",
    section: "Core",
    description: "Overview & stats",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Upload, 
    label: "Upload & Analyze", 
    path: "/dashboard/upload",
    section: "Core",
    description: "Submit new files",
    color: "from-green-500 to-emerald-500"
  },
  { 
    icon: FileText, 
    label: "Reports", 
    path: "/dashboard/reports",
    section: "Core",
    description: "View analysis results",
    color: "from-orange-500 to-amber-500"
  },
  { 
    icon: Shield, 
    label: "Threat Intel", 
    path: "/dashboard/threat-intel",
    section: "Intelligence",
    description: "Multi-source scanning",
    color: "from-purple-500 to-pink-500",
    submenu: [
      { 
        icon: Cpu, 
        label: "VirusTotal", 
        path: "/dashboard/threat-intel/virustotal",
        description: "70+ AV engines",
        color: "from-blue-500 to-indigo-500",
        badge: "Popular"
      },
      { 
        icon: Brain, 
        label: "Hybrid Analysis", 
        path: "/dashboard/threat-intel/hybridanalysis",
        description: "Sandbox analysis",
        color: "from-purple-500 to-violet-500",
        badge: "New",
        badgeColor: "purple"
      },
      { 
        icon: Radar, 
        label: "AbuseIPDB", 
        path: "/dashboard/threat-intel/abuseipdb",
        description: "IP reputation",
        color: "from-red-500 to-orange-500"
      },
      { 
        icon: Network, 
        label: "Abuse.ch", 
        path: "/dashboard/threat-intel/abusech",
        description: "URLhaus & ThreatFox",
        color: "from-cyan-500 to-blue-500"
      },
      { 
        icon: Satellite, 
        label: "AlienVault OTX", 
        path: "/dashboard/threat-intel/alienvault",
        description: "Community pulses",
        color: "from-teal-500 to-green-500",
        badge: "OTX"
      },
      { 
        icon: Database, 
        label: "MalwareBazaar", 
        path: "/dashboard/threat-intel/malwarebazaar",
        description: "Malware samples",
        color: "from-yellow-500 to-amber-500"
      },
      { 
        icon: Scan, 
        label: "Filescan.io", 
        path: "/dashboard/threat-intel/filescan",
        description: "Deep file analysis",
        color: "from-indigo-500 to-purple-500"
      },
      {
        icon: Zap,
        label: "Unified Scanner",
        path: "/dashboard/threat-intel/unified",
        description: "Search all sources",
        color: "from-pink-500 to-rose-500",
        badge: "New",
        badgeColor: "pink"
      }
    ]
  },
  { 
    icon: Sparkles, 
    label: "ML Dashboard", 
    path: "/dashboard/ml-dashboard",
    section: "Intelligence",
    description: "ML model & classification",
    color: "from-amber-500 to-orange-500"
  },
  { 
    icon: Workflow, 
    label: "Integrations", 
    path: "/dashboard/integrations",
    section: "Platform",
    description: "Connect services",
    color: "from-gray-500 to-slate-500"
  },
  { 
    icon: Layers, 
    label: "Frameworks", 
    path: "/dashboard/frameworks",
    section: "Platform",
    description: "TTP frameworks & analysis",
    color: "from-indigo-500 to-violet-500",
    submenu: [
      {
        icon: ShieldCheck,
        label: "MITRE ATT&CK",
        path: "/dashboard/frameworks/mitre-attack",
        description: "Tactics & techniques",
        color: "from-red-500 to-rose-500"
      }
    ]
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/dashboard/settings",
    section: "Platform",
    description: "UI preferences & configuration",
    color: "from-slate-500 to-gray-500"
  },
]

// Animation variants
const sidebarVariants = {
  expanded: { width: 280 }, // Increased from 256 to give more space
  collapsed: { width: 80 }   // Increased from 72 to prevent icon clipping
}

const menuItemVariants = {
  hover: { scale: 1.02, x: 4, transition: { duration: 0.2 } }
}

const sectionOrder = ["Core", "Intelligence", "Platform"] as const

const quickShortcutRoutes = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Upload", path: "/dashboard/upload", icon: Upload },
  { label: "Reports", path: "/dashboard/reports", icon: FileText },
  { label: "Unified", path: "/dashboard/threat-intel/unified", icon: Zap },
  { label: "VirusTotal", path: "/dashboard/threat-intel/virustotal", icon: Cpu },
  { label: "Hybrid", path: "/dashboard/threat-intel/hybridanalysis", icon: Brain },
  { label: "AbuseIPDB", path: "/dashboard/threat-intel/abuseipdb", icon: Radar },
  { label: "Abuse.ch", path: "/dashboard/threat-intel/abusech", icon: Network },
  { label: "AlienVault", path: "/dashboard/threat-intel/alienvault", icon: Satellite },
  { label: "Filescan", path: "/dashboard/threat-intel/filescan", icon: Scan },
  { label: "ML Dashboard", path: "/dashboard/ml-dashboard", icon: Sparkles },
  { label: "Integrations", path: "/dashboard/integrations", icon: Workflow },
  { label: "Frameworks", path: "/dashboard/frameworks", icon: Layers },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { preferences: uiPreferences } = useUiPreferences()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [shortcutsExpanded, setShortcutsExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Check for mobile - only on client side
  useEffect(() => {
    setMounted(true)
    const savedState = window.localStorage.getItem("chameleon.sidebar.collapsed")
    if (savedState != null) {
      setIsCollapsed(savedState === "true")
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto collapse on mobile
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!mounted) return
    window.localStorage.setItem("chameleon.sidebar.collapsed", String(isCollapsed))
  }, [isCollapsed, mounted])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        setIsCollapsed((prev) => !prev)
        return
      }

      if (event.altKey) {
        const shortcut = quickShortcuts.find((item) => item.key != null && item.key === event.key)
        if (shortcut) {
          event.preventDefault()
          navigateToPath(shortcut.path)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, router])

  // Auto-expand Threat Intel menu when on any threat intel page
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/threat-intel')) {
      setExpandedMenus(prev => ({ ...prev, 'Threat Intel': true }))
    }
  }, [pathname])

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const navigateToPath = (path: string) => {
    router.push(path)
    if (isMobile) {
      setIsCollapsed(true)
    }
  }

  // Fixed isActive function
  const isActive = (itemPath: string, hasSubmenu = false) => {
    if (!mounted) return false;
    
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
    const isHovered = hoveredItem === item.path
    const iconTone = isItemActive
      ? "bg-gradient-to-br from-primary/25 to-primary/10 text-primary ring-1 ring-primary/30"
      : item.path.includes("/threat-intel")
      ? "bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-fuchsia-300"
      : item.path.includes("/upload")
      ? "bg-gradient-to-br from-emerald-500/20 to-lime-500/20 text-emerald-300"
      : item.path.includes("/reports")
      ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-300"
      : item.path.includes("/frameworks")
      ? "bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-300"
      : "bg-gradient-to-br from-cyan-500/20 to-sky-500/20 text-cyan-300"

    // Fixed padding and spacing to prevent clipping
    const paddingLeft = isCollapsed ? "px-0" : depth > 0 ? `pl-${Math.min(depth * 4 + 3, 12)}` : "pl-3"
    
    return (
      <motion.div
        key={item.path}
        variants={menuItemVariants}
        whileHover="hover"
        className="relative"
        onHoverStart={() => setHoveredItem(item.path)}
        onHoverEnd={() => setHoveredItem(null)}
      >
        {/* Active indicator */}
        {isItemActive && !isCollapsed && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-primary rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        <button
          onClick={() => {
            if (hasSubmenu && !isCollapsed) {
              toggleSubmenu(item.label)
            } else {
              navigateToPath(item.path)
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-visible",
            isCollapsed ? "justify-center px-2" : "px-3",
            isItemActive
              ? "bg-gradient-to-r from-primary/18 via-primary/10 to-transparent text-primary border border-primary/25 shadow-[0_0_0_1px_rgba(0,255,136,0.06),0_10px_30px_rgba(0,255,136,0.09)]"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent hover:border-border",
            paddingLeft
          )}
          title={isCollapsed ? item.label : undefined}
        >
          {/* Icon with proper sizing and no clipping */}
          <div className={cn(
            "flex-shrink-0 transition-all duration-200",
            isCollapsed ? "w-10 flex justify-center" : ""
          )}>
            <div className={cn(
              "p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
              iconTone
            )}>
              <Icon className="w-5 h-5 min-w-[20px] min-h-[20px]" />
            </div>
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate text-sm">{item.label}</span>
                  
                  {/* Badge for new items */}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-primary/30 text-primary flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}
              </div>
              
              {hasSubmenu && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        <AnimatePresence initial={false}>
          {hasSubmenu && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1 space-y-1 overflow-hidden ml-6"
            >
              {item.submenu.map((subItem: any) => (
                <motion.div
                  key={subItem.path}
                  className="relative"
                  whileHover={{ x: 4 }}
                >
                  {renderMenuItem(subItem, depth + 1)}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Map menu item labels to preference keys
  const preferenceMap: Record<string, keyof SidebarPreferences> = {
    "Dashboard": "dashboard",
    "Upload & Analyze": "upload",
    "Reports": "reports",
    "Threat Intel": "threat_intel",
    "ML Dashboard": "ml_dashboard",
    "Integrations": "integrations",
    "Frameworks": "frameworks",
  }

  // Filter menu items based on sidebar preferences
  const filteredMenuItems = menuItems.filter((item) => {
    const prefKey = preferenceMap[item.label]
    if (!prefKey) return true
    return uiPreferences.sidebar?.[prefKey] ?? true
  })

  const groupedMenuItems = sectionOrder
    .map((section) => ({
      section,
      items: filteredMenuItems.filter((item) => item.section === section),
    }))
    .filter((group) => group.items.length > 0)

  // Create filtered quick shortcuts based on preferences
  const filteredQuickShortcutRoutes = quickShortcutRoutes.filter((item) => {
    const prefKey = preferenceMap[item.label]
    if (!prefKey) return true
    return uiPreferences.sidebar?.[prefKey] ?? true
  })

  const quickShortcuts = filteredQuickShortcutRoutes.map((item, idx) => {
    const key = idx < 9 ? String(idx + 1) : null
    return {
      ...item,
      key,
      combo: key ? `Alt+${key}` : "Click",
    }
  })

  // Don't render sidebar until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-20 flex-col border-r border-border/70 bg-[#131313] z-40 md:w-72">
        <div className="border-b border-border/50 p-4">
          <div className="h-8 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 rounded-xl border border-border bg-card/80 p-2.5 backdrop-blur-xl md:hidden"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ width: isCollapsed ? 80 : 280 }}
        className={cn(
          "flex h-screen flex-col overflow-hidden border-r border-border/70 bg-[#131313]/95 z-40 shadow-2xl shadow-black/20 backdrop-blur-xl",
          "fixed md:relative md:shadow-none",
          "md:translate-x-0 transition-transform",
          isMobile && isCollapsed && "-translate-x-full",
          isMobile && !isCollapsed && "translate-x-0"
        )}
      >
        {/* Gradient background effect - fixed positioning */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.10),transparent_35%),radial-gradient(circle_at_88%_8%,rgba(14,165,233,0.08),transparent_32%)]" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:36px_36px]" />
        
        {/* Logo section - fixed height, no overflow */}
        <div className={cn(
          "flex items-center border-b border-border/50 flex-shrink-0",
          isCollapsed ? "justify-center p-4" : "p-4"
        )}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className={cn(
              "flex cursor-pointer items-center gap-3 transition-all duration-200",
              isCollapsed ? "justify-center" : ""
            )}
            title="Go to Home"
          >
            <Logo type="icon" size="md" className="text-primary flex-shrink-0" />
            
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0"
              >
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-base font-semibold tracking-tight text-white">
                    Chameleon
                  </h1>
                </div>
                <p className="truncate text-xs text-white/60">Adaptive Malware Intelligence</p>
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Navigation - FIXED SCROLLING */}
        <nav className="flex-1 min-h-0 flex flex-col">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
            style={{ 
              scrollbarWidth: 'thin',
              overscrollBehavior: 'contain'
            }}
          >
            {!isCollapsed && (
              <button
                className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition-colors hover:border-white/10 hover:bg-white/[0.05] flex-shrink-0"
                title="Quick search coming soon"
              >
                <span className="inline-flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Quick Search</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-white/75 flex-shrink-0">
                  <Command className="w-3 h-3" />
                  K
                </span>
              </button>
            )}

            <div className="space-y-4">
              {groupedMenuItems.map((group) => (
                <div key={group.section} className="flex-shrink-0">
                  {!isCollapsed && (
                    <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                      {group.section}
                    </p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => renderMenuItem(item))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer section - fixed at bottom, no overflow */}
        <div className="flex-shrink-0 p-4 border-t border-border">
          {!isCollapsed && !isMobile && (
            <div className="mb-3 rounded-xl border border-border bg-white/[0.03] p-3">
              <button
                onClick={() => setShortcutsExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between text-xs"
              >
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <Zap className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Quick Shortcuts</span>
                </span>
                <span className="inline-flex items-center gap-2 text-white/55 flex-shrink-0">
                  <span className="text-[10px]">Alt+1..9</span>
                  {shortcutsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRightIcon className="w-3.5 h-3.5" />}
                </span>
              </button>

              <AnimatePresence>
                {shortcutsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 mt-2 overflow-hidden"
                  >
                    {quickShortcuts.map((shortcut) => {
                      const Icon = shortcut.icon

                      return (
                        <button
                          key={shortcut.path}
                          onClick={() => navigateToPath(shortcut.path)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
                            pathname === shortcut.path
                              ? "bg-primary/10 text-primary"
                              : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{shortcut.label}</span>
                          </span>
                          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/70 flex-shrink-0 ml-2">
                            {shortcut.combo}
                          </span>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Desktop toggle button */}
          {!isMobile && (
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.03] transition-colors hover:bg-white/[0.06] flex-shrink-0",
                  isCollapsed ? "w-full" : "w-8"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-4 h-4 text-white/65" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-white/65" />
                )}
              </motion.button>
            </div>
          )}

          {/* Version info */}
          {!isCollapsed && !isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-white/55">v2.0.0</p>
              </div>
            </motion.div>
          )}
          
          {/* Minimal version info for collapsed state */}
          {isCollapsed && !isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mx-auto" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>
    </>
  )
}