"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plug,
  Search,
  Shield,
  Globe,
  Cpu,
  AlertTriangle,
  Database,
  Zap,
  CheckCircle,
  ChevronRight,
  Key,
  Unlock,
  ExternalLink,
  BookOpen,
  Layers,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type IntegrationStatus = "active" | "degraded" | "inactive"

type Integration = {
  id: string
  name: string
  description: string
  category: "Threat Intelligence" | "Sandbox Analysis" | "Malware Repository" | "Meta Integration"
  icon: LucideIcon
  status: IntegrationStatus
  setupRequired: boolean
  usage: string
  apiDocs: string
  page?: string
  features: string[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: "virustotal",
    name: "VirusTotal",
    description: "Multi-engine malware reputation for files, IPs, domains, and URLs.",
    category: "Threat Intelligence",
    icon: Shield,
    status: "active",
    setupRequired: true,
    usage: "4 requests/min (free tier)",
    apiDocs: "https://docs.virustotal.com/reference/overview",
    page: "/dashboard/threat-intel/virustotal",
    features: ["Hash lookup", "URL analysis", "Domain/IP reputation", "Community context"],
  },
  {
    id: "abuseipdb",
    name: "AbuseIPDB",
    description: "IP abuse confidence and historical reports for network investigations.",
    category: "Threat Intelligence",
    icon: Globe,
    status: "active",
    setupRequired: true,
    usage: "1,000 requests/day (free tier)",
    apiDocs: "https://docs.abuseipdb.com/",
    page: "/dashboard/threat-intel/abuseipdb",
    features: ["IP scoring", "Historical abuse reports", "ASN/ISP data", "Blacklist checks"],
  },
  {
    id: "threatfox",
    name: "ThreatFox",
    description: "IOC database from Abuse.ch with malware-linked indicators and tags.",
    category: "Threat Intelligence",
    icon: AlertTriangle,
    status: "active",
    setupRequired: false,
    usage: "Public API",
    apiDocs: "https://threatfox.abuse.ch/api/",
    page: "/dashboard/threat-intel/abusech",
    features: ["IOC lookup", "Malware family mapping", "Indicator tags", "Type classification"],
  },
  {
    id: "malwarebazaar",
    name: "MalwareBazaar",
    description: "Malware sample intelligence from Abuse.ch with rich hash and family context.",
    category: "Malware Repository",
    icon: Database,
    status: "active",
    setupRequired: false,
    usage: "120 requests/hour",
    apiDocs: "https://bazaar.abuse.ch/api/",
    page: "/dashboard/threat-intel/malwarebazaar",
    features: ["Sample metadata", "Hash search", "Family attribution", "Tag filtering"],
  },
  {
    id: "hybridanalysis",
    name: "Hybrid Analysis",
    description: "Sandbox analysis with deep behavior traces and threat scoring.",
    category: "Sandbox Analysis",
    icon: Cpu,
    status: "active",
    setupRequired: true,
    usage: "10 requests/min (free tier)",
    apiDocs: "https://www.hybrid-analysis.com/docs/api/v2",
    page: "/dashboard/threat-intel/hybridanalysis",
    features: ["Behavior analysis", "MITRE ATT&CK context", "Network traces", "YARA support"],
  },
  {
    id: "filescan",
    name: "Filescan.io",
    description: "Cloud sandboxing for files and URLs with extraction and IOC enrichment.",
    category: "Sandbox Analysis",
    icon: Cpu,
    status: "active",
    setupRequired: true,
    usage: "10 requests/min (free tier)",
    apiDocs: "https://www.filescan.io/api/docs",
    page: "/dashboard/threat-intel/filescan",
    features: ["File sandbox", "URL scan", "Extracted artifacts", "OSINT enrichment"],
  },
  {
    id: "alienvault",
    name: "AlienVault OTX",
    description: "Open threat intelligence pulses and indicators from the OTX community.",
    category: "Threat Intelligence",
    icon: Globe,
    status: "active",
    setupRequired: true,
    usage: "10 requests/min",
    apiDocs: "https://otx.alienvault.com/api",
    page: "/dashboard/threat-intel/alienvault",
    features: ["Pulse search", "IOC lookup", "Threat actor context", "Community intelligence"],
  },
  {
    id: "unified",
    name: "Unified Scanner",
    description: "Cross-source query orchestration with consolidated output.",
    category: "Meta Integration",
    icon: Zap,
    status: "active",
    setupRequired: false,
    usage: "Depends on enabled services",
    apiDocs: "/dashboard/threat-intel/unified",
    page: "/dashboard/threat-intel/unified",
    features: ["Auto IOC detection", "Parallel lookups", "Unified evidence", "Risk summary"],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Threat Intelligence":
      return <Shield className="w-4 h-4" />
    case "Sandbox Analysis":
      return <Cpu className="w-4 h-4" />
    case "Malware Repository":
      return <Database className="w-4 h-4" />
    case "Meta Integration":
      return <Zap className="w-4 h-4" />
    default:
      return <Plug className="w-4 h-4" />
  }
}

function getStatusStyle(status: IntegrationStatus) {
  if (status === "active") {
    return {
      label: "Active",
      badge: "bg-primary/10 text-primary border-primary/25",
      dot: "bg-primary",
    }
  }
  if (status === "degraded") {
    return {
      label: "Degraded",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      dot: "bg-amber-400",
    }
  }
  return {
    label: "Inactive",
    badge: "bg-red-500/10 text-red-400 border-red-500/25",
    dot: "bg-red-400",
  }
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = useMemo(
    () => ["all", ...new Set(INTEGRATIONS.map((i) => i.category))],
    []
  )

  const filteredIntegrations = useMemo(() => {
    return INTEGRATIONS.filter((integration) => {
      const matchesCategory =
        activeCategory === "all" || integration.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        integration.name.toLowerCase().includes(q) ||
        integration.description.toLowerCase().includes(q) ||
        integration.features.some((feature) => feature.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const activeCount = INTEGRATIONS.filter((i) => i.status === "active").length
  const keyRequiredCount = INTEGRATIONS.filter((i) => i.setupRequired).length

  return (
    <div className="relative min-h-full bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Plug className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Connections</p>
                <h1 className="text-2xl font-semibold text-white">Integrations</h1>
                <p className="text-muted-foreground mt-1">
                  Security intelligence services connected to your analysis workflow
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/10 text-primary text-sm font-medium inline-flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {activeCount} active
              </span>
              <span className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] text-muted-foreground text-sm inline-flex items-center gap-2">
                <Key className="w-4 h-4" />
                {keyRequiredCount} require API key
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search integrations by name, category, or capability"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1a1a1a] bg-black/20 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const active = activeCategory === category
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors inline-flex items-center gap-2 ${
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-[#1a1a1a] bg-transparent text-muted-foreground hover:text-white hover:border-[#2a2a2a]"
                      }`}
                    >
                      {getCategoryIcon(category)}
                      {category === "all" ? "All" : category}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white inline-flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Service Catalog
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredIntegrations.length} of {INTEGRATIONS.length} services
            </span>
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredIntegrations.map((integration) => {
                const Icon = integration.icon
                const status = getStatusStyle(integration.status)

                return (
                  <motion.div
                    key={integration.id}
                    variants={itemVariants}
                    layout
                    className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5 transition-colors hover:border-[#2a2a2a]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-white/5 text-muted-foreground">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{integration.category}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-1 rounded-md text-xs border inline-flex items-center gap-1.5 ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed min-h-[44px]">
                      {integration.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {integration.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 text-xs rounded-md border border-[#1f1f1f] bg-black/20 text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded-md border border-[#1f1f1f] bg-black/20 text-muted-foreground">
                          +{integration.features.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {integration.setupRequired ? (
                          <>
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            API key required
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            No key required
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={integration.apiDocs}
                          target={integration.apiDocs.startsWith("http") ? "_blank" : undefined}
                          rel={integration.apiDocs.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                        >
                          Docs
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {integration.page && (
                          <button
                            onClick={() => router.push(integration.page!)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:brightness-110 transition-colors"
                          >
                            Open
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-3">Limit: {integration.usage}</p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Integration Guidance
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use Unified Scanner for cross-source lookups and open service pages for targeted investigation.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard/threat-intel/unified")}
                className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Open Unified Scanner
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
