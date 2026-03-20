"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Database,
  Eye,
  EyeOff,
  Globe,
  Key,
  Search,
  Shield,
  Trash2,
  Zap,
  Loader,
  Save,
  Cpu,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  setupRequired: boolean
  usage: string
  apiDocs: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: "virustotal",
    name: "VirusTotal",
    description: "Multi-engine malware reputation for files, IPs, domains, and URLs.",
    icon: Shield,
    category: "Threat Intelligence",
    setupRequired: true,
    usage: "4 requests/min (free tier)",
    apiDocs: "https://docs.virustotal.com/reference/overview",
  },
  {
    id: "abuseipdb",
    name: "AbuseIPDB",
    description: "IP abuse confidence and historical reports for network investigations.",
    icon: Globe,
    category: "Threat Intelligence",
    setupRequired: true,
    usage: "1,000 requests/day (free tier)",
    apiDocs: "https://docs.abuseipdb.com/",
  },
  {
    id: "alienvault",
    name: "AlienVault OTX",
    description: "Open threat intelligence pulses and indicators from the OTX community.",
    icon: Globe,
    category: "Threat Intelligence",
    setupRequired: true,
    usage: "10 requests/min",
    apiDocs: "https://otx.alienvault.com/api",
  },
  {
    id: "hybridanalysis",
    name: "Hybrid Analysis",
    description: "Sandbox analysis with deep behavior traces and threat scoring.",
    icon: Cpu,
    category: "Sandbox Analysis",
    setupRequired: true,
    usage: "10 requests/min (free tier)",
    apiDocs: "https://www.hybrid-analysis.com/docs/api/v2",
  },
  {
    id: "filescan",
    name: "Filescan.io",
    description: "Cloud sandboxing for files and URLs with extraction and IOC enrichment.",
    icon: Cpu,
    category: "Sandbox Analysis",
    setupRequired: true,
    usage: "10 requests/min (free tier)",
    apiDocs: "https://www.filescan.io/api/docs",
  },
  {
    id: "malwarebazaar",
    name: "MalwareBazaar",
    description: "Malware sample intelligence from Abuse.ch with rich hash and family context.",
    icon: Database,
    category: "Malware Repository",
    setupRequired: false,
    usage: "120 requests/hour",
    apiDocs: "https://bazaar.abuse.ch/api/",
  },
]

type IntegrationsTab = "services" | "settings"

interface APIKeys {
  [key: string]: string
}

const INTEGRATION_ICON_TONES: Record<string, string> = {
  virustotal: "text-sky-300",
  abuseipdb: "text-emerald-300",
  alienvault: "text-violet-300",
  hybridanalysis: "text-amber-300",
  filescan: "text-cyan-300",
  malwarebazaar: "text-rose-300",
}

function StatTile({
  icon,
  label,
  value,
  iconTone,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  iconTone: string
}) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs uppercase tracking-wider">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#1a1a1a] bg-[#101214] ${iconTone}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

interface IntegrationCardProps {
  integration: Integration
  apiKey: string | null
  onApiKeyChange: (id: string, key: string) => void
  onDelete: (id: string) => void
  loading: boolean
}

function IntegrationCard({ integration, apiKey, onApiKeyChange, onDelete, loading }: IntegrationCardProps) {
  const [showKey, setShowKey] = useState(false)
  const [tempKey, setTempKey] = useState(apiKey || "")
  const Icon = integration.icon
  const iconTone = INTEGRATION_ICON_TONES[integration.id] ?? "text-slate-200"

  const hasKey = !!apiKey
  const displayKey = showKey ? tempKey : tempKey ? `***${tempKey.slice(-4)}` : "Not configured"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-[#101214] border border-[#1a1a1a] mt-0.5">
            <Icon className={`w-5 h-5 ${iconTone}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
              {hasKey && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/25 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Configured
                </span>
              )}
              {!hasKey && integration.setupRequired && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Setup Required
                </span>
              )}
              {!integration.setupRequired && (
                <span className="px-2 py-1 text-xs rounded-full bg-slate-400/10 text-slate-300 border border-slate-300/20">
                  No setup needed
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{integration.description}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] px-2 py-1 bg-[#101214] text-slate-300 rounded border border-[#1a1a1a]">
                {integration.usage}
              </span>
              <a
                href={integration.apiDocs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline flex items-center gap-1"
              >
                API Docs ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {integration.setupRequired && (
        <div className="space-y-3 rounded-lg border border-[#1a1a1a] bg-black/30 p-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-violet-300" />
            <label className="text-xs font-medium text-muted-foreground">API Key</label>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Enter your API key here..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#1a1a1a] bg-black/40 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300/90 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {tempKey && tempKey !== apiKey && (
              <button
                onClick={() => onApiKeyChange(integration.id, tempKey)}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            )}

            {apiKey && (
              <button
                onClick={() => {
                  onDelete(integration.id)
                  setTempKey("")
                }}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors border border-red-500/25"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Clear
              </button>
            )}
          </div>

          {tempKey && tempKey !== apiKey && (
            <button
              onClick={() => setTempKey(apiKey || "")}
              className="w-full px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#151a21] rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function IntegrationsDashboard() {
  const [activeTab, setActiveTab] = useState<IntegrationsTab>("services")
  const [searchQuery, setSearchQuery] = useState("")
  const [apiKeys, setApiKeys] = useState<APIKeys>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load API keys on mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await fetch("/api/users/api-keys")
        if (response.ok) {
          const data = await response.json()
          // Store only the service names with key existence
          const keysExist: APIKeys = {}
          Object.entries(data.api_keys || {}).forEach(([service, value]) => {
            keysExist[service] = value as string
          })
          setApiKeys(keysExist)
        }
      } catch (err) {
        console.error("Failed to load API keys:", err)
      }
    }

    loadApiKeys()
  }, [])

  const handleSaveApiKey = useCallback(
    async (serviceId: string, apiKey: string) => {
      setLoading(serviceId)
      setError(null)

      try {
        const response = await fetch("/api/users/api-keys", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [serviceId]: apiKey }),
        })

        if (response.ok) {
          setApiKeys((prev) => ({ ...prev, [serviceId]: apiKey }))
          setSuccess(`${serviceId} API key saved successfully!`)
          setTimeout(() => setSuccess(null), 3000)
        } else {
          const data = await response.json()
          setError(data.detail || "Failed to save API key")
        }
      } catch (err) {
        setError(`Error saving API key: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(null)
      }
    },
    []
  )

  const handleDeleteApiKey = useCallback(async (serviceId: string) => {
    setLoading(serviceId)
    setError(null)

    try {
      const response = await fetch(`/api/users/api-keys/${serviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setApiKeys((prev) => {
          const updated = { ...prev }
          delete updated[serviceId]
          return updated
        })
        setSuccess(`${serviceId} API key deleted successfully!`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await response.json()
        setError(data.detail || "Failed to delete API key")
      }
    } catch (err) {
      setError(`Error deleting API key: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(null)
    }
  }, [])

  const filteredIntegrations = useMemo(() => {
    if (!searchQuery) return INTEGRATIONS

    const q = searchQuery.toLowerCase()
    return INTEGRATIONS.filter(
      (integration) =>
        integration.name.toLowerCase().includes(q) ||
        integration.description.toLowerCase().includes(q) ||
        integration.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const configuredCount = Object.keys(apiKeys).length
  const setupRequiredCount = INTEGRATIONS.filter((i) => i.setupRequired).length

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
              <Zap className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Integrations</p>
              <h1 className="text-2xl font-semibold text-white">Integration Settings</h1>
              <p className="text-muted-foreground mt-1">Configure and manage your security service API keys</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/10 text-primary text-sm font-medium inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {configuredCount} configured
            </span>
            <span className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] text-muted-foreground text-sm inline-flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-300" />
              {setupRequiredCount} using default
            </span>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 text-sm flex items-start gap-3">
        <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">ℹ</div>
        <div>
          <p className="font-medium mb-1">API Keys Pre-configured</p>
          <p className="text-xs text-blue-300">Default API keys are already configured on the server for all integrations. You can update them with your own personal keys here to use your custom credentials for security analysis.</p>
        </div>
      </motion.div>

      {/* Alerts */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#1a1a1a]">
        {(["services", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            {tab === "services" ? "Services" : "Settings"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "services" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Search */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300/90" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations by name, category, or service..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1a1a1a] bg-black/20 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatTile icon={<Zap className="w-4 h-4" />} label="Total Services" value={INTEGRATIONS.length} iconTone="text-cyan-300" />
            <StatTile icon={<CheckCircle className="w-4 h-4" />} label="Configured" value={configuredCount} iconTone="text-emerald-300" />
            <StatTile icon={<AlertCircle className="w-4 h-4" />} label="Using Default" value={setupRequiredCount - configuredCount} iconTone="text-amber-300" />
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                apiKey={apiKeys[integration.id] || null}
                onApiKeyChange={handleSaveApiKey}
                onDelete={handleDeleteApiKey}
                loading={loading === integration.id}
              />
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No integrations match your search</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "settings" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-300" />
              Security & Privacy
            </h2>

            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <div className="rounded-lg bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Default API Keys</h3>
                <p className="text-xs text-muted-foreground">
                  All integrations come with pre-configured default API keys managed by the server. These keys have basic rate limits and shared usage across all users.
                </p>
              </div>

              <div className="rounded-lg bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Personal API Keys</h3>
                <p className="text-xs text-muted-foreground">
                  For higher rate limits, priority support, and exclusive features, you can configure your own API keys from each service provider. Your personal keys will be used exclusively for your analyses.
                </p>
              </div>

              <div className="rounded-lg bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">API Key Storage</h3>
                <p className="text-xs text-muted-foreground">
                  Your personal API keys are stored securely in our database. They are never shared with third parties and are only used for performing security analysis on your behalf.
                </p>
              </div>

              <div className="rounded-lg bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Key Management</h3>
                <p className="text-xs text-muted-foreground">
                  You can update or revoke API keys at any time from the Services tab. Keys are masked after configuration for security. Switching back to default keys is as simple as clearing your custom key.
                </p>
              </div>

              <div className="rounded-lg bg-black/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Best Practices</h3>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Use API keys with minimal required permissions</li>
                  <li>• Rotate your API keys regularly (quarterly recommended)</li>
                  <li>• Monitor API usage in your service provider dashboard</li>
                  <li>• Consider using separate project-specific API keys</li>
                  <li>• Never share your API keys with anyone</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-300" />
              Quick Links
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#1a1a1a]">
              {INTEGRATIONS.map((integration) => (
                <a
                  key={integration.id}
                  href={integration.apiDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg border border-[#1a1a1a] bg-black/20 hover:bg-black/40 hover:border-primary/40 transition-colors flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{integration.name}</span>
                  <span className="text-xs text-slate-300/90">→</span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
