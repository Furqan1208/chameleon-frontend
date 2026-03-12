// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\DomainSelector.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Globe, Cpu, Smartphone } from 'lucide-react'
import { useMITRE } from './context'

const domains = [
  { id: 'enterprise', name: 'Enterprise', icon: Globe, color: 'from-blue-500 to-cyan-500' },
  { id: 'ics', name: 'ICS', icon: Cpu, color: 'from-green-500 to-emerald-500' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'from-purple-500 to-pink-500' }
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

  return (
    <div className="flex gap-3">
      {domains.map(({ id, name, icon: Icon, color }) => {
        const stats = getStats(id)
        const isActive = activeDomain === id

        return (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveDomain(id)}
            className={`relative flex-1 p-4 rounded-xl border-2 transition-all ${
              isActive
                ? `border-transparent bg-gradient-to-br ${color} text-white shadow-lg`
                : 'border-border/50 hover:border-primary/30 bg-muted/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isActive ? 'bg-white/20' : 'bg-muted/30'
              }`}>
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-muted-foreground'
                }`} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-foreground'
                }`}>
                  {name}
                </p>
                {stats && (
                  <p className={`text-xs ${
                    isActive ? 'text-white/80' : 'text-muted-foreground'
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