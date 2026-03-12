// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\TechniqueDetailModal.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  X, Target, Info, Layers, Cpu, ChevronRight,
  Eye, Hash, Clock, Calendar, ExternalLink,
  AlertTriangle, XCircle, Users
} from 'lucide-react'
import { Technique, Tactic } from './types'

interface TechniqueDetailModalProps {
  technique: Technique
  tactics: Tactic[]
  onClose: () => void
}

export function TechniqueDetailModal({ technique, tactics, onClose }: TechniqueDetailModalProps) {
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
        className="glass border border-border/50 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto backdrop-blur-xl"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{technique.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-full">
                  {technique.external_id}
                </span>
                {technique.deprecated && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Deprecated
                  </span>
                )}
                {technique.revoked && (
                  <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Revoked
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
              {technique.description}
            </p>
          </div>

          {/* Tactics */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Tactics
            </h3>
            <div className="flex flex-wrap gap-2">
              {technique.tactics.map(tacticName => {
                const tactic = tactics.find(t => t.shortname === tacticName)
                return (
                  <span
                    key={tacticName}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm border border-primary/20"
                  >
                    {tactic?.name || tacticName}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Platforms
            </h3>
            <div className="flex flex-wrap gap-2">
              {technique.platforms.map(platform => (
                <span
                  key={platform}
                  className="px-3 py-1.5 bg-muted/30 text-muted-foreground rounded-lg text-sm border border-border/50"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Sub-techniques */}
          {technique.subtechniques.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Sub-techniques ({technique.subtechniques.length})
              </h3>
              <div className="space-y-3">
                {technique.subtechniques.map(sub => (
                  <div
                    key={sub.id}
                    className="p-4 border border-border/50 rounded-lg bg-muted/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {sub.external_id}
                      </span>
                      <span className="font-medium text-foreground">{sub.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{sub.description}</p>
                    {sub.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sub.platforms.map(platform => (
                          <span key={platform} className="text-xs px-2 py-0.5 bg-muted/30 text-muted-foreground rounded-full">
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detection */}
          {technique.detection && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Detection
              </h3>
              <div className="text-sm text-muted-foreground bg-muted/5 p-4 rounded-lg border border-border/50">
                {technique.detection}
              </div>
            </div>
          )}

          {/* Contributors */}
          {technique.contributors && technique.contributors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contributors
              </h3>
              <div className="flex flex-wrap gap-2">
                {technique.contributors.map(contributor => (
                  <span
                    key={contributor}
                    className="px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-lg text-sm border border-purple-500/20"
                  >
                    {contributor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Version Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Version: {technique.version || '1.0'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Created: {new Date(technique.created).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Modified: {new Date(technique.modified).toLocaleDateString()}
            </span>
          </div>

          {/* External Links */}
          <div className="flex gap-3">
            <a
              href={technique.url}
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