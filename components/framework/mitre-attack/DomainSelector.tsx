// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\DomainSelector.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Globe, Cpu, Smartphone } from 'lucide-react'
import { useMITRE } from './context'

const domains = [
  { id: 'enterprise', name: 'Enterprise', icon: Globe, color: 'sky-300', bgColor: 'from-sky-500/10 to-cyan-500/10' },
  { id: 'ics', name: 'ICS', icon: Cpu, color: 'emerald-300', bgColor: 'from-emerald-500/10 to-green-500/10' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'violet-300', bgColor: 'from-violet-500/10 to-purple-500/10' }
] as const

export function DomainSelector() {
  const { activeDomain, setActiveDomain, enterpriseData, icsData, mobileData } = useMITRE()

  const getStats = (domain: typeof activeDomain) => {
    switch (domain) {
      case 'enterprise':
        return enterpriseData?.stats
      case 'ics':
        return icsData?.stats
      case 'mobile':
        return mobileData?.stats
    }
  }

  const getIconColor = (domainId: string) => {
    switch (domainId) {
      case 'enterprise':
        return 'text-sky-300'
      case 'ics':
        return 'text-emerald-300'
      case 'mobile':
        return 'text-violet-300'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex gap-3">
      {domains.map(({ id, name, icon: Icon, bgColor }) => {
        const stats = getStats(id)
        const isActive = activeDomain === id

        return (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveDomain(id)}
            className={`relative flex-1 p-4 rounded-lg border transition-all ${
              isActive
                ? `border-primary bg-[#0d0d0d] ring-2 ring-primary`
                : `border-[#1a1a1a] bg-[#0d0d0d] hover:bg-[#141a21] hover:border-[#2a2a2a]`
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${bgColor}`}>
                <Icon className={getIconColor(id)} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-foreground'
                }`}>
                  {name}
                </p>
                {stats && (
                  <p className={`text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {stats.techniques} techniques
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}