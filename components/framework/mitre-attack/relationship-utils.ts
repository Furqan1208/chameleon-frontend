// D:\FYP\Chameleon Frontend\components\framework\mitre-attack\relationship-utils.ts
import { Technique, Software, Group, Campaign, Relationship } from './types'

export class RelationshipProcessor {
  private techniques: Map<string, Technique>
  private software: Map<string, Software>
  private groups: Map<string, Group>
  private campaigns: Map<string, Campaign>
  private relationships: Relationship[]

  constructor(
    techniques: Technique[],
    software: Software[],
    groups: Group[],
    campaigns: Campaign[],
    relationships: Relationship[]
  ) {
    this.techniques = new Map(techniques.map(t => [t.id, t]))
    this.software = new Map(software.map(s => [s.id, s]))
    this.groups = new Map(groups.map(g => [g.id, g]))
    this.campaigns = new Map(campaigns.map(c => [c.id, c]))
    this.relationships = relationships
  }

  getSoftwareRelationships(softwareId: string): {
    usedBy: Group[]
    uses: Technique[]
    mitigations: Technique[]
    relatedSoftware: Software[]
  } {
    const usedBy: Group[] = []
    const uses: Technique[] = []
    const mitigations: Technique[] = []
    const relatedSoftware: Software[] = []

    this.relationships.forEach(rel => {
      if (rel.source_ref === softwareId) {
        // This software uses something
        if (rel.relationship_type === 'uses') {
          const technique = this.techniques.get(rel.target_ref)
          if (technique) uses.push(technique)
        }
      } else if (rel.target_ref === softwareId) {
        // Something uses this software
        if (rel.relationship_type === 'uses') {
          const group = this.groups.get(rel.source_ref)
          if (group) usedBy.push(group)
          
          const software = this.software.get(rel.source_ref)
          if (software && software.id !== softwareId) relatedSoftware.push(software)
        } else if (rel.relationship_type === 'mitigates') {
          const mitigation = this.techniques.get(rel.source_ref)
          if (mitigation) mitigations.push(mitigation)
        }
      }
    })

    return { usedBy, uses, mitigations, relatedSoftware }
  }

  getGroupRelationships(groupId: string): {
    uses: Technique[]
    usesSoftware: Software[]
    attributedTo: Campaign[]
    relatedGroups: Group[]
  } {
    const uses: Technique[] = []
    const usesSoftware: Software[] = []
    const attributedTo: Campaign[] = []
    const relatedGroups: Group[] = []

    this.relationships.forEach(rel => {
      if (rel.source_ref === groupId) {
        // This group uses something
        if (rel.relationship_type === 'uses') {
          const technique = this.techniques.get(rel.target_ref)
          if (technique) uses.push(technique)
          
          const software = this.software.get(rel.target_ref)
          if (software) usesSoftware.push(software)
        }
      } else if (rel.target_ref === groupId) {
        // Something targets this group
        if (rel.relationship_type === 'attributed-to') {
          const campaign = this.campaigns.get(rel.source_ref)
          if (campaign) attributedTo.push(campaign)
        }
        
        const group = this.groups.get(rel.source_ref)
        if (group && group.id !== groupId) relatedGroups.push(group)
      }
    })

    return { uses, usesSoftware, attributedTo, relatedGroups }
  }

  getCampaignRelationships(campaignId: string): {
    attributedTo: Group[]
    uses: Technique[]
    usesSoftware: Software[]
  } {
    const attributedTo: Group[] = []
    const uses: Technique[] = []
    const usesSoftware: Software[] = []

    this.relationships.forEach(rel => {
      if (rel.source_ref === campaignId) {
        // This campaign uses something
        if (rel.relationship_type === 'uses') {
          const technique = this.techniques.get(rel.target_ref)
          if (technique) uses.push(technique)
          
          const software = this.software.get(rel.target_ref)
          if (software) usesSoftware.push(software)
        }
      } else if (rel.target_ref === campaignId) {
        // Something attributes to this campaign
        if (rel.relationship_type === 'attributed-to') {
          const group = this.groups.get(rel.source_ref)
          if (group) attributedTo.push(group)
        }
      }
    })

    return { attributedTo, uses, usesSoftware }
  }

  getTechniquesByTactic(techniques: Technique[]): Map<string, Technique[]> {
    const byTactic = new Map<string, Technique[]>()
    
    techniques.forEach(tech => {
      tech.tactics.forEach(tactic => {
        if (!byTactic.has(tactic)) {
          byTactic.set(tactic, [])
        }
        byTactic.get(tactic)!.push(tech)
      })
    })
    
    return byTactic
  }
}