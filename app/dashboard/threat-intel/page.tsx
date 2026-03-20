"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Shield,
  Globe,
  Database,
  AlertTriangle,
  Cpu,
  Zap,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
  Brain,
  Lock,
  Radar,
  CheckCircle,
  TrendingUp,
  Package,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ThreatService {
  id: string
  name: string
  description: string
  fullDescription: string
  category: string
  icon: LucideIcon
  color: string
  iconBg: string
  features: string[]
  capabilities: string[]
  rateLimit: string
  requiresAuth: boolean
  link: string
  apiDocs: string
}

const THREAT_SERVICES: ThreatService[] = [
  {
    id: "virustotal",
    name: "VirusTotal",
    description: "Multi-engine malware reputation service",
    fullDescription:
      "VirusTotal aggregates many antivirus engines and URL/domain/IP reputation services. Analyze suspicious files, URLs, domains, and IP addresses to detect malware and other breaches.",
    category: "Multi-Engine Analysis",
    icon: Shield,
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-500/10 border-blue-500/25",
    features: [
      "File hash lookup",
      "URL scanning",
      "Domain reputation",
      "IP analysis",
      "Community insights",
      "YARA rules",
    ],
    capabilities: [
      "55+ antivirus engines",
      "File behavior analysis",
      "Domain whois data",
      "Historical data",
      "Relationship mapping",
    ],
    rateLimit: "4 requests/min (free)",
    requiresAuth: true,
    link: "/dashboard/threat-intel/virustotal",
    apiDocs: "https://docs.virustotal.com/reference/overview",
  },
  {
    id: "abuseipdb",
    name: "AbuseIPDB",
    description: "IP abuse confidence scoring system",
    fullDescription:
      "AbuseIPDB is a project managed by E.C. Council to help combat the spread of hackers and botnets. Query and report IP addresses for abuse and malicious activity.",
    category: "Network Intelligence",
    icon: Globe,
    color: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-500/10 border-emerald-500/25",
    features: [
      "IP confidence score",
      "Abuse history lookup",
      "Reports from community",
      "ASN/ISP data",
      "Blacklist checks",
      "Geolocation mapping",
    ],
    capabilities: [
      "15+ million IP addresses",
      "Real-time scoring",
      "Abuse categories",
      "Historical reports",
      "Bulk checking",
    ],
    rateLimit: "1,000 requests/day (free)",
    requiresAuth: true,
    link: "/dashboard/threat-intel/abuseipdb",
    apiDocs: "https://docs.abuseipdb.com/",
  },
  {
    id: "alienvault",
    name: "AlienVault OTX",
    description: "Open threat intelligence pulses",
    fullDescription:
      "AlienVault Open Threat Exchange is the world's first truly open threat intelligence community platform. Access threat pulses, indicators, and malware research from security professionals worldwide.",
    category: "Community Intelligence",
    icon: Radar,
    color: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-500/10 border-purple-500/25",
    features: [
      "Threat pulses",
      "IOC lookup",
      "Threat actor profiles",
      "Malware analysis",
      "Community insights",
      "Subscription alerts",
    ],
    capabilities: [
      "Crowdsourced intelligence",
      "Real-time IOC updates",
      "Threat actor tracking",
      "Pulse subscriptions",
      "Relationship graphs",
    ],
    rateLimit: "10 requests/min",
    requiresAuth: true,
    link: "/dashboard/threat-intel/alienvault",
    apiDocs: "https://otx.alienvault.com/api",
  },
  {
    id: "abusech",
    name: "Abuse.ch (ThreatFox)",
    description: "Malware IOC database by Abuse.ch",
    fullDescription:
      "ThreatFox is a free platform run by Abuse.ch for sharing indicators of compromise (IOCs) associated with malware. Access crowdsourced malware intelligence and indicators.",
    category: "IOC Repository",
    icon: AlertTriangle,
    color: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-500/10 border-amber-500/25",
    features: [
      "IOC lookup",
      "Malware family mapping",
      "Indicator tags",
      "Type classification",
      "Confidence scores",
      "MITRE ATT&CK mapping",
    ],
    capabilities: [
      "Public API access",
      "Free usage",
      "Crowdsourced IOCs",
      "Real-time updates",
      "No authentication required",
    ],
    rateLimit: "Public API",
    requiresAuth: false,
    link: "/dashboard/threat-intel/abusech",
    apiDocs: "https://threatfox.abuse.ch/api/",
  },
  {
    id: "malwarebazaar",
    name: "MalwareBazaar",
    description: "Malware sample intelligence repository",
    fullDescription:
      "MalwareBazaar is a free malware sample repository operated by Abuse.ch. Query malware samples by hash, access sample metadata, and analyze malware families.",
    category: "Sample Repository",
    icon: Database,
    color: "from-pink-500 to-pink-600",
    iconBg: "bg-pink-500/10 border-pink-500/25",
    features: [
      "Sample metadata",
      "Hash search (MD5/SHA1/SHA256)",
      "Family attribution",
      "Tag filtering",
      "Submission history",
      "Download links",
    ],
    capabilities: [
      "10+ million samples",
      "Automated analysis",
      "File extraction",
      "YARA rules",
      "Free access",
    ],
    rateLimit: "120 requests/hour",
    requiresAuth: false,
    link: "/dashboard/threat-intel/malwarebazaar",
    apiDocs: "https://bazaar.abuse.ch/api/",
  },
  {
    id: "hybridanalysis",
    name: "Hybrid Analysis",
    description: "Advanced sandbox analysis platform",
    fullDescription:
      "Hybrid Analysis, powered by Falcon Sandbox, provides advanced malware analysis with comprehensive behavioral traces, network analysis, and threat scoring powered by machine learning.",
    category: "Sandbox Analysis",
    icon: Cpu,
    color: "from-orange-500 to-orange-600",
    iconBg: "bg-orange-500/10 border-orange-500/25",
    features: [
      "Behavior analysis",
      "MITRE ATT&CK mapping",
      "Network traces",
      "YARA rules",
      "Process tree analysis",
      "String extraction",
    ],
    capabilities: [
      "Advanced sandboxing",
      "Machine learning scoring",
      "Threat indicators",
      "Code injection detection",
      "Exploit detection",
    ],
    rateLimit: "10 requests/min (free)",
    requiresAuth: true,
    link: "/dashboard/threat-intel/hybridanalysis",
    apiDocs: "https://www.hybrid-analysis.com/docs/api/v2",
  },
  {
    id: "filescan",
    name: "Filescan.io",
    description: "Cloud-based file and URL scanner",
    fullDescription:
      "Filescan.io is a cloud sandboxing platform for in-depth analysis of files and URLs. Provides extracted artifacts, IOC enrichment, and detailed forensic insights.",
    category: "Cloud Sandbox",
    icon: Lock,
    color: "from-cyan-500 to-cyan-600",
    iconBg: "bg-cyan-500/10 border-cyan-500/25",
    features: [
      "File sandbox",
      "URL scanning",
      "Extracted artifacts",
      "OSINT enrichment",
      "Memory dumps",
      "API integration",
    ],
    capabilities: [
      "Cloud analysis",
      "Quick results",
      "Artifact extraction",
      "Relationship mapping",
      "Deep inspection",
    ],
    rateLimit: "10 requests/min (free)",
    requiresAuth: true,
    link: "/dashboard/threat-intel/filescan",
    apiDocs: "https://www.filescan.io/api/docs",
  },
  {
    id: "unified",
    name: "Unified Scanner",
    description: "Cross-source orchestration engine",
    fullDescription:
      "Unified Scanner orchestrates queries across all integrated threat intelligence services. Automatically detects indicators and performs parallel lookups for consolidated threat analysis.",
    category: "Orchestration",
    icon: Zap,
    color: "from-green-500 to-green-600",
    iconBg: "bg-green-500/10 border-green-500/25",
    features: [
      "Auto IOC detection",
      "Parallel lookups",
      "Unified evidence",
      "Risk summary",
      "Browser integration",
      "Custom workflows",
    ],
    capabilities: [
      "Multi-service queries",
      "Real-time correlation",
      "Threat aggregation",
      "Context enrichment",
      "Automated analysis",
    ],
    rateLimit: "Depends on services",
    requiresAuth: false,
    link: "/dashboard/threat-intel/unified",
    apiDocs: "/dashboard/threat-intel/unified",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const serviceIconTone: Record<string, string> = {
  virustotal: "text-sky-300",
  abuseipdb: "text-emerald-300",
  alienvault: "text-violet-300",
  abusech: "text-amber-300",
  malwarebazaar: "text-rose-300",
  hybridanalysis: "text-orange-300",
  filescan: "text-cyan-300",
  unified: "text-primary",
}

function StatCard({
  icon,
  label,
  value,
  iconTone,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  iconTone: string
}) {
  return (
    <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs uppercase tracking-wider">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#101214] border border-[#1a1a1a] ${iconTone}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </motion.div>
  )
}

function ServiceCard({ service }: { service: ThreatService }) {
  const router = useRouter()
  const Icon = service.icon
  const iconTone = serviceIconTone[service.id] ?? "text-slate-200"

  return (
    <motion.div
      variants={itemVariants}
      className="group rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 hover:border-[#2a2a2a] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-3 rounded-lg border border-[#1a1a1a] bg-[#101214]">
            <Icon className={`w-6 h-6 ${iconTone}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{service.name}</h3>
            <p className="text-xs text-primary font-medium mt-1">{service.category}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.fullDescription}</p>

      {/* Features Grid */}
      <div className="mb-4 pb-4 border-t border-[#1a1a1a]">
        <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3 pt-4">Key Features</p>
        <div className="grid grid-cols-2 gap-2">
          {service.features.slice(0, 4).map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 text-emerald-300 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
        {service.features.length > 4 && (
          <p className="text-xs text-muted-foreground mt-2">+{service.features.length - 4} more features</p>
        )}
      </div>

      {/* Capabilities */}
      <div className="mb-4 pb-4 border-t border-[#1a1a1a]">
        <p className="text-xs font-semibold text-white uppercase tracking-wider mb-2 pt-4">Capabilities</p>
        <div className="flex flex-wrap gap-1.5">
          {service.capabilities.slice(0, 3).map((capability) => (
            <span key={capability} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/25">
              {capability}
            </span>
          ))}
          {service.capabilities.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted/10 text-muted-foreground border border-[#1a1a1a]">
              +{service.capabilities.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 pb-4 border-t border-[#1a1a1a] pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rate Limit</p>
            <p className="text-xs font-medium text-white">{service.rateLimit}</p>
          </div>
          {service.requiresAuth && (
            <div className="px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs border border-amber-500/25 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Auth Required
            </div>
          )}
          {!service.requiresAuth && (
            <div className="px-2 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs border border-green-500/25 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              No Auth
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => router.push(service.link)}
          className="flex-1 px-3 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Launch
        </button>
        <a
          href={service.apiDocs}
          target={service.apiDocs.startsWith("http") ? "_blank" : undefined}
          rel={service.apiDocs.startsWith("http") ? "noopener noreferrer" : undefined}
          className="px-3 py-2 rounded-lg border border-[#1a1a1a] bg-[#101214] text-slate-200 hover:text-white text-sm font-medium hover:border-[#2a2a2a] hover:bg-[#141a21] transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4 text-sky-300" />
          Docs
        </a>
      </div>
    </motion.div>
  )
}

export default function ThreatIntelPage() {
  return (
    <div className="relative min-h-full bg-[#080808]">
      {/* Background Effects */}
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

      {/* Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Radar className="w-8 h-8 text-sky-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-2">Intelligence Hub</p>
                <h1 className="text-3xl font-bold text-white">Threat Intelligence Services</h1>
                <p className="text-muted-foreground mt-2 whitespace-nowrap">
                  Access a comprehensive suite of threat intelligence platforms for malware analysis, IOC lookups, and security research.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={<Package className="w-4 h-4" />} label="Services" value={THREAT_SERVICES.length} iconTone="text-cyan-300" />
            <StatCard icon={<Shield className="w-4 h-4" />} label="Threat Types" value="8+" iconTone="text-emerald-300" />
            <StatCard icon={<Brain className="w-4 h-4" />} label="Intelligence Types" value="10+" iconTone="text-violet-300" />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Data Sources" value="50+" iconTone="text-amber-300" />
          </motion.div>

          {/* Services Grid */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {THREAT_SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </motion.div>

          {/* Info Section */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-300" />
              How to Use Threat Intelligence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#1a1a1a]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</div>
                  <h3 className="font-semibold text-white">Choose a Service</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the threat intelligence source that matches your investigation needs (hash lookups, IP analysis, domain checks, etc.).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</div>
                  <h3 className="font-semibold text-white">Configure API Keys</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visit Integrations to set up your API keys (or use our pre-configured default keys) for each service you want to use.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</div>
                  <h3 className="font-semibold text-white">Launch Analysis</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click Launch to access the service. Submit your indicators (hashes, IPs, domains, URLs) for instant threat analysis.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Unified Scanner CTA */}
          <motion.div variants={itemVariants} className="rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-transparent p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-primary" />
                  Unified Scanner
                </h3>
                <p className="text-sm text-muted-foreground">
                  Run cross-source queries against all services simultaneously. Perfect for rapid threat assessment and comprehensive IOC enrichment.
                </p>
              </div>
              <a
                href="/dashboard/threat-intel/unified"
                className="px-6 py-3 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Launch Unified
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
