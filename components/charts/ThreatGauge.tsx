// components/charts/ThreatGauge.tsx
"use client"

import { AlertTriangle, Shield, CheckCircle } from 'lucide-react'

interface ThreatGaugeProps {
  score: number
  maxScore?: number
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ThreatGauge({ score, maxScore = 10, title = "Threat Level", size = 'md' }: ThreatGaugeProps) {
  const getColor = (value: number) => {
    if (value >= 7) return '#ff4444' // red
    if (value >= 4) return '#ffaa00' // orange
    return '#00ff88' // green
  }

  const getLabel = (value: number) => {
    if (value >= 7) return 'High'
    if (value >= 4) return 'Medium'
    return 'Low'
  }

  const getIcon = (value: number) => {
    if (value >= 7) return <AlertTriangle className="w-5 h-5" />
    if (value >= 4) return <Shield className="w-5 h-5" />
    return <CheckCircle className="w-5 h-5" />
  }

  const sizes = {
    sm: { width: 120, height: 120 },
    md: { width: 180, height: 180 },
    lg: { width: 240, height: 240 }
  }

  return (
    <div className="glass border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Circular Progress */}
          <div 
            className="rounded-full border-8 border-muted"
            style={{
              width: sizes[size].width,
              height: sizes[size].height,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-2xl'} font-bold mb-1`} style={{ color: getColor(score) }}>
                  {score.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">/ {maxScore}</div>
              </div>
            </div>
            
            {/* Progress arc */}
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  strokeWidth="8"
                  stroke={getColor(score)}
                  strokeDasharray={`${(score / maxScore) * 283} 283`}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="text-foreground" style={{ color: getColor(score) }}>
            {getIcon(score)}
          </div>
          <span className="font-medium" style={{ color: getColor(score) }}>
            {getLabel(score)} Risk
          </span>
        </div>
      </div>
    </div>
  )
}