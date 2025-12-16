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
  // Clamp the score between 0 and maxScore
  const clampedScore = Math.max(0, Math.min(score, maxScore))
  
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
    sm: { width: 120, height: 120, fontSize: 'text-2xl' },
    md: { width: 180, height: 180, fontSize: 'text-3xl' },
    lg: { width: 240, height: 240, fontSize: 'text-4xl' }
  }

  // Calculate the circumference and dash offset for circular progress
  const radius = sizes[size].width / 2 - 20 // Adjust for stroke width and padding
  const circumference = 2 * Math.PI * radius
  const progressPercentage = clampedScore / maxScore
  const strokeDashoffset = circumference * (1 - progressPercentage)

  return (
    <div className="glass border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: sizes[size].width, height: sizes[size].height }}>
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" style={{ overflow: 'visible' }}>
            {/* Background track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              strokeWidth="8"
              stroke="#e5e7eb" // muted color
              fill="none"
              strokeLinecap="round"
            />
            {/* Progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              strokeWidth="8"
              stroke={getColor(clampedScore)}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`${sizes[size].fontSize} font-bold mb-1`} style={{ color: getColor(clampedScore) }}>
                {clampedScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">/ {maxScore}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div style={{ color: getColor(clampedScore) }}>
            {getIcon(clampedScore)}
          </div>
          <span className="font-medium" style={{ color: getColor(clampedScore) }}>
            {getLabel(clampedScore)} Risk
          </span>
        </div>
      </div>
    </div>
  )
}