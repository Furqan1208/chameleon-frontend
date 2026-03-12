// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\analysis-types.ts
import type { Mitigation } from './types'

export interface SoftwareDetail extends Software {
  relationships: {
    usedBy: Group[]
    uses: Technique[]
    mitigations: Mitigation[]
    relatedSoftware: Software[]
  }
  techniques: {
    all: Technique[]
    byTactic: Map<string, Technique[]>
    count: number
  }
  firstSeen?: string
  lastSeen?: string
  labels?: string[]
  operatingSystem?: string[]
}

export interface GroupDetail extends Group {
  relationships: {
    uses: Technique[]
    usesSoftware: Software[]
    attributedTo: Campaign[]
    relatedGroups: Group[]
  }
  techniques: {
    all: Technique[]
    byTactic: Map<string, Technique[]>
    count: number
  }
  software: {
    all: Software[]
    malware: Software[]
    tools: Software[]
    count: number
  }
  firstSeen?: string
  lastSeen?: string
  region?: string
  regions?: string[]
  sectors?: string[]
}

export interface CampaignDetail extends Campaign {
  relationships: {
    attributedTo: Group[]
    uses: Technique[]
    usesSoftware: Software[]
  }
  techniques: {
    all: Technique[]
    byTactic: Map<string, Technique[]>
    count: number
  }
  software: {
    all: Software[]
    count: number
  }
  timeline?: {
    start: string
    end: string
    events: Array<{
      date: string
      description: string
    }>
  }
}

export interface RelationshipMap {
  source: string
  target: string
  type: string
  description?: string
}

export interface Technique {
  id: string
  name: string
  description: string
  external_id: string
  tactics: string[]
  platforms: string[]
  is_subtechnique: boolean
  parent_id?: string
  subtechniques: Technique[]
  detection?: string
  contributors?: string[]
  version?: string
  deprecated: boolean
  revoked: boolean
  created: string
  modified: string
  url: string
}

export interface Software {
  id: string
  name: string
  description: string
  aliases: string[]
  external_id: string
  url: string
  type: 'malware' | 'tool'
  platforms?: string[]
  labels?: string[]
}

export interface Group {
  id: string
  name: string
  description: string
  aliases: string[]
  external_id: string
  url: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  aliases: string[]
  external_id: string
  url: string
  first_seen?: string
  last_seen?: string
}