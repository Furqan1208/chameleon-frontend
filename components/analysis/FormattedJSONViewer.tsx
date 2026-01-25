"use client"

import { Fingerprint, FolderTree } from "lucide-react"

interface FormattedJSONViewerProps {
  data: any
  title?: string
}

export default function FormattedJSONViewer({ data, title }: FormattedJSONViewerProps) {
  const renderFormattedValue = (value: any, key?: string, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">—</span>
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">Empty</span>
      }
      if (value.length === 1 && typeof value[0] === 'string') {
        return <span className="text-foreground">{value[0]}</span>
      }
      return (
        <div className="space-y-2">
          {value.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-muted-foreground text-xs mt-1">•</span>
              <div>{renderFormattedValue(item, undefined, depth + 1)}</div>
            </div>
          ))}
          {value.length > 10 && (
            <div className="text-xs text-muted-foreground italic">+ {value.length - 10} more items</div>
          )}
        </div>
      )
    }

    // Handle objects
    if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return <span className="text-muted-foreground italic">Empty</span>
      }

      return (
        <div className="space-y-3 ml-4">
          {entries.slice(0, 15).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-blue-400 min-w-fit">{k.replace(/_/g, ' ')}:</span>
                {typeof v !== 'object' && renderFormattedValue(v, k, depth + 1)}
              </div>
              {typeof v === 'object' && (
                <div>{renderFormattedValue(v, undefined, depth + 1)}</div>
              )}
            </div>
          ))}
          {entries.length > 15 && (
            <div className="text-xs text-muted-foreground italic">+ {entries.length - 15} more fields</div>
          )}
        </div>
      )
    }

    // Handle strings
    if (typeof value === 'string') {
      if (/^[a-fA-F0-9]{32,128}$/.test(value)) {
        return (
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3 h-3 text-primary" />
            <code className="text-primary font-mono text-sm break-all">{value}</code>
          </div>
        )
      }
      if (value.includes('/') || value.includes('\\')) {
        return (
          <div className="flex items-center gap-2">
            <FolderTree className="w-3 h-3 text-secondary" />
            <code className="text-foreground font-mono text-sm break-all">{value}</code>
          </div>
        )
      }
      return <span className="text-foreground">{value}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-accent font-medium">{value.toLocaleString()}</span>
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
          value ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }

    return <span className="text-foreground">{String(value)}</span>
  }

  return (
    <div className="space-y-4">
      {title && <h4 className="font-semibold text-foreground text-lg">{title}</h4>}
      <div className="text-sm leading-relaxed max-h-[500px] overflow-y-auto">
        {renderFormattedValue(data)}
      </div>
    </div>
  )
}