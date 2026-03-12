// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { MITREProcessor } from './data-processor'
import { ProcessedData, MITREBundle } from './types'

interface MITREContextType {
  enterpriseData: ProcessedData | null
  icsData: ProcessedData | null
  mobileData: ProcessedData | null
  loading: boolean
  error: string | null
  activeDomain: 'enterprise' | 'ics' | 'mobile'
  setActiveDomain: (domain: 'enterprise' | 'ics' | 'mobile') => void
  refreshData: () => Promise<void>
}

const MITREContext = createContext<MITREContextType | undefined>(undefined)

export function MITREProvider({ children }: { children: React.ReactNode }) {
  const [enterpriseData, setEnterpriseData] = useState<ProcessedData | null>(null)
  const [icsData, setICSData] = useState<ProcessedData | null>(null)
  const [mobileData, setMobileData] = useState<ProcessedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDomain, setActiveDomain] = useState<'enterprise' | 'ics' | 'mobile'>('enterprise')

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all domains in parallel
      const [enterpriseRes, icsRes, mobileRes] = await Promise.allSettled([
        fetch('/data/mitre/enterprise-attack.json'),
        fetch('/data/mitre/ics-attack.json'),
        fetch('/data/mitre/mobile-attack.json')
      ])

      // Process enterprise data
      if (enterpriseRes.status === 'fulfilled' && enterpriseRes.value.ok) {
        const enterpriseJson: MITREBundle = await enterpriseRes.value.json()
        const processor = new MITREProcessor(enterpriseJson, 'enterprise')
        setEnterpriseData(processor.process())
      } else {
        console.warn('Failed to load enterprise data')
      }

      // Process ICS data
      if (icsRes.status === 'fulfilled' && icsRes.value.ok) {
        const icsJson: MITREBundle = await icsRes.value.json()
        const processor = new MITREProcessor(icsJson, 'ics')
        setICSData(processor.process())
      } else {
        console.warn('Failed to load ICS data')
      }

      // Process mobile data
      if (mobileRes.status === 'fulfilled' && mobileRes.value.ok) {
        const mobileJson: MITREBundle = await mobileRes.value.json()
        const processor = new MITREProcessor(mobileJson, 'mobile')
        setMobileData(processor.process())
      } else {
        console.warn('Failed to load mobile data')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MITRE data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <MITREContext.Provider value={{
      enterpriseData,
      icsData,
      mobileData,
      loading,
      error,
      activeDomain,
      setActiveDomain,
      refreshData: loadData
    }}>
      {children}
    </MITREContext.Provider>
  )
}

export function useMITRE() {
  const context = useContext(MITREContext)
  if (context === undefined) {
    throw new Error('useMITRE must be used within a MITREProvider')
  }
  return context
}

export function useActiveData() {
  const { enterpriseData, icsData, mobileData, activeDomain } = useMITRE()
  
  switch (activeDomain) {
    case 'enterprise':
      return enterpriseData
    case 'ics':
      return icsData
    case 'mobile':
      return mobileData
    default:
      return enterpriseData
  }
}