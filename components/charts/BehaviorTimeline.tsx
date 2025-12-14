// components/charts/BehaviorTimeline.tsx
"use client"

import { useState } from 'react'
import { Activity, Clock, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'

interface TimelineEvent {
  timestamp: string
  process: string
  action: string
  severity: 'low' | 'medium' | 'high'
  details?: string
}

interface BehaviorTimelineProps {
  events: TimelineEvent[]
  title?: string
  maxVisible?: number
}

export function BehaviorTimeline({ events, title = "Behavior Timeline", maxVisible = 5 }: BehaviorTimelineProps) {
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(maxVisible)

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'medium': return 'bg-accent/20 text-accent border-accent/30'
      default: return 'bg-primary/20 text-primary border-primary/30'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'high': return '🔥'
      case 'medium': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const displayedEvents = expanded ? events : events.slice(0, visibleCount)

  return (
    <div className="glass border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-secondary" />
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayedEvents.map((event, index) => (
          <div key={index} className="relative">
            {/* Timeline line */}
            {index < displayedEvents.length - 1 && (
              <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-border" />
            )}
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getSeverityColor(event.severity)}`}>
                  <span className="text-sm">{getSeverityIcon(event.severity)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{event.timestamp}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className={`p-4 rounded-lg border ${getSeverityColor(event.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{event.process}</h4>
                      <p className="text-sm text-foreground/80 mt-1">{event.action}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </div>
                  
                  {event.details && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length > maxVisible && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full mt-6 py-3 border border-dashed border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            Show {events.length - maxVisible} more events
          </span>
        </button>
      )}
    </div>
  )
}