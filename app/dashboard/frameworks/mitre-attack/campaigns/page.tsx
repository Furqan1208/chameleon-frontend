// D:\FYP\Chameleon Frontend\app\dashboard\frameworks\mitre-attack\campaigns\page.tsx
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import {
  Calendar, Search, Filter, ChevronDown, ChevronRight,
  X, ExternalLink, Github, Users, Target,
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
  History, Clock as ClockIcon,
  Calendar as CalendarIcon, CalendarDays,
  CalendarRange, CalendarCheck, CalendarX,
  CalendarPlus, CalendarMinus, CalendarHeart,
  CalendarClock, CalendarOff, CalendarCog,
  Bug, Wrench
} from "lucide-react"
import { useMITRE, useActiveData } from "@/components/framework/mitre-attack/context"
import { RelationshipProcessor } from "@/components/framework/mitre-attack/relationship-utils"
import type { Campaign, Group, Technique, Software, CampaignDetail } from "@/components/framework/mitre-attack/analysis-types"

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

export default function CampaignsPage() {
  const { loading, error } = useMITRE()
  const activeData = useActiveData()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "groups" | "techniques" | "firstSeen">("firstSeen")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Process campaigns with relationships
  const campaigns = useMemo(() => {
    if (!activeData) return []

    const processor = new RelationshipProcessor(
      activeData.techniques,
      activeData.malware,
      activeData.groups,
      activeData.campaigns,
      activeData.relationships
    )

    return activeData.campaigns.map(campaign => {
      const relationships = processor.getCampaignRelationships(campaign.id)
      const techniquesByTactic = processor.getTechniquesByTactic(relationships.uses)
      
      // Get all software used by this campaign
      const allSoftware = [...relationships.usesSoftware]
      
      return {
        ...campaign,
        relationships,
        techniques: {
          all: relationships.uses,
          byTactic: techniquesByTactic,
          count: relationships.uses.length
        },
        software: {
          all: allSoftware,
          count: allSoftware.length
        }
      } as CampaignDetail
    })
  }, [activeData])

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.external_id.toLowerCase().includes(query) ||
        campaign.aliases.some(alias => alias.toLowerCase().includes(query))
      )
    }

    // Apply year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter(campaign => {
        const year = campaign.first_seen ? new Date(campaign.first_seen).getFullYear().toString() : null
        return year === selectedYear
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "groups":
          comparison = a.relationships.attributedTo.length - b.relationships.attributedTo.length
          break
        case "techniques":
          comparison = a.techniques.count - b.techniques.count
          break
        case "firstSeen":
          comparison = (a.first_seen || '').localeCompare(b.first_seen || '')
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [campaigns, searchQuery, selectedYear, sortBy, sortOrder])

  // Get unique years
  const years = useMemo(() => {
    const yearSet = new Set<string>()
    campaigns.forEach(campaign => {
      if (campaign.first_seen) {
        yearSet.add(new Date(campaign.first_seen).getFullYear().toString())
      }
    })
    return Array.from(yearSet).sort().reverse()
  }, [campaigns])

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
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">Loading Campaigns...</p>
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
              <h2 className="text-xl font-bold text-foreground">Failed to Load Campaigns</h2>
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
              <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Campaigns
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {campaigns.length} threat campaigns and operations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://attack.mitre.org/campaigns/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                MITRE Campaigns
              </a>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Campaigns"
              value={campaigns.length}
              icon={<Calendar className="w-5 h-5" />}
              color="from-purple-500 to-blue-500"
            />
            <StatCard
              label="Active Campaigns"
              value={campaigns.filter(c => !c.last_seen || new Date(c.last_seen) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length}
              icon={<Activity className="w-5 h-5" />}
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              label="Attributed Groups"
              value={new Set(campaigns.flatMap(c => c.relationships.attributedTo.map(g => g.id))).size}
              icon={<Users className="w-5 h-5" />}
              color="from-orange-500 to-amber-500"
            />
            <StatCard
              label="Avg Techniques"
              value={Math.round(campaigns.reduce((acc, c) => acc + c.techniques.count, 0) / campaigns.length)}
              icon={<Target className="w-5 h-5" />}
              color="from-red-500 to-pink-500"
            />
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search campaigns by name, ID, alias, or description..."
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
                    showFilters || selectedYear !== 'all'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {selectedYear !== 'all' && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      1
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg bg-background/50 text-sm"
                >
                  <option value="firstSeen">Sort by First Seen</option>
                  <option value="name">Sort by Name</option>
                  <option value="groups">Sort by Groups</option>
                  <option value="techniques">Sort by Techniques</option>
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
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Year First Seen
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedYear('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedYear === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted/30'
                        }`}
                      >
                        All Years
                      </button>
                      {years.map(year => {
                        const count = campaigns.filter(c => 
                          c.first_seen && new Date(c.first_seen).getFullYear().toString() === year
                        ).length
                        return (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                              selectedYear === year
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border hover:bg-muted/30'
                            }`}
                          >
                            {year}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              selectedYear === year
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Campaigns Grid/List/Table */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map(campaign => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onClick={() => setSelectedCampaign(campaign)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredCampaigns.map(campaign => (
                  <CampaignListItem
                    key={campaign.id}
                    campaign={campaign}
                    onClick={() => setSelectedCampaign(campaign)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <CampaignTable
                campaigns={filteredCampaigns}
                onSelect={setSelectedCampaign}
              />
            )}

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </motion.div>

          {/* Campaign Detail Modal */}
          <AnimatePresence>
            {selectedCampaign && (
              <CampaignDetailModal
                campaign={selectedCampaign}
                onClose={() => setSelectedCampaign(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Campaign Card Component
function CampaignCard({ campaign, onClick }: { campaign: CampaignDetail; onClick: () => void }) {
  const startYear = campaign.first_seen ? new Date(campaign.first_seen).getFullYear() : 'Unknown'
  const endYear = campaign.last_seen ? new Date(campaign.last_seen).getFullYear() : 'Present'
  const isActive = !campaign.last_seen || new Date(campaign.last_seen) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
          <Flag className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
              Active
            </span>
          )}
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {campaign.external_id}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-1">{campaign.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{campaign.description}</p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Calendar className="w-3 h-3" />
        <span>{startYear} - {endYear}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            {campaign.relationships.attributedTo.length}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Target className="w-3 h-3" />
            {campaign.techniques.count}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Package className="w-3 h-3" />
            {campaign.software.count}
          </span>
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// Campaign List Item Component
function CampaignListItem({ campaign, onClick }: { campaign: CampaignDetail; onClick: () => void }) {
  const startDate = campaign.first_seen ? new Date(campaign.first_seen).toLocaleDateString() : 'Unknown'
  const endDate = campaign.last_seen ? new Date(campaign.last_seen).toLocaleDateString() : 'Present'
  const isActive = !campaign.last_seen || new Date(campaign.last_seen) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <Flag className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm font-mono text-primary">{campaign.external_id}</span>
            <h3 className="font-semibold text-foreground">{campaign.name}</h3>
            {isActive && (
              <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{campaign.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {startDate} - {endDate}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              {campaign.relationships.attributedTo.length} groups
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Target className="w-3 h-3" />
              {campaign.techniques.count} techniques
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// Campaign Table Component
function CampaignTable({ campaigns, onSelect }: { campaigns: CampaignDetail[]; onSelect: (campaign: CampaignDetail) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/5">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aliases</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">First Seen</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Seen</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Groups</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Techniques</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => {
            const isActive = !campaign.last_seen || new Date(campaign.last_seen) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            
            return (
              <tr
                key={campaign.id}
                onClick={() => onSelect(campaign)}
                className="border-b border-border/50 hover:bg-muted/5 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-mono text-sm text-primary">{campaign.external_id}</td>
                <td className="py-3 px-4 font-medium text-foreground">{campaign.name}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {campaign.aliases.slice(0, 2).map(alias => (
                      <span key={alias} className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                        {alias}
                      </span>
                    ))}
                    {campaign.aliases.length > 2 && (
                      <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                        +{campaign.aliases.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  {campaign.first_seen ? new Date(campaign.first_seen).toLocaleDateString() : 'N/A'}
                </td>
                <td className="py-3 px-4 text-sm">
                  {campaign.last_seen ? new Date(campaign.last_seen).toLocaleDateString() : 'Present'}
                </td>
                <td className="py-3 px-4">{campaign.relationships.attributedTo.length}</td>
                <td className="py-3 px-4">{campaign.techniques.count}</td>
                <td className="py-3 px-4">
                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Campaign Detail Modal
function CampaignDetailModal({ campaign, onClose }: { campaign: CampaignDetail; onClose: () => void }) {
  const startDate = campaign.first_seen ? new Date(campaign.first_seen).toLocaleDateString() : 'Unknown'
  const endDate = campaign.last_seen ? new Date(campaign.last_seen).toLocaleDateString() : 'Present'
  const isActive = !campaign.last_seen || new Date(campaign.last_seen) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

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
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{campaign.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-full">
                  {campaign.external_id}
                </span>
                {isActive && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Active Campaign
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
              {campaign.description}
            </p>
          </div>

          {/* Aliases */}
          {campaign.aliases.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Aliases
              </h3>
              <div className="flex flex-wrap gap-2">
                {campaign.aliases.map(alias => (
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

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Timeline
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-border/50 rounded-lg bg-muted/5">
                <p className="text-xs text-muted-foreground mb-1">First Seen</p>
                <p className="text-sm font-medium text-foreground">{startDate}</p>
              </div>
              <div className="p-3 border border-border/50 rounded-lg bg-muted/5">
                <p className="text-xs text-muted-foreground mb-1">Last Seen</p>
                <p className="text-sm font-medium text-foreground">{endDate}</p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Groups"
              value={campaign.relationships.attributedTo.length}
              icon={<Users className="w-4 h-4" />}
              color="from-orange-500 to-amber-500"
            />
            <StatBox
              label="Techniques"
              value={campaign.techniques.count}
              icon={<Target className="w-4 h-4" />}
              color="from-blue-500 to-cyan-500"
            />
            <StatBox
              label="Malware"
              value={campaign.software.all.filter(s => s.type === 'malware').length}
              icon={<Bug className="w-4 h-4" />}
              color="from-red-500 to-orange-500"
            />
            <StatBox
              label="Tools"
              value={campaign.software.all.filter(s => s.type === 'tool').length}
              icon={<Wrench className="w-4 h-4" />}
              color="from-green-500 to-emerald-500"
            />
          </div>

          {/* Attributed Groups */}
          {campaign.relationships.attributedTo.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Attributed Groups
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {campaign.relationships.attributedTo.map(group => (
                  <div
                    key={group.id}
                    className="p-3 border border-border/50 rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary">{group.external_id}</span>
                      <span className="font-medium text-foreground">{group.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{group.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Techniques by Tactic */}
          {campaign.techniques.count > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Techniques by Tactic
              </h3>
              <div className="space-y-3">
                {Array.from(campaign.techniques.byTactic.entries()).map(([tactic, techniques]) => (
                  <div key={tactic} className="border border-border/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground capitalize">{tactic.replace('-', ' ')}</h4>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {techniques.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {techniques.slice(0, 5).map(tech => (
                        <span
                          key={tech.id}
                          className="text-xs px-2 py-1 bg-muted/30 rounded-full"
                        >
                          {tech.external_id}: {tech.name}
                        </span>
                      ))}
                      {techniques.length > 5 && (
                        <span className="text-xs px-2 py-1 bg-muted/30 rounded-full">
                          +{techniques.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Software Used */}
          {campaign.software.count > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Software Used
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {campaign.software.all.slice(0, 6).map(software => (
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
                {campaign.software.count > 6 && (
                  <div className="p-2 border border-border/50 rounded-lg bg-muted/5 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{campaign.software.count - 6} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <a
              href={campaign.url}
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