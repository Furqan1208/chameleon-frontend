// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\MatrixView.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Target } from 'lucide-react'
import { Tactic, Technique } from './types'
import { TechniqueCard } from './TechniqueCard'

interface MatrixViewProps {
  tactics: Tactic[]
  techniques: Technique[]
  selectedTactic: Tactic | null
  onSelectTactic: (tactic: Tactic) => void
  onClearTactic: () => void
  expandedTechniques: Set<string>
  onToggleTechnique: (id: string) => void
  onSelectTechnique: (technique: Technique) => void
}

export function MatrixView({
  tactics,
  techniques,
  selectedTactic,
  onSelectTactic,
  onClearTactic,
  expandedTechniques,
  onToggleTechnique,
  onSelectTechnique
}: MatrixViewProps) {
  const getTechniquesForTactic = (tacticShortname: string) => {
    return techniques.filter(tech => tech.tactics.includes(tacticShortname))
  }

  return (
    <div className="space-y-8">
      {/* Tactics Row */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {tactics.map((tactic) => (
            <motion.button
              key={tactic.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTactic(tactic)}
              className={`w-56 flex-shrink-0 p-4 rounded-xl border-2 transition-all ${
                selectedTactic?.id === tactic.id
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-border/50 hover:border-primary/30 bg-gradient-to-br from-muted/5 to-muted/10 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {tactic.external_id}
                </span>
                <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                  {getTechniquesForTactic(tactic.shortname).length}
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-left text-sm">{tactic.name}</h3>
              <p className="text-xs text-muted-foreground text-left mt-1 line-clamp-2">
                {tactic.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Techniques Grid */}
      <AnimatePresence mode="wait">
        {selectedTactic ? (
          <motion.div
            key={selectedTactic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">{selectedTactic.name}</h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono">
                    {selectedTactic.external_id}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 max-w-3xl">{selectedTactic.description}</p>
              </div>
              <button
                onClick={onClearTactic}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Matrix
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {getTechniquesForTactic(selectedTactic.shortname).map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  expanded={expandedTechniques.has(technique.id)}
                  onToggle={() => onToggleTechnique(technique.id)}
                  onSelect={() => onSelectTechnique(technique)}
                />
              ))}
            </div>

            {getTechniquesForTactic(selectedTactic.shortname).length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No techniques found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl mb-4">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Select a Tactic</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click on any tactic above to explore its techniques and sub-techniques in detail
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}