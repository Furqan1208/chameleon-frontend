// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\TableView.tsx
import React from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Technique, Tactic } from './types'

interface TableViewProps {
  techniques: Technique[]
  tactics: Tactic[]
  onSelectTechnique: (technique: Technique) => void
}

export function TableView({ techniques, tactics, onSelectTechnique }: TableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/5">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tactics</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platforms</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sub-techniques</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {techniques.map((technique) => (
            <tr
              key={technique.id}
              onClick={() => onSelectTechnique(technique)}
              className="border-b border-border/50 hover:bg-muted/5 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary">{technique.external_id}</td>
              <td className="py-3 px-4 font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {technique.name}
                  {technique.deprecated && (
                    <span className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-500 rounded-full">
                      Deprecated
                    </span>
                  )}
                  {technique.revoked && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-500/10 text-red-500 rounded-full">
                      Revoked
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {technique.tactics.map(tactic => {
                    const tacticObj = tactics.find(t => t.shortname === tactic)
                    return (
                      <span
                        key={tactic}
                        className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {tacticObj?.name || tactic}
                      </span>
                    )
                  })}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1 max-w-xs">
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
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {technique.subtechniques.length}
              </td>
              <td className="py-3 px-4">
                {technique.deprecated ? (
                  <span className="flex items-center gap-1 text-xs text-yellow-500">
                    <AlertTriangle className="w-3 h-3" />
                    Deprecated
                  </span>
                ) : technique.revoked ? (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle className="w-3 h-3" />
                    Revoked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}