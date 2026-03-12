// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\types.ts
export interface MITREObject {
  type: string
  id: string
  created: string
  created_by_ref?: string
  modified: string
  name?: string
  description?: string
  external_references?: Array<{
    source_name: string
    external_id?: string
    url?: string
  }>
  kill_chain_phases?: Array<{
    kill_chain_name: string
    phase_name: string
  }>
  x_mitre_platforms?: string[]
  x_mitre_domains?: string[]
  x_mitre_is_subtechnique?: boolean
  x_mitre_deprecated?: boolean
  x_mitre_version?: string
  x_mitre_contributors?: string[]
  x_mitre_detection?: string
  x_mitre_remote_support?: boolean
  x_mitre_modified_by_ref?: string
  x_mitre_attack_spec_version?: string
  tactic_refs?: string[]
  aliases?: string[]
  // additional optional properties used in data processing
  x_mitre_aliases?: string[]
  x_mitre_data_source_ref?: string
  relationship_type?: string
  source_ref?: string
  target_ref?: string
  first_seen?: string
  last_seen?: string
  x_mitre_shortname?: string
  revoked?: boolean
  labels?: string[]
}

export interface MITREBundle {
  type: string
  id: string
  objects: MITREObject[]
  spec_version: string
}

export interface Tactic {
  id: string
  name: string
  description: string
  shortname: string
  external_id: string
  technique_count: number
  order: number
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

export interface Mitigation {
  id: string
  name: string
  description: string
  external_id: string
  url: string
  deprecated: boolean
}

export interface Group {
  id: string
  name: string
  description: string
  aliases: string[]
  external_id: string
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
}

export interface DataSource {
  id: string
  name: string
  description: string
  external_id: string
  url: string
  components?: DataComponent[]
}

export interface DataComponent {
  id: string
  name: string
  description: string
  external_id: string
  data_source_ref?: string
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

export interface Relationship {
  id: string
  relationship_type: string
  source_ref: string
  target_ref: string
  description?: string
}

export interface DomainStats {
  tactics: number
  techniques: number
  subtechniques: number
  mitigations: number
  groups: number
  malware: number
  tools: number
  dataSources: number
  dataComponents: number
  campaigns: number
  relationships: number
}

export interface ProcessedData {
  domain: string
  tactics: Tactic[]
  techniques: Technique[]
  mitigations: Mitigation[]
  groups: Group[]
  malware: Software[]
  tools: Software[]
  dataSources: DataSource[]
  campaigns: Campaign[]
  relationships: Relationship[]
  stats: DomainStats
}