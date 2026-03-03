// app/dashboard/integrations/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Globe, 
  Network, 
  Cpu, 
  AlertTriangle, 
  FileText,
  Plug,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Server,
  Key,
  Settings,
  ExternalLink,
  Search,
  Activity,
  BarChart3,
  Fingerprint,
  Hash,
  Link as LinkIcon,
  Sparkles,
  Rocket,
  Gauge,
  Radar,
  Bot,
  Atom,
  Binary,
  Code,
  Cloud,
  Lock,
  Unlock,
  ChevronRight,
  ArrowRight,
  Copy,
  Download,
  Upload,
  RefreshCw,
  XCircle,
  HelpCircle,
  BookOpen,
  Github,
  Twitter,
  Mail,
  Star,
  GitBranch,
  Users,
  Award,
  Layers,
  Workflow,
  Compass,
  Box,
  Shield as ShieldIcon,
  Target,
  Radio,
  Satellite,
  Scan,
  Eye,
  AlertOctagon
} from "lucide-react"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  }
}

// CORRECTED INTEGRATION STATUS BASED ON ACTUAL IMPLEMENTATIONS
const allIntegrations = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'Multi-engine malware detection with 70+ AV engines and real-time threat scoring',
    category: 'Threat Intelligence',
    icon: Shield,
    gradient: 'from-green-500 to-emerald-500',
    status: 'active',
    features: [
      'File hash analysis (MD5, SHA1, SHA256)',
      'IP address reputation',
      'Domain reputation',
      'URL scanning',
      'Behavioral analysis',
      'Community comments',
      '70+ antivirus engines'
    ],
    apiDocs: 'https://docs.virustotal.com/reference/overview',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_VIRUSTOTAL_API_KEY',
    usage: '4 requests/minute (free tier)',
    page: '/dashboard/threat-intel/virustotal',
    metrics: {
      requests: 1243,
      success: 99.2,
      avgTime: '1.2s'
    }
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    description: 'IP reputation database with community-driven abuse reports and confidence scoring',
    category: 'Threat Intelligence',
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-500',
    status: 'active',
    features: [
      'IP reputation scoring',
      'Abuse reports lookup',
      'Country and ISP information',
      'Blacklist checking',
      'Confidence scoring',
      'Historical data'
    ],
    apiDocs: 'https://docs.abuseipdb.com/',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_ABUSEIPDB_API_KEY',
    usage: '1,000 requests/day (free tier)',
    page: '/dashboard/threat-intel/abuseipdb',
    metrics: {
      requests: 856,
      success: 98.7,
      avgTime: '0.8s'
    }
  },
  {
    id: 'threatfox',
    name: 'ThreatFox (Abuse.ch)',
    description: 'IOC database with malware indicators, tags, and threat intelligence',
    category: 'Threat Intelligence',
    icon: AlertTriangle,
    gradient: 'from-pink-500 to-rose-500',
    status: 'active',
    features: [
      'Malware URL lookup',
      'IP reputation',
      'Domain reputation',
      'File hash association',
      'Threat type classification',
      'Tags and categories'
    ],
    apiDocs: 'https://threatfox.abuse.ch/api/',
    setupRequired: false,
    envVar: 'None required',
    usage: 'Unlimited (public API)',
    page: '/dashboard/threat-intel/abusech',
    metrics: {
      requests: 2341,
      success: 99.5,
      avgTime: '0.5s'
    }
  },
  {
    id: 'malwarebazaar',
    name: 'MalwareBazaar',
    description: 'Malware sample repository with millions of samples and threat intelligence',
    category: 'Malware Repository',
    icon: Database,
    gradient: 'from-purple-500 to-violet-500',
    status: 'active',
    features: [
      'Malware sample lookup',
      'File hash search',
      'Malware family information',
      'Download samples',
      'Tags and classifications',
      'First seen dates'
    ],
    apiDocs: 'https://bazaar.abuse.ch/api/',
    setupRequired: false,
    envVar: 'None required',
    usage: '120 requests/hour (public API)',
    page: '/dashboard/threat-intel/malwarebazaar',
    metrics: {
      requests: 1876,
      success: 99.1,
      avgTime: '0.6s'
    }
  },
  {
    id: 'hybridanalysis',
    name: 'Hybrid Analysis',
    description: 'Advanced sandbox malware analysis with behavioral insights and MITRE ATT&CK mapping',
    category: 'Sandbox Analysis',
    icon: Cpu,
    gradient: 'from-orange-500 to-amber-500',
    status: 'active',
    features: [
      'File submission and analysis',
      'Behavioral analysis',
      'Network traffic analysis',
      'Memory analysis',
      'MITRE ATT&CK mapping',
      'Threat scoring',
      'YARA rule matching'
    ],
    apiDocs: 'https://www.hybrid-analysis.com/docs/api/v2',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY',
    usage: '10 requests/minute (free tier)',
    page: '/dashboard/threat-intel/hybridanalysis',
    metrics: {
      requests: 567,
      success: 97.8,
      avgTime: '2.5s'
    }
  },
  {
    id: 'filescan',
    name: 'Filescan.io',
    description: 'Deep file analysis sandbox with advanced threat detection capabilities',
    category: 'Sandbox Analysis',
    icon: Scan,
    gradient: 'from-indigo-500 to-purple-500',
    status: 'active',
    features: [
      'File upload and analysis',
      'URL scanning',
      'Extracted files analysis',
      'YARA rule matching',
      'OSINT lookups',
      'Phishing detection'
    ],
    apiDocs: 'https://www.filescan.io/api/docs',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_FILESCAN_API_KEY',
    usage: '10 requests/minute (free tier)',
    page: '/dashboard/threat-intel/filescan',
    metrics: {
      requests: 432,
      success: 96.5,
      avgTime: '3.2s'
    }
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    description: 'Open Threat Intelligence with community-driven pulses and indicators',
    category: 'Threat Intelligence',
    icon: Satellite,
    gradient: 'from-teal-500 to-green-500',
    status: 'active',
    features: [
      'Pulse subscriptions',
      'Indicator of Compromise (IOC) lookup',
      'Threat actor tracking',
      'Malware family information',
      'Geographic threat data',
      'Community pulses'
    ],
    apiDocs: 'https://otx.alienvault.com/api',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY',
    usage: '10 requests/minute (free tier)',
    page: '/dashboard/threat-intel/alienvault',
    metrics: {
      requests: 723,
      success: 98.3,
      avgTime: '1.1s'
    }
  },
  {
    id: 'unified',
    name: 'Unified Scanner',
    description: 'Meta-integration that searches across all threat intelligence sources simultaneously',
    category: 'Meta Integration',
    icon: Zap,
    gradient: 'from-pink-500 to-rose-500',
    status: 'active',
    features: [
      'Smart input detection',
      'Parallel multi-source search',
      'Unified results view',
      'Malicious filtering',
      'File upload support',
      'Threat scoring summary'
    ],
    apiDocs: '/docs/unified',
    setupRequired: false,
    envVar: 'Uses individual API keys',
    usage: 'Depends on individual services',
    page: '/dashboard/threat-intel/unified',
    metrics: {
      requests: 892,
      success: 97.2,
      avgTime: '4.5s'
    }
  }
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [copiedEnv, setCopiedEnv] = useState<string | null>(null)

  const categories = ['all', ...new Set(allIntegrations.map(i => i.category))].sort()
  
  const filteredIntegrations = allIntegrations.filter(integration => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.features.some(feat => feat.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const activeIntegrations = filteredIntegrations.filter(i => i.status === 'active')
  
  const totalRequests = allIntegrations.reduce((acc, i) => acc + (i.metrics?.requests || 0), 0)
  const avgSuccess = allIntegrations.reduce((acc, i) => acc + (i.metrics?.success || 0), 0) / allIntegrations.length

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Threat Intelligence':
        return <Shield className="w-4 h-4" />
      case 'Sandbox Analysis':
        return <Cpu className="w-4 h-4" />
      case 'Malware Repository':
        return <Database className="w-4 h-4" />
      case 'Network Intelligence':
        return <Globe className="w-4 h-4" />
      case 'Meta Integration':
        return <Zap className="w-4 h-4" />
      default:
        return <Plug className="w-4 h-4" />
    }
  }

  const handleIntegrationClick = (integration: any) => {
    if (integration.status === 'active' && integration.page) {
      router.push(integration.page)
    }
  }

  const handleCopyEnv = (envVar: string) => {
    navigator.clipboard.writeText(`${envVar}=your_api_key_here`)
    setCopiedEnv(envVar)
    setTimeout(() => setCopiedEnv(null), 2000)
  }

  return (
    <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
      <NetworkBackground />
      
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-xl">
                <Plug className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Integrations
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Connect and configure 8 active threat intelligence services
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{activeIntegrations.length} Active</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{totalRequests.toLocaleString()} Requests</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search integrations by name, description, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg'
                        : 'hover:bg-muted/20 text-muted-foreground border border-border/50'
                    }`}
                  >
                    {getCategoryIcon(category)}
                    {category === 'all' ? 'All Services' : category}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Active Integrations Grid */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Available Integrations
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredIntegrations.length} of {allIntegrations.length} services
              </span>
            </div>
            
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {filteredIntegrations.map((integration) => {
                  const Icon = integration.icon
                  
                  return (
                    <motion.div
                      key={integration.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      onClick={() => handleIntegrationClick(integration)}
                      className={`glass border border-border/50 rounded-xl overflow-hidden cursor-pointer group relative ${
                        integration.page ? 'hover:shadow-2xl' : ''
                      }`}
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${integration.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${integration.gradient} bg-opacity-10`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                {integration.name}
                                {integration.id === 'unified' && (
                                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full">
                                    NEW
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full text-muted-foreground">
                                  {integration.category}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {integration.usage}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {integration.metrics && (
                            <div className="flex items-center gap-1 text-xs bg-muted/30 px-2 py-1 rounded-full">
                              <Activity className="w-3 h-3 text-green-500" />
                              <span>{integration.metrics.success}%</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
                          {integration.description}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-3 mb-4">
                          <div className="flex flex-wrap gap-1">
                            {integration.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-muted/30 text-muted-foreground rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {integration.features.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-muted/30 text-muted-foreground rounded-full">
                                +{integration.features.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs">
                            {integration.setupRequired ? (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Key className="w-3 h-3" />
                                <span>API Key Required</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-500">
                                <Unlock className="w-3 h-3" />
                                <span>No API Key</span>
                              </div>
                            )}
                          </div>
                          
                          {integration.page && (
                            <div className="flex items-center gap-2 text-sm text-primary group-hover:translate-x-1 transition-transform">
                              <span>Open</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatCard
              icon={<Database className="w-5 h-5" />}
              title="Total Services"
              value={allIntegrations.length}
              subtitle="Active integrations"
              gradient="from-blue-500 to-cyan-500"
            />
            <QuickStatCard
              icon={<Activity className="w-5 h-5" />}
              title="Total Requests"
              value={totalRequests.toLocaleString()}
              subtitle="API calls made"
              gradient="from-green-500 to-emerald-500"
            />
            <QuickStatCard
              icon={<Gauge className="w-5 h-5" />}
              title="Success Rate"
              value={`${avgSuccess.toFixed(1)}%`}
              subtitle="Average uptime"
              gradient="from-purple-500 to-pink-500"
            />
            <QuickStatCard
              icon={<Zap className="w-5 h-5" />}
              title="Avg Response"
              value="1.8s"
              subtitle="Across all services"
              gradient="from-orange-500 to-red-500"
            />
          </motion.div>

          {/* Setup Instructions */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Quick Setup Guide
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h3 className="font-medium text-foreground">Get API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for free accounts on the services you want to use
                </p>
                <div className="space-y-2 mt-3">
                  {allIntegrations
                    .filter(i => i.setupRequired)
                    .slice(0, 4)
                    .map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{integration.name}</span>
                        <a
                          href={integration.apiDocs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          Get Key
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  {allIntegrations.filter(i => i.setupRequired).length > 4 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{allIntegrations.filter(i => i.setupRequired).length - 4} more services
                    </p>
                  )}
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h3 className="font-medium text-foreground">Configure Environment</h3>
                <p className="text-sm text-muted-foreground">
                  Add API keys to your <code className="bg-muted/30 px-1 rounded">.env.local</code>
                </p>
                <div className="bg-background/50 rounded-lg p-3 font-mono text-xs space-y-2">
                  {allIntegrations
                    .filter(i => i.setupRequired)
                    .slice(0, 3)
                    .map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between">
                        <code className="text-foreground/80">{integration.envVar}=</code>
                        <button
                          onClick={() => handleCopyEnv(integration.envVar)}
                          className="p-1 hover:bg-muted/30 rounded transition-colors"
                        >
                          {copiedEnv === integration.envVar ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h3 className="font-medium text-foreground">Start Using</h3>
                <p className="text-sm text-muted-foreground">
                  Test your integrations with the Unified Scanner
                </p>
                <div className="space-y-2 mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/threat-intel/unified')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Zap className="w-4 h-4" />
                    Open Unified Scanner
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <p className="text-xs text-muted-foreground text-center">
                    Search across all 8 services simultaneously
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documentation Links */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border/50 rounded-xl bg-muted/5">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">Need help with integration setup?</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Documentation
              </a>
              <a
                href="#"
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Helper Components

function QuickStatCard({ icon, title, value, subtitle, gradient }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  subtitle: string; 
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass border border-border/50 rounded-xl p-4 backdrop-blur-xl bg-gradient-to-br ${gradient} bg-opacity-5`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
          {icon}
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </motion.div>
  )
}