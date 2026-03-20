// D:\FYP\Chameleon Frontend\app\dashboard\frameworks\mitre-attack\tools\page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wrench, Search, Filter, ChevronDown, ChevronRight,
  X, ExternalLink, Github, Calendar, Users, Target,
  Layers, Cpu, AlertTriangle, Info, GitBranch,
  BarChart3, PieChart, Download, Upload, Globe,
  Shield, Hash, Clock, Link as LinkIcon,
  ArrowUpRight, ChevronLeft, Grid, List, Table,
  Eye, EyeOff, BookOpen, Code, Terminal, Package,
  Zap, Sparkles, Rocket, Gauge, Radar, Bot, Atom,
  Binary, Cloud, Database, Lock, Unlock, Key,
  Fingerprint, Scan, Satellite, Radio, Crosshair,
  Hexagon, Star, Heart, ThumbsUp, ThumbsDown,
  Smile, Frown, Meh, Laugh, Angry
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMITRE, useActiveData } from "@/components/framework/mitre-attack/context"
import { RelationshipProcessor } from "@/components/framework/mitre-attack/relationship-utils"
import type { Software, Technique, Group, SoftwareDetail } from "@/components/framework/mitre-attack/analysis-types"

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

export default function ToolsPage() {
  const { loading, error } = useMITRE()
  const activeData = useActiveData()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [selectedTool, setSelectedTool] = useState<SoftwareDetail | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "techniques" | "groups">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Process tools with relationships
  const tools = useMemo(() => {
    if (!activeData) return []

    const processor = new RelationshipProcessor(
      activeData.techniques,
      activeData.tools,
      activeData.groups,
      activeData.campaigns,
      activeData.relationships
    )

    return activeData.tools.map(tool => {
      const relationships = processor.getSoftwareRelationships(tool.id)
      const techniquesByTactic = processor.getTechniquesByTactic(relationships.uses)
      
      return {
        ...tool,
        relationships,
        techniques: {
          all: relationships.uses,
          byTactic: techniquesByTactic,
          count: relationships.uses.length
        }
      } as SoftwareDetail
    })
  }, [activeData])

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = tools

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.external_id.toLowerCase().includes(query) ||
        tool.aliases.some(alias => alias.toLowerCase().includes(query))
      )
    }

    // Apply platform filter
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(tool =>
        tool.platforms?.includes(selectedPlatform)
      )
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
        case "groups":
          comparison = a.relationships.usedBy.length - b.relationships.usedBy.length
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [tools, searchQuery, selectedPlatform, sortBy, sortOrder])

  // Get unique platforms
  const platforms = useMemo(() => {
    const platformSet = new Set<string>()
    tools.forEach(tool => {
      tool.platforms?.forEach(p => platformSet.add(p))
    })
    return Array.from(platformSet).sort()
  }, [tools])

  if (loading) {
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
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">Loading Tools...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !activeData) {
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
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <AlertTriangle className="w-12 h-12 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Failed to Load Tools</h2>
              <p className="text-muted-foreground">{error || 'No data available'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Wrench className="w-8 h-8 text-emerald-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-2">Software Tools</p>
                <h1 className="text-3xl font-bold text-white">Tools</h1>
                <p className="text-muted-foreground mt-2">
                  {tools.length} offensive and utility tools used in attacks
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Tools"
              value={tools.length}
              icon={<Wrench className="w-5 h-5" />}
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              label="With Techniques"
              value={tools.filter(t => t.techniques.count > 0).length}
              icon={<Target className="w-5 h-5" />}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              label="Used by Groups"
              value={tools.filter(t => t.relationships.usedBy.length > 0).length}
              icon={<Users className="w-5 h-5" />}
              color="from-purple-500 to-pink-500"
            />
            <StatCard
              label="Avg Techniques"
              value={Math.round(tools.reduce((acc, t) => acc + t.techniques.count, 0) / tools.length)}
              icon={<BarChart3 className="w-5 h-5" />}
              color="from-orange-500 to-amber-500"
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
                    placeholder="Search tools by name, ID, alias, or description..."
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
                    showFilters || selectedPlatform !== 'all'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {selectedPlatform !== 'all' && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      1
                    </span>
                  )}
                </button>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "techniques" | "groups") }>
                  <SelectTrigger className="h-10 min-w-[168px] px-3 rounded-lg border-[#22262d] bg-[#101214] text-slate-100 hover:border-[#2a2f38] focus-visible:ring-primary/20 focus-visible:border-primary/40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                    <SelectItem value="name" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Sort by Name</SelectItem>
                    <SelectItem value="techniques" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Sort by Techniques</SelectItem>
                    <SelectItem value="groups" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Sort by Groups</SelectItem>
                  </SelectContent>
                </Select>

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
                      <Cpu className="w-4 h-4" />
                      Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedPlatform('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedPlatform === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted/30'
                        }`}
                      >
                        All Platforms
                      </button>
                      {platforms.map(platform => {
                        const count = tools.filter(t => t.platforms?.includes(platform)).length
                        return (
                          <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                              selectedPlatform === platform
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border hover:bg-muted/30'
                            }`}
                          >
                            {platform}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              selectedPlatform === platform
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

          {/* Tools Grid/List/Table */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onClick={() => setSelectedTool(tool)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredTools.map(tool => (
                  <ToolListItem
                    key={tool.id}
                    tool={tool}
                    onClick={() => setSelectedTool(tool)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <ToolTable
                tools={filteredTools}
                onSelect={setSelectedTool}
              />
            )}

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                  <Wrench className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No tools found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </motion.div>

          {/* Tool Detail Modal */}
          <AnimatePresence>
            {selectedTool && (
              <ToolDetailModal
                tool={selectedTool}
                onClose={() => setSelectedTool(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Tool Card Component
function ToolCard({ tool, onClick }: { tool: SoftwareDetail; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
          <Wrench className="w-5 h-5 text-green-500" />
        </div>
        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {tool.external_id}
        </span>
      </div>

      <h3 className="font-semibold text-foreground mb-1">{tool.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tool.description}</p>

      {tool.aliases.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Also known as:</p>
          <div className="flex flex-wrap gap-1">
            {tool.aliases.slice(0, 2).map(alias => (
              <span key={alias} className="px-2 py-0.5 text-xs bg-muted/30 rounded-full">
                {alias}
              </span>
            ))}
            {tool.aliases.length > 2 && (
              <span className="px-2 py-0.5 text-xs bg-muted/30 rounded-full">
                +{tool.aliases.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Target className="w-3 h-3" />
            {tool.techniques.count}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            {tool.relationships.usedBy.length}
          </span>
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// Tool List Item Component
function ToolListItem({ tool, onClick }: { tool: SoftwareDetail; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="glass border border-border/50 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
              <Wrench className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-sm font-mono text-primary">{tool.external_id}</span>
            <h3 className="font-semibold text-foreground">{tool.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{tool.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Target className="w-3 h-3" />
              {tool.techniques.count} techniques
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              Used by {tool.relationships.usedBy.length} groups
            </span>
            {tool.platforms && tool.platforms.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Cpu className="w-3 h-3" />
                {tool.platforms.join(', ')}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// Tool Table Component
function ToolTable({ tools, onSelect }: { tools: SoftwareDetail[]; onSelect: (tool: SoftwareDetail) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/5">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Aliases</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platforms</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Techniques</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Used By</th>
          </tr>
        </thead>
        <tbody>
          {tools.map(tool => (
            <tr
              key={tool.id}
              onClick={() => onSelect(tool)}
              className="border-b border-border/50 hover:bg-muted/5 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary">{tool.external_id}</td>
              <td className="py-3 px-4 font-medium text-foreground">{tool.name}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {tool.aliases.slice(0, 2).map(alias => (
                    <span key={alias} className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                      {alias}
                    </span>
                  ))}
                  {tool.aliases.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                      +{tool.aliases.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {tool.platforms?.slice(0, 2).map(platform => (
                    <span key={platform} className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                      {platform}
                    </span>
                  ))}
                  {tool.platforms && tool.platforms.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                      +{tool.platforms.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">{tool.techniques.count}</td>
              <td className="py-3 px-4">{tool.relationships.usedBy.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Tool Detail Modal
function ToolDetailModal({ tool, onClose }: { tool: SoftwareDetail; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="border border-[#1a1a1a] bg-[#080808] rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0d0d0d] border-b border-[#1a1a1a] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg">
              <Wrench className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{tool.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-full">
                  {tool.external_id}
                </span>
                {tool.aliases.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full">
                    {tool.aliases.length} aliases
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
              {tool.description}
            </p>
          </div>

          {/* Aliases */}
          {tool.aliases.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Aliases
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.aliases.map(alias => (
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

          {/* Platforms */}
          {tool.platforms && tool.platforms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Platforms
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.platforms.map(platform => (
                  <span
                    key={platform}
                    className="px-3 py-1.5 bg-muted/30 text-muted-foreground rounded-lg text-sm border border-border/50"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Techniques"
              value={tool.techniques.count}
              icon={<Target className="w-4 h-4" />}
              tone="sky"
            />
            <StatBox
              label="Used By Groups"
              value={tool.relationships.usedBy.length}
              icon={<Users className="w-4 h-4" />}
              tone="violet"
            />
            <StatBox
              label="Mitigations"
              value={tool.relationships.mitigations.length}
              icon={<Shield className="w-4 h-4" />}
              tone="amber"
            />
            <StatBox
              label="Related Tools"
              value={tool.relationships.relatedSoftware.length}
              icon={<Package className="w-4 h-4" />}
              tone="emerald"
            />
          </div>

          {/* Techniques by Tactic */}
          {tool.techniques.count > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Techniques by Tactic
              </h3>
              <div className="space-y-3">
                {Array.from(tool.techniques.byTactic.entries()).map(([tactic, techniques]) => (
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

          {/* Used By Groups */}
          {tool.relationships.usedBy.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Used By Groups
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tool.relationships.usedBy.map(group => (
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

          {/* Mitigations */}
          {tool.relationships.mitigations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Mitigations
              </h3>
              <div className="space-y-2">
                {tool.relationships.mitigations.map(mitigation => (
                  <div
                    key={mitigation.id}
                    className="p-3 border border-border/50 rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary">{mitigation.external_id}</span>
                      <span className="font-medium text-foreground">{mitigation.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mitigation.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <a
              href={tool.url}
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

// Stat Card Component
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="border border-[#1a1a1a] bg-[#0d0d0d] rounded-lg p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Stat Box Component
function StatBox({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "sky" | "rose" | "emerald" | "violet" | "amber" }) {
  const toneStyles = {
    sky: {
      chip: "bg-sky-500/10 border-sky-400/20 text-sky-300",
      icon: "text-sky-300"
    },
    rose: {
      chip: "bg-rose-500/10 border-rose-400/20 text-rose-300",
      icon: "text-rose-300"
    },
    emerald: {
      chip: "bg-emerald-500/10 border-emerald-400/20 text-emerald-300",
      icon: "text-emerald-300"
    },
    violet: {
      chip: "bg-violet-500/10 border-violet-400/20 text-violet-300",
      icon: "text-violet-300"
    },
    amber: {
      chip: "bg-amber-500/10 border-amber-400/20 text-amber-300",
      icon: "text-amber-300"
    }
  } as const

  const style = toneStyles[tone]

  return (
    <div className="p-3 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d]">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-md border ${style.chip}`}>
          <span className={style.icon}>{icon}</span>
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}