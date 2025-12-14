// app/dashboard/integrations/page.tsx
"use client"

import { Shield, Globe, Cpu, Network, AlertTriangle, Database, Zap, CheckCircle, Clock, Link as LinkIcon, Settings, Code, ExternalLink, Key } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { NetworkBackground } from "@/components/3d/NetworkBackground"

const integrations = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'File hash, IP, domain, URL analysis with 70+ antivirus engines',
    icon: Shield,
    color: 'green' as const,
    status: 'active' as const,
    category: 'Threat Intelligence' as const,
    apiKey: true,
    freeTier: true,
    features: ['Hash Analysis', 'IP Reputation', 'Domain Intelligence', 'URL Scanning', 'Behavioral Analysis'],
    usage: {
      requests: '4/minute',
      limits: 'No daily limits',
      tier: 'Free Tier'
    },
    docs: 'https://docs.virustotal.com/reference/overview',
    setup: '/dashboard/threat-intel/virustotal'
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    description: 'IP reputation database with abuse reports and confidence scoring',
    icon: Globe,
    color: 'blue' as const,
    status: 'planned' as const,
    category: 'IP Reputation' as const,
    apiKey: true,
    freeTier: true,
    features: ['IP Reputation', 'Abuse Reports', 'Country Data', 'Confidence Scoring', 'Historical Data'],
    usage: {
      requests: 'TBD',
      limits: 'TBD',
      tier: 'Free Tier available'
    },
    docs: 'https://docs.abuseipdb.com/',
    setup: null
  },
  {
    id: 'hybridanalysis',
    name: 'Hybrid Analysis',
    description: 'Advanced sandbox malware analysis with dynamic execution',
    icon: Cpu,
    color: 'purple' as const,
    status: 'planned' as const,
    category: 'Sandbox Analysis' as const,
    apiKey: true,
    freeTier: true,
    features: ['Sandbox Analysis', 'Dynamic Execution', 'Memory Dumps', 'MITRE ATT&CK', 'Network Captures'],
    usage: {
      requests: 'TBD',
      limits: 'API key required',
      tier: 'Free for research'
    },
    docs: 'https://www.hybrid-analysis.com/docs/api/v2',
    setup: null
  },
  {
    id: 'urlhaus',
    name: 'URLhaus',
    description: 'Malicious URL database with malware distribution tracking',
    icon: Network,
    color: 'pink' as const,
    status: 'planned' as const,
    category: 'URL Intelligence' as const,
    apiKey: false,
    freeTier: true,
    features: ['Malicious URLs', 'Malware Hashes', 'Threat Actors', 'Timeline Data', 'Bulk Downloads'],
    usage: {
      requests: 'Unlimited',
      limits: 'No restrictions',
      tier: 'Free & Open'
    },
    docs: 'https://urlhaus-api.abuse.ch/',
    setup: null
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    description: 'Open threat intelligence exchange with community contributions',
    icon: AlertTriangle,
    color: 'orange' as const,
    status: 'planned' as const,
    category: 'Threat Intelligence' as const,
    apiKey: true,
    freeTier: true,
    features: ['Threat Pulses', 'IOC Collections', 'Community Data', 'Real-time Feeds', 'Export Options'],
    usage: {
      requests: 'TBD',
      limits: 'Rate limited',
      tier: 'Free tier available'
    },
    docs: 'https://otx.alienvault.com/api',
    setup: null
  },
  {
    id: 'malwarebazaar',
    name: 'MalwareBazaar',
    description: 'Malware sample repository with YARA rules and attribution',
    icon: Database,
    color: 'red' as const,
    status: 'planned' as const,
    category: 'Malware Analysis' as const,
    apiKey: false,
    freeTier: true,
    features: ['Malware Samples', 'YARA Rules', 'File Analysis', 'Campaign Tracking', 'Threat Attribution'],
    usage: {
      requests: 'Unlimited',
      limits: 'No API key needed',
      tier: 'Free & Open'
    },
    docs: 'https://bazaar.abuse.ch/api/',
    setup: null
  }
]

const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-primary bg-primary/10',
    icon: CheckCircle,
    description: 'Currently available and working'
  },
  planned: {
    label: 'Planned',
    color: 'text-accent bg-accent/10',
    icon: Clock,
    description: 'Coming in future updates'
  },
  development: {
    label: 'In Development',
    color: 'text-yellow-500 bg-yellow-500/10',
    icon: Code,
    description: 'Currently being implemented'
  }
}

const categoryColors = {
  'Threat Intelligence': 'bg-primary/10 text-primary',
  'IP Reputation': 'bg-blue-500/10 text-blue-500',
  'Sandbox Analysis': 'bg-purple-500/10 text-purple-500',
  'URL Intelligence': 'bg-pink-500/10 text-pink-500',
  'Malware Analysis': 'bg-red-500/10 text-red-500'
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'planned'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Get unique categories
  const categories = Array.from(new Set(integrations.map(int => int.category)))

  const filteredIntegrations = integrations.filter(int => {
    if (filter !== 'all' && int.status !== filter) return false
    if (categoryFilter !== 'all' && int.category !== categoryFilter) return false
    return true
  })

  const activeCount = integrations.filter(int => int.status === 'active').length
  const plannedCount = integrations.filter(int => int.status === 'planned').length

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.planned
  }

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-6 lg:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
              </div>
              <p className="text-muted-foreground">
                Connect with external services for enhanced malware analysis capabilities
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-medium">{activeCount} Active</span>
              </div>
              <div className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{plannedCount} Planned</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Active Integrations</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
            </div>
            
            <div className="glass border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Planned Integrations</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{plannedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </div>
            
            <div className="glass border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">API Keys Required</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {integrations.filter(int => int.apiKey).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">External API access</p>
            </div>
          </div>

          {/* Filters */}
          <div className="glass border border-border rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Filter by Status</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'active'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter('planned')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'planned'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    Planned
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Filter by Category</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      categoryFilter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        categoryFilter === category
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon
              const statusInfo = getStatusConfig(integration.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <div
                  key={integration.id}
                  className="glass border border-border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  {/* Integration Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${integration.color === 'green' ? 'bg-primary/10 text-primary' :
                          integration.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                          integration.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                          integration.color === 'pink' ? 'bg-pink-500/10 text-pink-500' :
                          integration.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-red-500/10 text-red-500'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[integration.category]}`}>
                        {integration.category}
                      </span>
                      {integration.freeTier && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          Free Tier
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                          +{integration.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* API & Usage Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">API Key Required</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${integration.apiKey ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {integration.apiKey ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Rate Limit</span>
                      <span className="text-xs font-medium text-foreground">{integration.usage.requests}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Pricing Tier</span>
                      <span className="text-xs font-medium text-foreground">{integration.usage.tier}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {integration.status === 'active' && integration.setup ? (
                      <button
                        onClick={() => router.push(integration.setup!)}
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Open Integration
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.label}
                      </button>
                    )}
                    
                    <a
                      href={integration.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Docs
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Setup Information */}
          <div className="glass border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Setup Instructions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">For Active Integrations</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                      <Key className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Get API Key</p>
                      <p className="text-sm text-muted-foreground">
                        Register on the service provider's website to obtain an API key
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                      <Code className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Configure Environment</p>
                      <p className="text-sm text-muted-foreground">
                        Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SERVICE_API_KEY</code> to <code className="bg-muted px-1 rounded">.env.local</code>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Start Using</p>
                      <p className="text-sm text-muted-foreground">
                        Restart the server and access the integration from Threat Intelligence
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">For Planned Integrations</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg mt-0.5">
                      <Clock className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Coming Soon</p>
                      <p className="text-sm text-muted-foreground">
                        These integrations are planned for future releases
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg mt-0.5">
                      <Code className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Development Status</p>
                      <p className="text-sm text-muted-foreground">
                        Check back regularly for updates on implementation progress
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg mt-0.5">
                      <ExternalLink className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">API Documentation</p>
                      <p className="text-sm text-muted-foreground">
                        Review the API docs to understand integration capabilities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Legend */}
          <div className="glass border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Integration Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(statusConfig).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{config.label}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}