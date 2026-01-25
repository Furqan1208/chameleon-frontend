"use client"

import { useState, useMemo } from "react"
import {
  FileJson,
  Shield,
  AlertTriangle,
  File,
  Activity,
  Globe,
  HardDrive,
  BarChart3,
  FileCode,
  Type,
  FileText,
  Code,
  Copy
} from "lucide-react"
import CustomJSONViewer from "./CustomJSONViewer"

interface CapeReportViewerProps {
  capeData: any
  loading: boolean
  onCopyJson: () => void
  copied: boolean
}

export default function CapeReportViewer({ 
  capeData, 
  loading, 
  onCopyJson, 
  copied 
}: CapeReportViewerProps) {
  const [activeSection, setActiveSection] = useState<string>("overview")

  const sections = useMemo(() => {
    if (!capeData || typeof capeData !== 'object') return []

    const allSections = Object.entries(capeData).map(([key, value]) => {
      let icon = <File className="w-4 h-4" />
      let description = ""

      switch (key) {
        case 'malscore':
          icon = <Shield className="w-4 h-4" />
          description = "Overall threat score"
          break
        case 'malstatus':
          icon = <AlertTriangle className="w-4 h-4" />
          description = "Malware status classification"
          break
        case 'file':
          icon = <File className="w-4 h-4" />
          description = "File information and metadata"
          break
        case 'behavior':
          icon = <Activity className="w-4 h-4" />
          description = "Behavior analysis results"
          break
        case 'signatures':
          icon = <FileText className="w-4 h-4" />
          description = "Detection signatures"
          break
        case 'network':
          icon = <Globe className="w-4 h-4" />
          description = "Network activity"
          break
        case 'memory':
          icon = <HardDrive className="w-4 h-4" />
          description = "Memory analysis"
          break
        case 'target':
          icon = <Shield className="w-4 h-4" />
          description = "Target information"
          break
        case 'statistics':
          icon = <BarChart3 className="w-4 h-4" />
          description = "Analysis statistics"
          break
        case 'ttps':
          icon = <FileCode className="w-4 h-4" />
          description = "MITRE ATT&CK Techniques"
          break
        case 'strings':
          icon = <Type className="w-4 h-4" />
          description = "Extracted strings"
          break
        case 'info':
          icon = <FileText className="w-4 h-4" />
          description = "Analysis information"
          break
        default:
          icon = <Code className="w-4 h-4" />
          description = "Additional data"
      }

      return { key, icon, description, value }
    })

    const orderedSections = []
    const malscoreSection = allSections.find(s => s.key === 'malscore')
    const malstatusSection = allSections.find(s => s.key === 'malstatus')
    const otherSections = allSections.filter(s => 
      s.key !== 'malscore' && s.key !== 'malstatus'
    )

    if (malscoreSection) orderedSections.push(malscoreSection)
    if (malstatusSection) orderedSections.push(malstatusSection)
    orderedSections.push(...otherSections)

    return orderedSections
  }, [capeData])

  if (!capeData || sections.length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No CAPE data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section selector */}
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select Section</h3>
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeSection === section.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/20 text-muted-foreground border border-border'
              }`}
            >
              {section.icon}
              <span className="font-medium capitalize">
                {section.key.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active section content */}
      <div className="glass border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            {sections.find(s => s.key === activeSection)?.icon || <FileJson className="w-6 h-6 text-blue-500" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground capitalize">
              {activeSection.replace(/_/g, ' ')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {sections.find(s => s.key === activeSection)?.description}
            </p>
          </div>
        </div>

        {activeSection === 'malscore' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <div className="relative">
                <div className="text-center">
                  <div className="text-6xl font-bold text-foreground mb-2">
                    {capeData.malscore?.toFixed(1) || 0}
                  </div>
                  <div className="text-lg text-muted-foreground">out of 10</div>
                </div>
                
                {capeData.malstatus && (
                  <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    capeData.malstatus.toLowerCase() === 'malicious' 
                      ? 'bg-destructive/20 text-destructive' 
                      : capeData.malstatus.toLowerCase() === 'suspicious'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    Status: {capeData.malstatus}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-foreground mb-2">What this score means:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    capeData.malscore >= 7 ? 'bg-destructive' : 
                    capeData.malscore >= 4 ? 'bg-accent' : 'bg-primary'
                  }`}></div>
                  <span>
                    {capeData.malscore >= 7 ? 'High Risk (7.0-10.0): Likely malicious' : 
                     capeData.malscore >= 4 ? 'Medium Risk (4.0-6.9): Suspicious activity' : 
                     'Low Risk (0.0-3.9): Probably benign'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <CustomJSONViewer 
              data={sections.find(s => s.key === activeSection)?.value} 
              mode="raw" 
            />
          </div>
        )}
      </div>
    </div>
  )
}