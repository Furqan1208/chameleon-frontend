// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\StatsOverview.tsx
import React from 'react'
import { motion } from 'framer-motion'
import {
  Layers, Target, ChevronRight, Cpu, Shield,
  Users, Bug, Wrench, Database, GitBranch,
  Calendar, Hash, AlertTriangle, CheckCircle,
  XCircle, Activity
} from 'lucide-react'
import { useActiveData } from './context'
import { DomainStats, Technique } from './types'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  tooltip?: string
}

function StatCard({ label, value, icon, color, tooltip }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass border border-border/50 rounded-lg p-4 backdrop-blur-xl relative group`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
      </div>
      {tooltip && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {tooltip}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-background border-r border-b border-border" />
        </div>
      )}
    </motion.div>
  )
}

export function StatsOverview() {
  const data = useActiveData()

  if (!data) return null

  const { stats } = data

  const statGroups = [
    {
      title: 'Core Framework',
      stats: [
        { label: 'Tactics', value: stats.tactics, icon: <Layers className="w-5 h-5 text-blue-500" />, color: 'from-blue-500 to-cyan-500' },
        { label: 'Techniques', value: stats.techniques, icon: <Target className="w-5 h-5 text-purple-500" />, color: 'from-purple-500 to-pink-500' },
        { label: 'Sub-techniques', value: stats.subtechniques, icon: <ChevronRight className="w-5 h-5 text-indigo-500" />, color: 'from-indigo-500 to-purple-500' },
        { label: 'Platforms', value: data.techniques.reduce((acc, t) => acc + t.platforms.length, 0), icon: <Cpu className="w-5 h-5 text-green-500" />, color: 'from-green-500 to-emerald-500' }
      ]
    },
    {
      title: 'Defenses',
      stats: [
        { label: 'Mitigations', value: stats.mitigations, icon: <Shield className="w-5 h-5 text-amber-500" />, color: 'from-amber-500 to-orange-500' },
        { label: 'Data Sources', value: stats.dataSources, icon: <Database className="w-5 h-5 text-teal-500" />, color: 'from-teal-500 to-cyan-500' },
        { label: 'Data Components', value: stats.dataComponents, icon: <GitBranch className="w-5 h-5 text-emerald-500" />, color: 'from-emerald-500 to-green-500' }
      ]
    },
    {
      title: 'Threat Intelligence',
      stats: [
        { label: 'Groups', value: stats.groups, icon: <Users className="w-5 h-5 text-red-500" />, color: 'from-red-500 to-rose-500' },
        { label: 'Malware', value: stats.malware, icon: <Bug className="w-5 h-5 text-orange-500" />, color: 'from-orange-500 to-amber-500' },
        { label: 'Tools', value: stats.tools, icon: <Wrench className="w-5 h-5 text-yellow-500" />, color: 'from-yellow-500 to-amber-500' },
        { label: 'Campaigns', value: stats.campaigns, icon: <Activity className="w-5 h-5 text-rose-500" />, color: 'from-rose-500 to-pink-500' }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {statGroups.map((group, idx) => (
        <div key={idx}>
          <h3 className="text-sm font-medium text-foreground mb-3">{group.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {group.stats.map((stat, statIdx) => (
              <StatCard key={statIdx} {...stat} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Hash className="w-4 h-4" />
            Version: {data.techniques[0]?.version || 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Last Updated: {new Date(data.techniques[0]?.modified || '').toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-green-500">
            <CheckCircle className="w-4 h-4" />
            Active: {data.techniques.filter((t: Technique) => !t.deprecated && !t.revoked).length}
          </span>
          <span className="flex items-center gap-1 text-yellow-500">
            <AlertTriangle className="w-4 h-4" />
            Deprecated: {data.techniques.filter((t: Technique) => t.deprecated).length}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <XCircle className="w-4 h-4" />
            Revoked: {data.techniques.filter((t: Technique) => t.revoked).length}
          </span>
        </div>
      </div>
    </div>
  )
}