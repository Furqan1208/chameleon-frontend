// app/dashboard/frameworks/mitre-attack/page.tsx
"use client"

import { useState, useEffect } from "react"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Grid,
  List,
  Layers,
  Target,
  AlertTriangle,
  Info,
  ExternalLink,
  BookOpen,
  Github,
  Twitter,
  Mail,
  Star,
  GitBranch,
  Users,
  Award,
  Zap,
  Sparkles,
  Rocket,
  Gauge,
  Radar,
  Bot,
  Atom,
  Binary,
  Code,
  Cloud,
  Database,
  Lock,
  Unlock,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  Menu,
  X,
  Home,
  FileText,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Globe,
  Cpu,
  Fingerprint,
  Hash,
  Link,
  Network,
  Server,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  BellRing,
  Folder,
  FolderOpen,
  FolderTree,
  FileCode,
  FileJson,
  FileText as FileTextIcon,
  Image,
  Video,
  Music,
  Archive,
  Package,
  Box,
  Cpu as CpuIcon,
  Globe as GlobeIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key,
  KeyRound,
  Fingerprint as FingerprintIcon,
  Scan,
  Scan as ScanIcon,
  Radar as RadarIcon,
  Satellite,
  Satellite as SatelliteIcon,
  Radio,
  Radio as RadioIcon,
  Target as TargetIcon,
  Crosshair,
  Cross,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Eye,
  EyeOff,
  EyeClosed,
  Ear,
  EarOff,
  Mic,
  MicOff,
  Speaker,
  Volume1,
  Volume2,
  VolumeX,
  Headphones,
  Headset,
  Tv,
  Monitor,
  Tablet,
  Smartphone,
  Watch,
  Clock as ClockIcon,
  AlarmClock,
  Timer,
  Hourglass,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarHeart,
  CalendarClock,
  CalendarOff,
  CalendarCog,
  CalendarArrowUp,
  CalendarArrowDown,
  Loader,
  Brain
} from "lucide-react"

// Types
interface MITREObject {
  type: string
  id: string
  created: string
  created_by_ref?: string
  modified: string
  name?: string
  description?: string
  external_references?: Array<{
    source_name: string
    external_id?: string
    url?: string
  }>
  kill_chain_phases?: Array<{
    kill_chain_name: string
    phase_name: string
  }>
  x_mitre_platforms?: string[]
  x_mitre_domains?: string[]
  x_mitre_is_subtechnique?: boolean
  x_mitre_deprecated?: boolean
  x_mitre_version?: string
  x_mitre_contributors?: string[]
  x_mitre_detection?: string
  x_mitre_remote_support?: boolean
  x_mitre_modified_by_ref?: string
  x_mitre_attack_spec_version?: string
  x_mitre_shortname?: string
  tactic_refs?: string[]
  aliases?: string[]
  first_seen?: string
  last_seen?: string
}

interface MITREBundle {
  type: string
  id: string
  objects: MITREObject[]
  spec_version: string
}

interface Tactic {
  id: string
  name: string
  description: string
  shortname: string
  external_id: string
  technique_refs: string[]
}

interface Technique {
  id: string
  name: string
  description: string
  external_id: string
  tactics: string[]
  platforms: string[]
  is_subtechnique: boolean
  parent_id?: string
  subtechniques: Technique[]
  detection?: string
  contributors?: string[]
  version?: string
  deprecated: boolean
}

interface Matrix {
  id: string
  name: string
  description: string
  tactics: Tactic[]
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

export default function MITREAttackPage() {
  const [data, setData] = useState<MITREBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matrix, setMatrix] = useState<Matrix | null>(null)
  const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlatform, setFilterPlatform] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"matrix" | "list" | "table">("matrix")
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [platforms, setPlatforms] = useState<string[]>([])

  useEffect(() => {
    loadMITREdata()
  }, [])

  const loadMITREdata = async () => {
    try {
      setLoading(true)
      const response = await fetch('/data/mitre/enterprise-attack.json')
      if (!response.ok) throw new Error('Failed to load MITRE ATT&CK data')
      const jsonData = await response.json()
      setData(jsonData)
      processData(jsonData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const processData = (bundle: MITREBundle) => {
    // Find matrix
    const matrixObj = bundle.objects.find(obj => obj.type === 'x-mitre-matrix')
    if (!matrixObj) return

    // Get all tactics
    const tacticObjects = bundle.objects.filter(obj => obj.type === 'x-mitre-tactic')
    const techniqueObjects = bundle.objects.filter(obj => obj.type === 'attack-pattern')
    
    // Build tactics map
    const tacticsMap = new Map<string, Tactic>()
    tacticObjects.forEach(tactic => {
      const externalId = tactic.external_references?.find(ref => ref.source_name === 'mitre-attack')?.external_id || ''
      tacticsMap.set(tactic.id, {
        id: tactic.id,
        name: tactic.name || 'Unknown Tactic',
        description: tactic.description || '',
        shortname: tactic.x_mitre_shortname || '',
        external_id: externalId,
        technique_refs: []
      })
    })

    // Build techniques map and organize by tactic
    // use module-level variable rather than local one so render code can read it later
    techniquesMap = new Map<string, Technique>()
    const techniquesByTactic = new Map<string, Technique[]>()

    // First pass: create all techniques
    techniqueObjects.forEach(tech => {
      const externalId = tech.external_references?.find(ref => ref.source_name === 'mitre-attack')?.external_id || ''
      // preferred mapping is through kill_chain_phases but some bundles may omit it
      let tacticNames: string[] = tech.kill_chain_phases
        ?.filter(phase => phase.kill_chain_name === 'mitre-attack')
        .map(phase => phase.phase_name) || []

      // fallback: use any explicit tactic_refs if provided
      if (tacticNames.length === 0 && tech.tactic_refs) {
        tacticNames = tech.tactic_refs
          .map(ref => tacticsMap.get(ref)?.shortname)
          .filter((n): n is string => Boolean(n))
      }

      const technique: Technique = {
        id: tech.id,
        name: tech.name || 'Unknown Technique',
        description: tech.description || '',
        external_id: externalId,
        tactics: tacticNames,
        platforms: tech.x_mitre_platforms || [],
        is_subtechnique: tech.x_mitre_is_subtechnique || false,
        subtechniques: [],
        detection: tech.x_mitre_detection,
        contributors: tech.x_mitre_contributors,
        version: tech.x_mitre_version,
        deprecated: tech.x_mitre_deprecated || false
      }

      techniquesMap.set(tech.id, technique)

      // Add to tactics mapping
      tacticNames.forEach(tacticName => {
        const tactic = Array.from(tacticsMap.values()).find(t => t.shortname === tacticName)
        if (tactic) {
          if (!techniquesByTactic.has(tactic.id)) {
            techniquesByTactic.set(tactic.id, [])
          }
          techniquesByTactic.get(tactic.id)?.push(technique)
        }
      })
    })

    // Second pass: handle subtechniques
    techniqueObjects.forEach(tech => {
      if (tech.x_mitre_is_subtechnique) {
        // Find parent technique (based on external_id format: TXXXX.XXX)
        const externalId = tech.external_references?.find(ref => ref.source_name === 'mitre-attack')?.external_id || ''
        const parentExternalId = externalId.split('.')[0]
        
        const parent = Array.from(techniquesMap.values()).find(t => 
          t.external_id === parentExternalId && !t.is_subtechnique
        )
        
        if (parent) {
          const subtechnique = techniquesMap.get(tech.id)
          if (subtechnique) {
            parent.subtechniques.push(subtechnique)
            // Remove from main techniques list
            techniquesByTactic.forEach((techs, tacticId) => {
              techniquesByTactic.set(tacticId, techs.filter(t => t.id !== tech.id))
            })
          }
        }
      }
    })

    // Update tactics with their techniques
    tacticsMap.forEach((tactic, id) => {
      tactic.technique_refs = (techniquesByTactic.get(id) || []).map(t => t.id)
    })

    // Get unique platforms
    const allPlatforms = new Set<string>()
    techniqueObjects.forEach(tech => {
      tech.x_mitre_platforms?.forEach(p => allPlatforms.add(p))
    })
    setPlatforms(Array.from(allPlatforms).sort())

    // Build ordered tactics list based on matrix references
    const orderedTactics: Tactic[] = []
    matrixObj.tactic_refs?.forEach(ref => {
      const t = tacticsMap.get(ref)
      if (t) orderedTactics.push(t)
    })

    // Set matrix using ordered tactics
    setMatrix({
      id: matrixObj.id,
      name: matrixObj.name || 'MITRE ATT&CK Matrix',
      description: matrixObj.description || '',
      tactics: orderedTactics
    })
  }

  const toggleTechnique = (techniqueId: string) => {
    setExpandedTechniques(prev => {
      const next = new Set(prev)
      if (next.has(techniqueId)) {
        next.delete(techniqueId)
      } else {
        next.add(techniqueId)
      }
      return next
    })
  }

  const getFilteredTechniques = (techniques: Technique[]) => {
    if (!searchQuery && filterPlatform === 'all') return techniques

    return techniques.filter(tech => {
      // Search filter
      const matchesSearch = !searchQuery || 
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.external_id.toLowerCase().includes(searchQuery.toLowerCase())

      // Platform filter
      const matchesPlatform = filterPlatform === 'all' || 
        tech.platforms.includes(filterPlatform)

      return matchesSearch && matchesPlatform && !tech.deprecated
    })
  }

  const renderMatrixView = () => {
    if (!matrix) return null

    return (
      <div className="overflow-x-auto pb-6">
        <div className="inline-flex min-w-full">
          {/* Tactics Row */}
          <div className="flex">
            {matrix.tactics.map((tactic) => (
              <div
                key={tactic.id}
                className="w-64 flex-shrink-0 p-2"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTactic(tactic)}
                  className={`glass border border-primary/20 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTactic?.id === tactic.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-primary">{tactic.external_id}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{tactic.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tactic.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {tactic.technique_refs.length} techniques
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Techniques Grid */}
        {selectedTactic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedTactic.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedTactic.description}</p>
              </div>
              <button
                onClick={() => setSelectedTactic(null)}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                Clear Selection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredTechniques(
                matrix.tactics
                  .find(t => t.id === selectedTactic.id)
                  ?.technique_refs
                  .map(id => Array.from(techniquesMap.values()).find(t => t.id === id))
                  .filter((t): t is Technique => t !== undefined) || []
              ).map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  expanded={expandedTechniques.has(technique.id)}
                  onToggle={() => toggleTechnique(technique.id)}
                  onSelect={() => setSelectedTechnique(technique)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderListView = () => {
    if (!matrix) return null

    const allTechniques = Array.from(techniquesMap.values())
    const filteredTechniques = getFilteredTechniques(allTechniques)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTechniques.length} of {allTechniques.length} techniques
          </p>
        </div>

        <div className="space-y-2">
          {filteredTechniques.map((technique) => (
            <TechniqueListItem
              key={technique.id}
              technique={technique}
              onSelect={() => setSelectedTechnique(technique)}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderTableView = () => {
    if (!matrix) return null

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tactics</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platforms</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Version</th>
            </tr>
          </thead>
          <tbody>
            {matrix.tactics.flatMap(tactic => 
              tactic.technique_refs
                .map(id => Array.from(techniquesMap.values()).find(t => t.id === id))
                .filter((t): t is Technique => t !== undefined)
                .map((technique) => (
                  <tr
                    key={technique.id}
                    onClick={() => setSelectedTechnique(technique)}
                    className="border-b border-border/50 hover:bg-muted/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-sm text-primary">{technique.external_id}</td>
                    <td className="py-3 px-4 font-medium text-foreground">{technique.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {technique.tactics.map(tactic => (
                          <span
                            key={tactic}
                            className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                          >
                            {tactic}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {technique.platforms.slice(0, 2).map(platform => (
                          <span
                            key={platform}
                            className="px-2 py-0.5 text-xs bg-muted/30 text-muted-foreground rounded-full"
                          >
                            {platform}
                          </span>
                        ))}
                        {technique.platforms.length > 2 && (
                          <span className="px-2 py-0.5 text-xs bg-muted/30 text-muted-foreground rounded-full">
                            +{technique.platforms.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{technique.version || '1.0'}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
        <NetworkBackground />
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="glass border border-border/50 rounded-xl p-12 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">Loading MITRE ATT&CK Framework...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
        <NetworkBackground />
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="glass border border-red-500/30 bg-red-500/5 rounded-xl p-12 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-bold text-foreground">Failed to Load MITRE ATT&CK Data</h2>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={loadMITREdata}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
      <NetworkBackground />
      
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  MITRE ATT&CK Framework
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Enterprise tactics, techniques, and procedures
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://attack.mitre.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Official Site
              </a>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search techniques by name, ID, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'matrix' ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30'
                    }`}
                    title="Matrix View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'table' ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30'
                    }`}
                    title="Table View"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                    showFilters 
                      ? 'bg-primary/20 border-primary/50 text-primary' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Platform</span>
                  {showFilters ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Platform Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border/50"
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterPlatform('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filterPlatform === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-muted/30'
                      }`}
                    >
                      All Platforms
                    </button>
                    {platforms.map(platform => (
                      <button
                        key={platform}
                        onClick={() => setFilterPlatform(platform)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filterPlatform === platform
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted/30'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
            {viewMode === 'matrix' && renderMatrixView()}
            {viewMode === 'list' && renderListView()}
            {viewMode === 'table' && renderTableView()}
          </motion.div>

          {/* Technique Detail Modal */}
          <AnimatePresence>
            {selectedTechnique && (
              <TechniqueDetailModal
                technique={selectedTechnique}
                onClose={() => setSelectedTechnique(null)}
              />
            )}
          </AnimatePresence>

          {/* Stats Footer */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FooterStat
              label="Tactics"
              value={matrix?.tactics.length.toString() || '0'}
              icon={<Layers className="w-4 h-4" />}
            />
            <FooterStat
              label="Techniques"
              value={techniquesMap?.size.toString() || '0'}
              icon={<Target className="w-4 h-4" />}
            />
            <FooterStat
              label="Platforms"
              value={platforms.length.toString()}
              icon={<Cpu className="w-4 h-4" />}
            />
            <FooterStat
              label="Last Updated"
              value={data ? new Date(data.objects[0]?.modified || '').toLocaleDateString() : 'Unknown'}
              icon={<Calendar className="w-4 h-4" />}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Helper Components

function TechniqueCard({ technique, expanded, onToggle, onSelect }: { 
  technique: Technique; 
  expanded: boolean; 
  onToggle: () => void;
  onSelect: () => void;
}) {
  return (
    <motion.div
      layout
      className="glass border border-border/50 rounded-lg overflow-hidden"
    >
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-muted/5 transition-colors"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-primary">{technique.external_id}</span>
              {technique.deprecated && (
                <span className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-500 rounded-full">
                  Deprecated
                </span>
              )}
            </div>
            <h4 className="font-semibold text-foreground">{technique.name}</h4>
          </div>
          <button className="p-1 hover:bg-muted/30 rounded">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{technique.description}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {technique.platforms.slice(0, 3).map(platform => (
            <span
              key={platform}
              className="px-2 py-0.5 text-xs bg-muted/30 text-muted-foreground rounded-full"
            >
              {platform}
            </span>
          ))}
          {technique.platforms.length > 3 && (
            <span className="px-2 py-0.5 text-xs bg-muted/30 text-muted-foreground rounded-full">
              +{technique.platforms.length - 3}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 p-4 bg-muted/5"
          >
            <div className="space-y-3">
              {technique.subtechniques.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Sub-techniques:</p>
                  <div className="space-y-2">
                    {technique.subtechniques.map(sub => (
                      <div
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect()
                        }}
                        className="p-2 bg-background/50 border border-border/50 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-primary">{sub.external_id}</span>
                          <span className="text-sm font-medium text-foreground">{sub.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {technique.detection && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Detection:</p>
                  <p className="text-xs text-muted-foreground">{technique.detection}</p>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
                className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TechniqueListItem({ technique, onSelect }: { technique: Technique; onSelect: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-primary">{technique.external_id}</span>
            <h4 className="font-semibold text-foreground">{technique.name}</h4>
            {technique.deprecated && (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-500 rounded-full">
                Deprecated
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{technique.description}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {technique.tactics.join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {technique.platforms.join(', ')}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

function TechniqueDetailModal({ technique, onClose }: { technique: Technique; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass border border-border/50 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-xl"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{technique.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">{technique.external_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{technique.description}</p>
          </div>

          {/* Tactics */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Tactics</h3>
            <div className="flex flex-wrap gap-2">
              {technique.tactics.map(tactic => (
                <span
                  key={tactic}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {technique.platforms.map(platform => (
                <span
                  key={platform}
                  className="px-3 py-1 bg-muted/30 text-muted-foreground rounded-full text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Sub-techniques */}
          {technique.subtechniques.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Sub-techniques</h3>
              <div className="space-y-2">
                {technique.subtechniques.map(sub => (
                  <div
                    key={sub.id}
                    className="p-3 border border-border/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary">{sub.external_id}</span>
                      <span className="font-medium text-foreground">{sub.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{sub.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detection */}
          {technique.detection && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Detection</h3>
              <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                {technique.detection}
              </p>
            </div>
          )}

          {/* Contributors */}
          {technique.contributors && technique.contributors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Contributors</h3>
              <div className="flex flex-wrap gap-2">
                {technique.contributors.map(contributor => (
                  <span
                    key={contributor}
                    className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm"
                  >
                    {contributor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Version Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
            <span>Version: {technique.version || '1.0'}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* External Links */}
          <div className="flex gap-2">
            <a
              href={`https://attack.mitre.org/techniques/${technique.external_id.replace('.', '/')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-center text-sm font-medium"
            >
              View on MITRE ATT&CK
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FooterStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass border border-border/50 rounded-lg p-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted/20">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Store techniques map for access in components
let techniquesMap: Map<string, Technique> = new Map()