// D:\FYP\Chameleon Frontend\app\dashboard\frameworks\mitre-attack\page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { motion } from "framer-motion"
import Link from 'next/link'
import {
  Shield,
  Zap,
  ExternalLink,
  Github,
  Grid,
  List,
  Layers,
  Menu,
  X
} from "lucide-react"

// Import MITRE components
import { MITREProvider, useMITRE, useActiveData } from "@/components/framework/mitre-attack/context"
import { DomainSelector } from "@/components/framework/mitre-attack/DomainSelector"
import { StatsOverview } from "@/components/framework/mitre-attack/StatsOverview"
import { SearchFilters } from "@/components/framework/mitre-attack/SearchFilters"
import { MatrixView } from "@/components/framework/mitre-attack/MatrixView"
import { ListView } from "@/components/framework/mitre-attack/ListView"
import { TableView } from "@/components/framework/mitre-attack/TableView"
import { TechniqueDetailModal } from "@/components/framework/mitre-attack/TechniqueDetailModal"
import type { Technique, Tactic } from "@/components/framework/mitre-attack/types"

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

function MITREAttackContent() {
  const { loading, error, refreshData } = useMITRE()
  const activeData = useActiveData()
  
  // UI state
  const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"matrix" | "list" | "table">("matrix")
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set())
  const [showDeprecated, setShowDeprecated] = useState(false)
  const [showRevoked, setShowRevoked] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Get platform counts for filtering
  const platformCounts = useMemo(() => {
    if (!activeData) return new Map<string, number>()
    
    const counts = new Map<string, number>()
    activeData.techniques.forEach(tech => {
      tech.platforms.forEach(platform => {
        counts.set(platform, (counts.get(platform) || 0) + 1)
      })
      tech.subtechniques.forEach(sub => {
        sub.platforms.forEach(platform => {
          counts.set(platform, (counts.get(platform) || 0) + 1)
        })
      })
    })
    return counts
  }, [activeData])

  // Get filtered techniques
  const filteredTechniques = useMemo(() => {
    if (!activeData) return []

    let filtered = activeData.techniques

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tech => 
        tech.name.toLowerCase().includes(query) ||
        tech.description.toLowerCase().includes(query) ||
        tech.external_id.toLowerCase().includes(query) ||
        tech.subtechniques.some(sub => 
          sub.name.toLowerCase().includes(query) ||
          sub.description.toLowerCase().includes(query) ||
          sub.external_id.toLowerCase().includes(query)
        )
      )
    }

    // Apply platform filter
    if (selectedPlatforms.size > 0) {
      filtered = filtered.filter(tech => 
        tech.platforms.some(p => selectedPlatforms.has(p)) ||
        tech.subtechniques.some(sub => sub.platforms.some(p => selectedPlatforms.has(p)))
      )
    }

    // Apply deprecated filter
    if (!showDeprecated) {
      filtered = filtered.filter(tech => !tech.deprecated)
    }

    // Apply revoked filter
    if (!showRevoked) {
      filtered = filtered.filter(tech => !tech.revoked)
    }

    return filtered
  }, [activeData, searchQuery, selectedPlatforms, showDeprecated, showRevoked])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(platform)) {
        next.delete(platform)
      } else {
        next.add(platform)
      }
      return next
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

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedPlatforms(new Set())
    setShowDeprecated(false)
    setShowRevoked(false)
    setSelectedTactic(null)
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

  if (error || !activeData) {
    return (
      <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
        <NetworkBackground />
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="glass border border-red-500/30 bg-red-500/5 rounded-xl p-12 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center gap-4">
              <Shield className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-bold text-foreground">Failed to Load MITRE ATT&CK Data</h2>
              <p className="text-muted-foreground">{error || 'No data available'}</p>
              <button
                onClick={refreshData}
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
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
                  Comprehensive threat intelligence framework
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 border border-border rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop header actions */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://attack.mitre.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Official Site
              </a>
              <a
                href="https://github.com/mitre/cti"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </motion.div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden glass border border-border/50 rounded-xl p-4 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-2">
                <a
                  href="https://attack.mitre.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Official Site
                </a>
                <a
                  href="https://github.com/mitre/cti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </motion.div>
          )}

          {/* Domain Selector */}
          <motion.div variants={itemVariants}>
            <DomainSelector />
          </motion.div>

          {/* Framework sub-navigation */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/frameworks/mitre-attack/apt"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              APT Groups
            </Link>
            <Link
              href="/dashboard/frameworks/mitre-attack/campaigns"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/dashboard/frameworks/mitre-attack/malwares"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              Malwares
            </Link>
            <Link
              href="/dashboard/frameworks/mitre-attack/tools"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              Tools
            </Link>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <StatsOverview />
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants}>
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={togglePlatform}
              showDeprecated={showDeprecated}
              onToggleDeprecated={() => setShowDeprecated(!showDeprecated)}
              showRevoked={showRevoked}
              onToggleRevoked={() => setShowRevoked(!showRevoked)}
              onClearFilters={clearFilters}
              platforms={Array.from(
                activeData.techniques.reduce((acc, tech) => {
                  tech.platforms.forEach(p => acc.add(p))
                  tech.subtechniques.forEach(sub => sub.platforms.forEach(p => acc.add(p)))
                  return acc
                }, new Set<string>())
              )}
              platformCounts={platformCounts}
            />
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div variants={itemVariants} className="flex items-center justify-end gap-1 p-1 bg-muted/30 rounded-lg border border-border/50 w-fit ml-auto">
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
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
            {viewMode === 'matrix' && (
              <MatrixView
                tactics={activeData.tactics}
                techniques={filteredTechniques}
                selectedTactic={selectedTactic}
                onSelectTactic={setSelectedTactic}
                onClearTactic={() => setSelectedTactic(null)}
                expandedTechniques={expandedTechniques}
                onToggleTechnique={toggleTechnique}
                onSelectTechnique={setSelectedTechnique}
              />
            )}
            {viewMode === 'list' && (
              <ListView
                techniques={filteredTechniques}
                expandedTechniques={expandedTechniques}
                onToggleTechnique={toggleTechnique}
                onSelectTechnique={setSelectedTechnique}
              />
            )}
            {viewMode === 'table' && (
              <TableView
                techniques={filteredTechniques}
                tactics={activeData.tactics}
                onSelectTechnique={setSelectedTechnique}
              />
            )}
          </motion.div>

          {/* Technique Detail Modal */}
          {selectedTechnique && (
            <TechniqueDetailModal
              technique={selectedTechnique}
              tactics={activeData.tactics}
              onClose={() => setSelectedTechnique(null)}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Wrap with provider
export default function MITREAttackPage() {
  return (
    <MITREProvider>
      <MITREAttackContent />
    </MITREProvider>
  )
}