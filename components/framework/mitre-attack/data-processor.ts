// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\data-processor.ts
import { 
  MITREBundle, MITREObject, ProcessedData, DomainStats,
  Tactic, Technique, Mitigation, Group, Software, 
  DataSource, DataComponent, Campaign, Relationship
} from './types'

// Tactic order based on MITRE ATT&CK matrix
const TACTIC_ORDER = [
  "reconnaissance",
  "resource-development",
  "initial-access",
  "execution",
  "persistence",
  "privilege-escalation",
  "defense-evasion",
  "credential-access",
  "discovery",
  "lateral-movement",
  "collection",
  "command-and-control",
  "exfiltration",
  "impact"
]

// helper used by processor to tally techniques per tactic
export class MITREProcessor {
  private bundle: MITREBundle
  private domain: string

  constructor(bundle: MITREBundle, domain: string) {
    this.bundle = bundle
    this.domain = domain
  }

  process(): ProcessedData {
    const objects = this.bundle.objects

    // Process all object types
    let tactics = this.processTactics(objects)
    const techniques = this.processTechniques(objects)
    const mitigations = this.processMitigations(objects)
    const groups = this.processGroups(objects)
    const malware = this.processMalware(objects)
    const tools = this.processTools(objects)
    const dataSources = this.processDataSources(objects)
    const campaigns = this.processCampaigns(objects)
    const relationships = this.processRelationships(objects)

    // Update tactic counts based on techniques
    tactics = getTacticCounts(techniques, tactics)

    // Calculate stats
    const stats: DomainStats = {
      tactics: tactics.length,
      techniques: techniques.length,
      subtechniques: techniques.reduce((acc, t) => acc + t.subtechniques.length, 0),
      mitigations: mitigations.length,
      groups: groups.length,
      malware: malware.length,
      tools: tools.length,
      dataSources: dataSources.length,
      dataComponents: dataSources.reduce((acc, ds) => acc + (ds.components?.length || 0), 0),
      campaigns: campaigns.length,
      relationships: relationships.length
    }

    return {
      domain: this.domain,
      tactics,
      techniques,
      mitigations,
      groups,
      malware,
      tools,
      dataSources,
      campaigns,
      relationships,
      stats
    }
  }

  private processTactics(objects: MITREObject[]): Tactic[] {
    const tacticObjects = objects.filter(obj => obj.type === 'x-mitre-tactic')
    
    return tacticObjects.map(tactic => {
      const externalId = tactic.external_references?.find(ref => ref.source_name === 'mitre-attack')?.external_id || ''
      const shortname = tactic.x_mitre_shortname || ''
      return {
        id: tactic.id,
        name: tactic.name || 'Unknown Tactic',
        description: tactic.description || '',
        shortname: shortname,
        external_id: externalId,
        technique_count: 0,
        order: TACTIC_ORDER.indexOf(shortname)
      }
    }).sort((a, b) => {
      if (a.order !== -1 && b.order !== -1) return a.order - b.order
      if (a.order !== -1) return -1
      if (b.order !== -1) return 1
      return a.external_id.localeCompare(b.external_id)
    })
  }

  private processTechniques(objects: MITREObject[]): Technique[] {
    const techniqueObjects = objects.filter(obj => obj.type === 'attack-pattern')
    
    // Track unique techniques by external_id to avoid duplicates
    const uniqueTechniques = new Map<string, Technique>()
    const subtechniqueMap = new Map<string, Technique[]>()

    techniqueObjects.forEach(tech => {
      const externalId = tech.external_references?.find(ref => ref.source_name === 'mitre-attack')?.external_id || ''
      if (!externalId) return
      
      // Check for duplicates
      if (uniqueTechniques.has(externalId)) {
        const existing = uniqueTechniques.get(externalId)!
        if (new Date(tech.modified) > new Date(existing.modified)) {
          uniqueTechniques.delete(externalId)
        } else {
          return
        }
      }

      const tacticNames = tech.kill_chain_phases
        ?.filter(phase => phase.kill_chain_name === 'mitre-attack')
        .map(phase => phase.phase_name) || []

      const technique: Technique = {
        id: tech.id,
        name: tech.name || 'Unknown Technique',
        description: tech.description || '',
        external_id: externalId,
        tactics: tacticNames,
        platforms: tech.x_mitre_platforms || [],
        is_subtechnique: tech.x_mitre_is_subtechnique || false,
        subtechniques: [],
        detection: tech.x_mitre_detection,
        contributors: tech.x_mitre_contributors,
        version: tech.x_mitre_version,
        deprecated: tech.x_mitre_deprecated || false,
        revoked: tech.revoked || false,
        created: tech.created,
        modified: tech.modified,
        url: `https://attack.mitre.org/techniques/${externalId.replace(/\./g, '/')}`
      }

      uniqueTechniques.set(externalId, technique)

      if (tech.x_mitre_is_subtechnique) {
        const parentId = externalId.split('.')[0]
        if (!subtechniqueMap.has(parentId)) {
          subtechniqueMap.set(parentId, [])
        }
        subtechniqueMap.get(parentId)!.push(technique)
      }
    })

    // Build hierarchy
    const mainTechniques: Technique[] = []
    uniqueTechniques.forEach((technique, externalId) => {
      if (!technique.is_subtechnique) {
        technique.subtechniques = (subtechniqueMap.get(externalId) || [])
          .sort((a, b) => a.external_id.localeCompare(b.external_id))
        mainTechniques.push(technique)
      }
    })

    return mainTechniques.sort((a, b) => a.external_id.localeCompare(b.external_id))
  }

  private processMitigations(objects: MITREObject[]): Mitigation[] {
    return objects
      .filter(obj => obj.type === 'course-of-action')
      .map(obj => {
        const externalRef = obj.external_references?.find(ref => ref.source_name === 'mitre-attack')
        return {
          id: obj.id,
          name: obj.name || 'Unknown Mitigation',
          description: obj.description || '',
          external_id: externalRef?.external_id || '',
          url: externalRef?.url || `https://attack.mitre.org/mitigations/${externalRef?.external_id}`,
          deprecated: obj.x_mitre_deprecated || false
        }
      })
  }

  private processGroups(objects: MITREObject[]): Group[] {
    return objects
      .filter(obj => obj.type === 'intrusion-set')
      .map(obj => {
        const externalRef = obj.external_references?.find(ref => ref.source_name === 'mitre-attack')
        return {
          id: obj.id,
          name: obj.name || 'Unknown Group',
          description: obj.description || '',
          aliases: obj.aliases || [],
          external_id: externalRef?.external_id || '',
          url: externalRef?.url || `https://attack.mitre.org/groups/${externalRef?.external_id}`
        }
      })
  }

  private processMalware(objects: MITREObject[]): Software[] {
    return objects
      .filter(obj => obj.type === 'malware')
      .map(obj => {
        const externalRef = obj.external_references?.find(ref => ref.source_name === 'mitre-attack')
        return {
          id: obj.id,
          name: obj.name || 'Unknown Malware',
          description: obj.description || '',
          aliases: obj.x_mitre_aliases || [],
          external_id: externalRef?.external_id || '',
          url: externalRef?.url || `https://attack.mitre.org/software/${externalRef?.external_id}`,
          type: 'malware',
          platforms: obj.x_mitre_platforms
        }
      })
  }

  private processTools(objects: MITREObject[]): Software[] {
    return objects
      .filter(obj => obj.type === 'tool')
      .map(obj => {
        const externalRef = obj.external_references?.find(ref => ref.source_name === 'mitre-attack')
        return {
          id: obj.id,
          name: obj.name || 'Unknown Tool',
          description: obj.description || '',
          aliases: obj.x_mitre_aliases || [],
          external_id: externalRef?.external_id || '',
          url: externalRef?.url || `https://attack.mitre.org/software/${externalRef?.external_id}`,
          type: 'tool',
          platforms: obj.x_mitre_platforms
        }
      })
  }

  private processDataSources(objects: MITREObject[]): DataSource[] {
    const dataSources = objects.filter(obj => obj.type === 'x-mitre-data-source')
    const dataComponents = objects.filter(obj => obj.type === 'x-mitre-data-component')

    return dataSources.map(ds => {
      const externalRef = ds.external_references?.find(ref => ref.source_name === 'mitre-attack')
      const components = dataComponents
        .filter(dc => dc.x_mitre_data_source_ref === ds.id)
        .map(dc => {
          const compRef = dc.external_references?.find(ref => ref.source_name === 'mitre-attack')
          return {
            id: dc.id,
            name: dc.name || 'Unknown Component',
            description: dc.description || '',
            external_id: compRef?.external_id || '',
            data_source_ref: ds.id
          }
        })

      return {
        id: ds.id,
        name: ds.name || 'Unknown Data Source',
        description: ds.description || '',
        external_id: externalRef?.external_id || '',
        url: externalRef?.url || '',
        components
      }
    })
  }

  private processCampaigns(objects: MITREObject[]): Campaign[] {
    return objects
      .filter(obj => obj.type === 'campaign')
      .map(obj => {
        const externalRef = obj.external_references?.find(ref => ref.source_name === 'mitre-attack')
        return {
          id: obj.id,
          name: obj.name || 'Unknown Campaign',
          description: obj.description || '',
          aliases: obj.aliases || [],
          external_id: externalRef?.external_id || '',
          url: externalRef?.url || `https://attack.mitre.org/campaigns/${externalRef?.external_id}`,
          first_seen: obj.first_seen,
          last_seen: obj.last_seen
        }
      })
  }

  private processRelationships(objects: MITREObject[]): Relationship[] {
    return objects
      .filter(obj => obj.type === 'relationship')
      .map(obj => ({
        id: obj.id,
        relationship_type: obj.relationship_type || '',
        source_ref: obj.source_ref || '',
        target_ref: obj.target_ref || '',
        description: obj.description
      }))
  }
}

export function getTacticCounts(techniques: Technique[], tactics: Tactic[]): Tactic[] {
  const tacticMap = new Map(tactics.map(t => [t.shortname, t]))
  
  techniques.forEach(tech => {
    tech.tactics.forEach(tacticName => {
      const tactic = tacticMap.get(tacticName)
      if (tactic) {
        tactic.technique_count++
      }
    })
  })

  return tactics
}