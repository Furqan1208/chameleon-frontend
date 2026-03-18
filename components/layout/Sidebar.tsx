// components/layout/Sidebar.tsx - IMPROVED VERSION
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
  Globe,
  Menu,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Database,
  Cpu as CpuIcon,
  Activity,
  Zap,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
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
  Shield as ShieldIcon,
  Target,
  Radio,
  Satellite,
  Atom
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Logo } from "@/components/ui/Logo"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced menu items with better icons
const menuItems = [
  { 
    icon: Home, 
    label: "Dashboard", 
    path: "/dashboard",
    description: "Overview & stats",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Upload, 
    label: "Upload & Analyze", 
    path: "/dashboard/upload",
    description: "Submit new files",
    color: "from-green-500 to-emerald-500"
  },
  { 
    icon: FileText, 
    label: "Reports", 
    path: "/dashboard/reports",
    description: "View analysis results",
    color: "from-orange-500 to-amber-500"
  },
  { 
    icon: Shield, 
    label: "Threat Intel", 
    path: "/dashboard/threat-intel",
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
    icon: Workflow, 
    label: "Integrations", 
    path: "/dashboard/integrations",
    description: "Connect services",
    color: "from-gray-500 to-slate-500"
  },
  { 
    icon: Layers, 
    label: "Frameworks", 
    path: "/dashboard/frameworks",
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
]

// Animation variants
const sidebarVariants = {
  expanded: { width: 256 },
  collapsed: { width: 72 }
}

const menuItemVariants = {
  hover: { scale: 1.02, x: 4, transition: { duration: 0.2 } }
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Check for mobile - only on client side
  useEffect(() => {
    setMounted(true)
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
            if (hasSubmenu) {
              if (!isCollapsed) {
                toggleSubmenu(item.label)
              } else {
                // On collapsed, just go to the main path
                router.push(item.path)
              }
            } else {
              router.push(item.path)
              if (isMobile) {
                setIsCollapsed(true)
              }
            }
          }}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
            isItemActive
              ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            depth > 0 && "ml-3",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          {/* Hover tint */}
          {isHovered && !isItemActive && (
            <div className="absolute inset-0 bg-muted/30 rounded-xl" />
          )}

          <div className="flex items-center gap-3 min-w-0 relative z-10">
            <div className={cn(
              "relative",
              isCollapsed ? "flex-shrink-0" : "flex-shrink-0"
            )}>
              {/* Icon with gradient background */}
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                isItemActive 
                  ? "bg-primary/20 text-primary"
                  : "text-inherit group-hover:scale-110"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              

            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate text-sm">{item.label}</span>
                  
                  {/* Badge for new items */}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-primary/30 text-primary">
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
            )}
          </div>
          
          {hasSubmenu && !isCollapsed && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </motion.div>
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
              className="mt-1 space-y-1 overflow-hidden"
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

  // Don't render sidebar until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="glass border-r border-border flex flex-col w-16 md:w-64 h-screen z-40 bg-background/95 backdrop-blur-xl">
        <div className="border-b border-border/50 p-4">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
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
          className="fixed top-4 left-4 z-50 p-2.5 bg-background border border-border rounded-lg md:hidden"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3 }}
        className={cn(
          "glass border-r border-border/50 flex flex-col h-screen z-40 bg-background/95 backdrop-blur-xl",
          "fixed md:relative shadow-2xl md:shadow-none",
          "md:translate-x-0 transition-transform",
          isMobile && isCollapsed && "-translate-x-full",
          isMobile && !isCollapsed && "translate-x-0"
        )}
      >
        {/* Gradient background effect */}
        <div className="absolute inset-0 pointer-events-none" />
        
        {/* Logo section */}
        <motion.div 
          className={cn(
            "border-b border-border/50 flex items-center",
            isCollapsed ? "p-4 justify-center" : "p-4"
          )}
        >
          {/* Clickable logo */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/")}
            className={cn(
              "flex items-center gap-3 transition-all duration-200 cursor-pointer",
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
                <h1 className="text-base font-semibold text-foreground truncate">
                  Chameleon
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Malware Analysis
                </p>
              </motion.div>
            )}
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted/50 hover:scrollbar-thumb-muted">
          <div className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Footer section */}
        <div className="p-4 border-t border-border/50">
          
          {/* Desktop toggle button */}
          {!isMobile && (
            <div className="flex justify-end relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className={cn(
                  "p-2 rounded-lg hover:bg-muted/40 transition-colors flex items-center justify-center",
                  "border border-border/60",
                  isCollapsed ? "w-8 h-8" : "w-8 h-8"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                
                {/* Tooltip */}
                {isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg"
                  >
                    {isCollapsed ? "Expand" : "Collapse"}
                  </motion.div>
                )}
              </motion.button>
            </div>
          )}

          {/* Version info */}
          {!isCollapsed && !isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center relative z-10"
            >
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-muted-foreground">v2.0.0</p>
              </div>
            </motion.div>
          )}
          
          {/* Minimal version info for collapsed state */}
          {isCollapsed && !isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center relative z-10"
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