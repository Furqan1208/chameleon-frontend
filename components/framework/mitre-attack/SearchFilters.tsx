// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\SearchFilters.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronDown, ChevronRight,
  X, Eye, EyeOff, Cpu, Info
} from 'lucide-react'

interface SearchFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedPlatforms: Set<string>
  onTogglePlatform: (platform: string) => void
  showDeprecated: boolean
  onToggleDeprecated: () => void
  showRevoked: boolean
  onToggleRevoked: () => void
  onClearFilters: () => void
  platforms: string[]
  platformCounts: Map<string, number>
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedPlatforms,
  onTogglePlatform,
  showDeprecated,
  onToggleDeprecated,
  showRevoked,
  onToggleRevoked,
  onClearFilters,
  platforms,
  platformCounts
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = searchQuery || selectedPlatforms.size > 0 || !showDeprecated || !showRevoked

  return (
    <div className="glass border border-border/50 rounded-xl p-4 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search techniques by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
              showFilters || selectedPlatforms.size > 0
                ? 'bg-primary/20 border-primary/50 text-primary' 
                : 'border-border/50 hover:border-primary/50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {selectedPlatforms.size > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {selectedPlatforms.size}
              </span>
            )}
          </motion.button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors text-sm"
            >
              Clear
            </button>
          )}
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
              {/* Platform Filters */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(platform => {
                    const count = platformCounts.get(platform) || 0
                    return (
                      <button
                        key={platform}
                        onClick={() => onTogglePlatform(platform)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          selectedPlatforms.has(platform)
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'border border-border hover:bg-muted/30'
                        }`}
                        disabled={count === 0}
                      >
                        {platform}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedPlatforms.has(platform)
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted/30 text-muted-foreground'
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Status
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={onToggleDeprecated}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      !showDeprecated
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                        : 'border border-border hover:bg-muted/30'
                    }`}
                  >
                    {!showDeprecated ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Deprecated
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Deprecated
                      </>
                    )}
                  </button>
                  <button
                    onClick={onToggleRevoked}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      !showRevoked
                        ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                        : 'border border-border hover:bg-muted/30'
                    }`}
                  >
                    {!showRevoked ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide Revoked
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show Revoked
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
                        Search: "{searchQuery}"
                        <button onClick={() => onSearchChange('')} className="hover:text-primary-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {Array.from(selectedPlatforms).map(platform => (
                      <span key={platform} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
                        {platform}
                        <button onClick={() => onTogglePlatform(platform)} className="hover:text-primary-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {!showDeprecated && (
                      <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-500 rounded-full">
                        Deprecated hidden
                      </span>
                    )}
                    {!showRevoked && (
                      <span className="px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded-full">
                        Revoked hidden
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}