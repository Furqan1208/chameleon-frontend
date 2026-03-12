// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\TechniqueCard.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronRight, AlertTriangle, XCircle,
  Target, Info, Cpu, Layers, Eye
} from 'lucide-react'
import { Technique } from './types'

interface TechniqueCardProps {
  technique: Technique
  expanded: boolean
  onToggle: () => void
  onSelect: () => void
}

export function TechniqueCard({ technique, expanded, onToggle, onSelect }: TechniqueCardProps) {
  return (
    <motion.div
      layout
      className="glass border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 transition-all"
    >
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-muted/5 transition-colors"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {technique.external_id}
              </span>
              {technique.deprecated && (
                <span className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-500 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Deprecated
                </span>
              )}
              {technique.revoked && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500/10 text-red-500 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Revoked
                </span>
              )}
            </div>
            <h4 className="font-semibold text-foreground">{technique.name}</h4>
          </div>
          <button className="p-1 hover:bg-muted/30 rounded transition-colors">
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
                  <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    Sub-techniques ({technique.subtechniques.length}):
                  </p>
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
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
                className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                View Full Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}