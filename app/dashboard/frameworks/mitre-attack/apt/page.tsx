// D:\FYP\Chameleon Frontend\app\dashboard\frameworks\mitre-attack\apt\page.tsx
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import {
  Users, Search, Filter, ChevronDown, ChevronRight,
  X, ExternalLink, Github, Calendar, Target,
  Layers, Cpu, AlertTriangle, Info, GitBranch,
  BarChart3, PieChart, Download, Upload, Globe,
  Shield, Hash, Clock, Link as LinkIcon,
  ArrowUpRight, ChevronLeft, Grid, List, Table,
  Eye, EyeOff, BookOpen, Code, Terminal, Package,
  Zap, Sparkles, Rocket, Gauge, Radar, Bot, Atom,
  Binary, Cloud, Database, Lock, Unlock, Key,
  Fingerprint, Scan, Satellite, Radio, Crosshair,
  Hexagon, Star, Heart, ThumbsUp, ThumbsDown,
  Smile, Frown, Meh, Laugh, Angry, Flag,
  Map, MapPin, Navigation, Compass, Route,
  Clock as ClockIcon,
  Calendar as CalendarIcon, CalendarDays,
  CalendarRange, CalendarCheck, CalendarX,
  CalendarPlus, CalendarMinus, CalendarHeart,
  CalendarClock, CalendarOff, CalendarCog,
  Globe2, Earth, EarthLock, Network,
  Server, HardDrive, CloudCog, Cloudy,
  Wind, Droplets, Mountain, TreePine,
  Sun, Moon, CloudSun, CloudMoon,
  Skull, Ghost, Swords, Bomb, Flame,
  Bug, Wrench
} from "lucide-react"
import { useMITRE, useActiveData } from "@/components/framework/mitre-attack/context"
import { RelationshipProcessor } from "@/components/framework/mitre-attack/relationship-utils"
import type { Group, Technique, Software, Campaign, GroupDetail } from "@/components/framework/mitre-attack/analysis-types"

// Common APT group aliases and regions
const REGIONS = [
  "China", "Russia", "North Korea", "Iran", "United States", 
  "India", "Pakistan", "Middle East", "Europe", "Southeast Asia",
  "Latin America", "Africa", "Unknown"
]

const SECTORS = [
  "Government", "Financial", "Energy", "Telecommunications", "Technology",
  "Healthcare", "Education", "Media", "Defense", "Aerospace",
  "Manufacturing", "Retail", "Transportation", "Research", "NGO"
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function APTPage() {
  const { loading, error } = useMITRE()
  const activeData = useActiveData()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedSector, setSelectedSector] = useState<string>("all")
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "techniques" | "software" | "campaigns">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Process groups with relationships
  const groups = useMemo(() => {
    if (!activeData) return []

    const processor = new RelationshipProcessor(
      activeData.techniques,
      activeData.malware,
      activeData.groups,
      activeData.campaigns,
      activeData.relationships
    )

    return activeData.groups.map(group => {
      const relationships = processor.getGroupRelationships(group.id)
      const techniquesByTactic = processor.getTechniquesByTactic(relationships.uses)
      
      // Separate malware and tools
      const malware = relationships.usesSoftware.filter(s => s.type === 'malware')
      const tools = relationships.usesSoftware.filter(s => s.type === 'tool')
      
      // Infer region from description and aliases
      const region = inferRegion(group.description, group.aliases)
      const sectors = inferSectors(group.description)
      
      return {
        ...group,
        relationships,
        techniques: {
          all: relationships.uses,
          byTactic: techniquesByTactic,
          count: relationships.uses.length
        },
        software: {
          all: relationships.usesSoftware,
          malware,
          tools,
          count: relationships.usesSoftware.length
        },
        region,
        sectors
      } as GroupDetail
    })
  }, [activeData])

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    let filtered = groups

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.external_id.toLowerCase().includes(query) ||
        group.aliases.some(alias => alias.toLowerCase().includes(query))
      )
    }

    // Apply region filter
    if (selectedRegion !== "all") {
      filtered = filtered.filter(group => group.region === selectedRegion)
    }

    // Apply sector filter
    if (selectedSector !== "all") {
      filtered = filtered.filter(group => group.sectors?.includes(selectedSector))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "techniques":
          comparison = a.techniques.count - b.techniques.count
          break
        case "software":
          comparison = a.software.count - b.software.count
          break
        case "campaigns":
          comparison = a.relationships.attributedTo.length - b.relationships.attributedTo.length
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [groups, searchQuery, selectedRegion, selectedSector, sortBy, sortOrder])

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
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">Loading APT Groups...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !activeData) {
    return (
      <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
        <NetworkBackground />
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="glass border border-red-500/30 bg-red-500/5 rounded-xl p-12 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-bold text-foreground">Failed to Load APT Groups</h2>
              <p className="text-muted-foreground">{error || 'No data available'}</p>
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-500" />
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
              <div className="p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  APT Groups
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {groups.length} threat actor groups and campaigns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://attack.mitre.org/groups/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                MITRE Groups
              </a>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Groups"
              value={groups.length}
              icon={<Users className="w-5 h-5" />}
              color="from-red-500 to-orange-500"
            />
            <StatCard
              label="Active Groups"
              value={groups.filter(g => g.relationships.attributedTo.length > 0 || g.techniques.count > 10).length}
              icon={<Activity className="w-5 h-5" />}
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              label="Total Techniques"
              value={groups.reduce((acc, g) => acc + g.techniques.count, 0)}
              icon={<Target className="w-5 h-5" />}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              label="Total Software"
              value={groups.reduce((acc, g) => acc + g.software.count, 0)}
              icon={<Package className="w-5 h-5" />}
              color="from-purple-500 to-pink-500"
            />
          </motion.div>

          {/* Region Distribution */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-4 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Globe2 className="w-4 h-4" />
              Groups by Region
            </h3>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(region => {
                const count = groups.filter(g => g.region === region).length
                if (count === 0) return null
                return (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(selectedRegion === region ? "all" : region)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      selectedRegion === region
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-muted/30'
                    }`}
                  >
                    {region}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedRegion === region
                        ? 'bg-primary-foreground/20'
                        : 'bg-muted/30'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
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
                    placeholder="Search groups by name, ID, alias, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'hover:bg-muted/30'
                    }`}
                    title="Grid View"
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
                    <Table className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                    showFilters || selectedRegion !== 'all' || selectedSector !== 'all'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {(selectedRegion !== 'all' || selectedSector !== 'all') && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {(selectedRegion !== 'all' ? 1 : 0) + (selectedSector !== 'all' ? 1 : 0)}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg bg-background/50 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="techniques">Sort by Techniques</option>
                  <option value="software">Sort by Software</option>
                  <option value="campaigns">Sort by Campaigns</option>
                </select>

                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border/50 overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Region Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Globe2 className="w-4 h-4" />
                        Region
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedRegion('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedRegion === 'all'
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border hover:bg-muted/30'
                          }`}
                        >
                          All Regions
                        </button>
                        {REGIONS.map(region => {
                          const count = groups.filter(g => g.region === region).length
                          if (count === 0) return null
                          return (
                            <button
                              key={region}
                              onClick={() => setSelectedRegion(region)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                selectedRegion === region
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-border hover:bg-muted/30'
                              }`}
                            >
                              {region}
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedRegion === region
                                  ? 'bg-primary-foreground/20'
                                  : 'bg-muted/30'
                              }`}>
                                {count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Sector Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Target Sector
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSector('all')}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedSector === 'all'
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border hover:bg-muted/30'
                          }`}
                        >
                          All Sectors
                        </button>
                        {SECTORS.map(sector => {
                          const count = groups.filter(g => g.sectors?.includes(sector)).length
                          if (count === 0) return null
                          return (
                            <button
                              key={sector}
                              onClick={() => setSelectedSector(sector)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                selectedSector === sector
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-border hover:bg-muted/30'
                              }`}
                            >
                              {sector}
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                selectedSector === sector
                                  ? 'bg-primary-foreground/20'
                                  : 'bg-muted/30'
                              }`}>
                                {count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Groups Grid/List/Table */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onClick={() => setSelectedGroup(group)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredGroups.map(group => (
                  <GroupListItem
                    key={group.id}
                    group={group}
                    onClick={() => setSelectedGroup(group)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <GroupTable
                groups={filteredGroups}
                onSelect={setSelectedGroup}
              />
            )}

            {filteredGroups.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No groups found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </motion.div>

          {/* Group Detail Modal */}
          <AnimatePresence>
            {selectedGroup && (
              <GroupDetailModal
                group={selectedGroup}
                onClose={() => setSelectedGroup(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Helper function to infer region from description
function inferRegion(description: string, aliases: string[]): string {
  const text = (description + ' ' + aliases.join(' ')).toLowerCase()
  
  if (text.includes('china') || text.includes('chinese') || text.includes('apt1') || text.includes('comment crew')) return 'China'
  if (text.includes('russia') || text.includes('russian') || text.includes('fancy bear') || text.includes('apt28')) return 'Russia'
  if (text.includes('north korea') || text.includes('kim') || text.includes('lazarus') || text.includes('apt37')) return 'North Korea'
  if (text.includes('iran') || text.includes('iranian') || text.includes('apt33') || text.includes('oilrig')) return 'Iran'
  if (text.includes('united states') || text.includes('usa') || text.includes('nsa') || text.includes('cia')) return 'United States'
  if (text.includes('india') || text.includes('pakistan')) return 'South Asia'
  if (text.includes('middle east') || text.includes('israel') || text.includes('saudi')) return 'Middle East'
  if (text.includes('europe') || text.includes('ukraine') || text.includes('russia')) return 'Europe'
  if (text.includes('vietnam') || text.includes('thailand') || text.includes('malaysia')) return 'Southeast Asia'
  
  return 'Unknown'
}

// Helper function to infer target sectors
function inferSectors(description: string): string[] {
  const text = description.toLowerCase()
  const sectors: string[] = []
  
  const sectorKeywords: Record<string, string[]> = {
    'Government': ['government', 'diplomatic', 'embassy', 'political', 'ministry'],
    'Financial': ['bank', 'financial', 'finance', 'payment', 'credit'],
    'Energy': ['energy', 'oil', 'gas', 'power', 'utility', 'grid'],
    'Telecommunications': ['telecom', 'telecommunication', 'mobile', 'network'],
    'Technology': ['technology', 'tech', 'software', 'hardware', 'it'],
    'Healthcare': ['health', 'medical', 'hospital', 'pharma'],
    'Education': ['education', 'university', 'school', 'academic', 'research'],
    'Media': ['media', 'news', 'journalist', 'press'],
    'Defense': ['defense', 'military', 'army', 'navy', 'air force'],
    'Aerospace': ['aerospace', 'aviation', 'space', 'aircraft'],
    'Manufacturing': ['manufacturing', 'industrial', 'factory'],
    'Retail': ['retail', 'e-commerce', 'shopping'],
    'Transportation': ['transport', 'logistics', 'shipping', 'airline'],
    'Research': ['research', 'laboratory', 'scientific'],
    'NGO': ['ngo', 'non-profit', 'humanitarian']
  }
  
  Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      sectors.push(sector)
    }
  })
  
  return sectors.length > 0 ? sectors : ['Unknown']
}

// Group Card Component
function GroupCard({ group, onClick }: { group: GroupDetail; onClick: () => void }) {
  // Determine threat level based on techniques and software
  const threatLevel = group.techniques.count > 50 ? 'Critical' : 
                     group.techniques.count > 25 ? 'High' : 
                     group.techniques.count > 10 ? 'Medium' : 'Low'
  
  const threatColor = threatLevel === 'Critical' ? 'text-red-500' :
                     threatLevel === 'High' ? 'text-orange-500' :
                     threatLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg">
          <Users className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 ${threatColor} bg-opacity-10 rounded-full`}>
            {threatLevel}
          </span>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {group.external_id}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{group.description}</p>

      {group.region && group.region !== 'Unknown' && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Globe2 className="w-3 h-3" />
          <span>{group.region}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Target className="w-3 h-3" />
            {group.techniques.count}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Package className="w-3 h-3" />
            {group.software.count}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Flag className="w-3 h-3" />
            {group.relationships.attributedTo.length}
          </span>
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// Group List Item Component
function GroupListItem({ group, onClick }: { group: GroupDetail; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg">
              <Users className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-mono text-primary">{group.external_id}</span>
            <h3 className="font-semibold text-foreground">{group.name}</h3>
            {group.region && group.region !== 'Unknown' && (
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                {group.region}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{group.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Target className="w-3 h-3" />
              {group.techniques.count} techniques
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Bug className="w-3 h-3" />
              {group.software.malware.length} malware
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Wrench className="w-3 h-3" />
              {group.software.tools.length} tools
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// Group Table Component
function GroupTable({ groups, onSelect }: { groups: GroupDetail[]; onSelect: (group: GroupDetail) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/5">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aliases</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Region</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Techniques</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Malware</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tools</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaigns</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr
              key={group.id}
              onClick={() => onSelect(group)}
              className="border-b border-border/50 hover:bg-muted/5 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary">{group.external_id}</td>
              <td className="py-3 px-4 font-medium text-foreground">{group.name}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {group.aliases.slice(0, 2).map(alias => (
                    <span key={alias} className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                      {alias}
                    </span>
                  ))}
                  {group.aliases.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                      +{group.aliases.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm">{group.region}</span>
              </td>
              <td className="py-3 px-4">{group.techniques.count}</td>
              <td className="py-3 px-4">{group.software.malware.length}</td>
              <td className="py-3 px-4">{group.software.tools.length}</td>
              <td className="py-3 px-4">{group.relationships.attributedTo.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Group Detail Modal
function GroupDetailModal({ group, onClose }: { group: GroupDetail; onClose: () => void }) {
  // Determine threat level
  const threatLevel = group.techniques.count > 50 ? 'Critical' : 
                     group.techniques.count > 25 ? 'High' : 
                     group.techniques.count > 10 ? 'Medium' : 'Low'
  
  const threatColor = threatLevel === 'Critical' ? 'text-red-500' :
                     threatLevel === 'High' ? 'text-orange-500' :
                     threatLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'

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
        className="glass border border-border/50 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto backdrop-blur-xl"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-full">
                  {group.external_id}
                </span>
                <span className={`text-xs px-2 py-0.5 ${threatColor} bg-opacity-10 rounded-full`}>
                  {threatLevel} Threat
                </span>
                {group.region && group.region !== 'Unknown' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">
                    {group.region}
                  </span>
                )}
              </div>
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
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Description
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/5 p-4 rounded-lg border border-border/50">
              {group.description}
            </p>
          </div>

          {/* Aliases */}
          {group.aliases.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Aliases
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.aliases.map(alias => (
                  <span
                    key={alias}
                    className="px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-lg text-sm border border-purple-500/20"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Sectors */}
          {group.sectors && group.sectors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Sectors
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.sectors.map(sector => (
                  <span
                    key={sector}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-sm border border-amber-500/20"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Techniques"
              value={group.techniques.count}
              icon={<Target className="w-4 h-4" />}
              color="from-blue-500 to-cyan-500"
            />
            <StatBox
              label="Malware"
              value={group.software.malware.length}
              icon={<Bug className="w-4 h-4" />}
              color="from-red-500 to-orange-500"
            />
            <StatBox
              label="Tools"
              value={group.software.tools.length}
              icon={<Wrench className="w-4 h-4" />}
              color="from-green-500 to-emerald-500"
            />
            <StatBox
              label="Campaigns"
              value={group.relationships.attributedTo.length}
              icon={<Flag className="w-4 h-4" />}
              color="from-purple-500 to-pink-500"
            />
          </div>

          {/* Techniques by Tactic */}
          {group.techniques.count > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Techniques by Tactic
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Array.from(group.techniques.byTactic.entries())
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([tactic, techniques]) => (
                    <div key={tactic} className="border border-border/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground capitalize">{tactic.replace('-', ' ')}</h4>
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {techniques.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techniques.slice(0, 3).map(tech => (
                          <span
                            key={tech.id}
                            className="text-xs px-2 py-1 bg-muted/30 rounded-full"
                          >
                            {tech.external_id}: {tech.name}
                          </span>
                        ))}
                        {techniques.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-muted/30 rounded-full">
                            +{techniques.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Software Used */}
          {group.software.count > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Software Used
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {group.software.all.map(software => (
                  <div
                    key={software.id}
                    className="p-2 border border-border/50 rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-2">
                      {software.type === 'malware' ? (
                        <Bug className="w-3 h-3 text-red-500" />
                      ) : (
                        <Wrench className="w-3 h-3 text-green-500" />
                      )}
                      <span className="text-xs font-mono text-primary">{software.external_id}</span>
                      <span className="text-xs font-medium text-foreground truncate">{software.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Associated Campaigns */}
          {group.relationships.attributedTo.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Associated Campaigns
              </h3>
              <div className="space-y-2">
                {group.relationships.attributedTo.map(campaign => (
                  <div
                    key={campaign.id}
                    className="p-3 border border-border/50 rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary">{campaign.external_id}</span>
                      <span className="font-medium text-foreground">{campaign.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{campaign.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <a
              href={group.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on MITRE ATT&CK
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Stat Card Component (reused)
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass border border-border/50 rounded-lg p-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Stat Box Component (reused)
function StatBox({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 border border-${color.split(' ')[1]}/20`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  )
}

// Missing imports
import { Activity } from "lucide-react"