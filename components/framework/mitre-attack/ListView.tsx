// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\ListView.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Layers, Cpu, AlertTriangle, XCircle } from 'lucide-react'
import { Technique } from './types'

interface ListViewProps {
  techniques: Technique[]
  expandedTechniques: Set<string>
  onToggleTechnique: (id: string) => void
  onSelectTechnique: (technique: Technique) => void
}

export function ListView({
  techniques,
  expandedTechniques,
  onToggleTechnique,
  onSelectTechnique
}: ListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {techniques.length} techniques
          {techniques.reduce((acc, t) => acc + t.subtechniques.length, 0) > 0 && (
            <span className="ml-1">
              ({techniques.reduce((acc, t) => acc + t.subtechniques.length, 0)} sub-techniques)
            </span>
          )}
        </p>
      </div>

      <div className="space-y-2">
        {techniques.map((technique) => (
          <TechniqueListItem
            key={technique.id}
            technique={technique}
            expanded={expandedTechniques.has(technique.id)}
            onToggle={() => onToggleTechnique(technique.id)}
            onSelect={() => onSelectTechnique(technique)}
          />
        ))}
      </div>
    </div>
  )
}

function TechniqueListItem({ technique, expanded, onToggle, onSelect }: {
  technique: Technique
  expanded: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="glass border border-border/50 rounded-lg overflow-hidden cursor-pointer"
    >
      <div
        onClick={onToggle}
        className="p-4 hover:bg-muted/5 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {technique.external_id}
              </span>
              <h4 className="font-semibold text-foreground">{technique.name}</h4>
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
          <button className="p-1 hover:bg-muted/30 rounded">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
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
                        onClick={onSelect}
                        className="p-2 bg-background/50 border border-border/50 rounded-lg hover:bg-primary/5 transition-colors"
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

              <button
                onClick={onSelect}
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