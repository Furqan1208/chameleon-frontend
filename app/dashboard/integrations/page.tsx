// app/dashboard/integrations/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
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
  Link as LinkIcon
} from "lucide-react"

const allIntegrations = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'Multi-engine malware detection, file analysis, IP/Domain/URL reputation',
    category: 'Threat Intelligence',
    icon: Shield,
    color: 'green',
    status: 'active',
    features: [
      'File hash analysis (MD5, SHA1, SHA256)',
      'IP address reputation',
      'Domain reputation',
      'URL scanning',
      'Filename search',
      'Behavioral analysis',
      '70+ antivirus engines',
      'Real-time threat scoring'
    ],
    apiDocs: 'https://docs.virustotal.com/reference/overview',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_VIRUSTOTAL_API_KEY',
    usage: '4 requests/minute (free tier)'
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    description: 'IP address reputation and abuse reporting database',
    category: 'Threat Intelligence',
    icon: Globe,
    color: 'blue',
    status: 'planned',
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
    usage: '1,000 requests/day (free tier)'
  },
  {
    id: 'hybridanalysis',
    name: 'Hybrid Analysis',
    description: 'Advanced sandbox malware analysis with behavioral insights',
    category: 'Sandbox Analysis',
    icon: Cpu,
    color: 'purple',
    status: 'planned',
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
    usage: 'Free tier available'
  },
  {
    id: 'urlhaus',
    name: 'URLhaus',
    description: 'Malware URL and domain database from abuse.ch',
    category: 'Threat Intelligence',
    icon: Network,
    color: 'pink',
    status: 'planned',
    features: [
      'Malware URL lookup',
      'Domain reputation',
      'File hash association',
      'Threat type classification',
      'First/last seen dates',
      'Tags and categories'
    ],
    apiDocs: 'https://urlhaus-api.abuse.ch/',
    setupRequired: false,
    envVar: 'None required',
    usage: 'Unlimited (public API)'
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    description: 'Open Threat Intelligence with community-driven indicators',
    category: 'Threat Intelligence',
    icon: AlertTriangle,
    color: 'orange',
    status: 'planned',
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
    envVar: 'NEXT_PUBLIC_OTX_API_KEY',
    usage: '10 requests/minute (free tier)'
  },
  {
    id: 'malwarebazaar',
    name: 'MalwareBazaar',
    description: 'Malware sample repository and threat intelligence',
    category: 'Malware Repository',
    icon: FileText,
    color: 'red',
    status: 'planned',
    features: [
      'Malware sample lookup',
      'File hash search',
      'Malware family information',
      'Download sample (optional)',
      'Tags and classifications',
      'First seen dates'
    ],
    apiDocs: 'https://bazaar.abuse.ch/api/',
    setupRequired: false,
    envVar: 'None required',
    usage: 'Unlimited (public API)'
  },
  {
    id: 'ipinfo',
    name: 'IPinfo.io',
    description: 'IP address geolocation and network information',
    category: 'Network Intelligence',
    icon: Server,
    color: 'blue',
    status: 'planned',
    features: [
      'IP geolocation',
      'ASN information',
      'Company details',
      'Carrier information',
      'Privacy detection',
      'Hosting detection'
    ],
    apiDocs: 'https://ipinfo.io/developers',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_IPINFO_TOKEN',
    usage: '50,000 requests/month (free tier)'
  },
  {
    id: 'shodan',
    name: 'Shodan',
    description: 'Search engine for Internet-connected devices',
    category: 'Network Intelligence',
    icon: Search,
    color: 'purple',
    status: 'planned',
    features: [
      'Device search',
      'Port scanning data',
      'Banner grabbing',
      'Vulnerability data',
      'Geographic distribution',
      'Service detection'
    ],
    apiDocs: 'https://developer.shodan.io/api',
    setupRequired: true,
    envVar: 'NEXT_PUBLIC_SHODAN_API_KEY',
    usage: '1 request/second (free tier)'
  }
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['all', 'Threat Intelligence', 'Sandbox Analysis', 'Malware Repository', 'Network Intelligence']
  
  const filteredIntegrations = allIntegrations.filter(integration => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.features.some(feat => feat.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const activeIntegrations = filteredIntegrations.filter(i => i.status === 'active')
  const plannedIntegrations = filteredIntegrations.filter(i => i.status === 'planned')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            <Clock className="w-3 h-3" />
            Planned
          </span>
        )
      default:
        return null
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'blue':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'purple':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'pink':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      case 'orange':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'red':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const handleIntegrationClick = (integration: any) => {
    if (integration.status === 'active' && integration.id === 'virustotal') {
      router.push('/dashboard/threat-intel/virustotal')
    }
  }

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Plug className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Integrations</h1>
                  <p className="text-muted-foreground">
                    Connect and configure third-party threat intelligence services
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 border border-primary/30 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{activeIntegrations.length} Active</span>
                </div>
              </div>
              <div className="px-3 py-1.5 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{plannedIntegrations.length} Planned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="glass border border-border rounded-xl p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search integrations by name, description, or features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Integrations */}
          {activeIntegrations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Active Integrations
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeIntegrations.map((integration) => {
                  const Icon = integration.icon
                  const colorClasses = getColorClasses(integration.color)
                  
                  return (
                    <div
                      key={integration.id}
                      onClick={() => handleIntegrationClick(integration)}
                      className={`glass border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${colorClasses} ${
                        integration.id === 'virustotal' ? 'glow-green' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colorClasses.split(' ')[0].replace('text-', 'bg-')} bg-opacity-20`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">{integration.category}</p>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                      
                      <p className="text-foreground/80 mb-4">{integration.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Key Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.slice(0, 4).map((feature, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                              >
                                {feature}
                              </span>
                            ))}
                            {integration.features.length > 4 && (
                              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                +{integration.features.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Key className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">API Key:</span>
                            <span className="font-mono text-foreground">
                              {integration.setupRequired ? 'Required' : 'Not Required'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Usage:</span>
                            <span className="text-foreground">{integration.usage}</span>
                          </div>
                        </div>
                        
                        {integration.id === 'virustotal' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push('/dashboard/threat-intel/virustotal')
                            }}
                            className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                          >
                            Use VirusTotal Scanner
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Planned Integrations */}
          {plannedIntegrations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Planned Integrations
                <span className="text-sm font-normal text-muted-foreground">
                  ({plannedIntegrations.length} coming soon)
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {plannedIntegrations.map((integration) => {
                  const Icon = integration.icon
                  const colorClasses = getColorClasses(integration.color)
                  
                  return (
                    <div
                      key={integration.id}
                      className={`glass border rounded-xl p-4 transition-all duration-300 opacity-70 ${colorClasses}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colorClasses.split(' ')[0].replace('text-', 'bg-')} bg-opacity-20`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                      
                      <p className="text-sm text-foreground/70 mb-3">{integration.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{integration.category}</span>
                        <a
                          href={integration.apiDocs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          API Docs
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="glass border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Integration Setup
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">1. Get API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for free accounts on the services you want to use and obtain API keys.
                </p>
                <div className="space-y-2">
                  {allIntegrations
                    .filter(i => i.setupRequired)
                    .map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{integration.name}</span>
                        <a
                          href={integration.apiDocs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Get API Key
                        </a>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">2. Configure Environment</h3>
                <p className="text-sm text-muted-foreground">
                  Add API keys to your <code className="bg-muted px-1 rounded">.env.local</code> file:
                </p>
                <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm overflow-x-auto">
                  {allIntegrations
                    .filter(i => i.setupRequired)
                    .map((integration) => (
                      <div key={integration.id} className="text-foreground/80">
                        {integration.envVar}=your_api_key_here
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">3. Test Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Once configured, visit the integration page to test functionality.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/dashboard/threat-intel/virustotal')}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Test VirusTotal
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    Try scanning a hash, IP, or domain to verify setup
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass border border-border rounded-xl p-4 hover:glow-green transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total Services</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{allIntegrations.length}</p>
            </div>
            
            <div className="glass border border-border rounded-xl p-4 hover:glow-blue transition-all">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{activeIntegrations.length}</p>
            </div>
            
            <div className="glass border border-border rounded-xl p-4 hover:glow-pink transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <p className="text-sm text-muted-foreground">Planned</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{plannedIntegrations.length}</p>
            </div>
            
            <div className="glass border border-border rounded-xl p-4 hover:glow-accent transition-all">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{categories.length - 1}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}