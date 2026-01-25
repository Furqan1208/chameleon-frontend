"use client"

import { File, Hash, Activity, FileSignature, Type, Clock } from "lucide-react"
import { ThreatGauge } from "@/components/charts/ThreatGauge"
import SimpleAnalysisOverview from "./SimpleAnalysisOverview"
import { 
  getSignaturesCount, 
  getProcessCount, 
  getStringsCount, 
  getAnalysisDuration 
} from "./utils"

interface AnalysisOverviewProps {
  combinedAnalysis: any
  fileHashes: any
  malscore: number
  capeData: any
  parsedData: any
  aiData: any
}

export default function AnalysisOverview({
  combinedAnalysis,
  fileHashes,
  malscore,
  capeData,
  parsedData,
  aiData
}: AnalysisOverviewProps) {
  const signaturesCount = getSignaturesCount(capeData)
  const processCount = getProcessCount(capeData)
  const stringsCount = getStringsCount(parsedData)
  const analysisDuration = getAnalysisDuration(capeData)

  return (
    <>
      {/* File Information */}
      {fileHashes && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <File className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">File Information</h2>
              <p className="text-sm text-muted-foreground">Sample details and cryptographic hashes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Basics */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Filename</p>
                <p className="text-foreground font-mono text-sm break-all">{fileHashes.filename}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Type</p>
                <p className="text-foreground text-sm">{fileHashes.file_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Size</p>
                <p className="text-foreground font-mono text-sm">
                  {(fileHashes.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Hashes */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> MD5
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono text-xs break-all flex-1 bg-primary/5 p-2 rounded">
                    {fileHashes.md5}
                  </code>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> SHA256
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-primary font-mono text-xs break-all flex-1 bg-primary/5 p-2 rounded">
                    {fileHashes.sha256}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Analysis Overview */}
      <SimpleAnalysisOverview analysis={combinedAnalysis} />

      {/* Threat Gauge & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ThreatGauge
            score={malscore}
            title="Threat Score"
            size="md"
          />
        </div>
        <div className="lg:col-span-2">
          <div className="glass border border-border rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-blue-500/20 bg-blue-500/5 rounded-lg p-3 hover:scale-[1.02] transition-transform text-blue-500">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Processes</span>
                </div>
                <div className="text-xl font-bold mt-1.5 text-blue-500">{processCount}</div>
              </div>

              <div className="border border-pink-500/20 bg-pink-500/5 rounded-lg p-3 hover:scale-[1.02] transition-transform text-pink-500">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-pink-500/10">
                    <FileSignature className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Signatures</span>
                </div>
                <div className="text-xl font-bold mt-1.5 text-pink-500">{signaturesCount}</div>
              </div>

              <div className="border border-primary/20 bg-primary/5 rounded-lg p-3 hover:scale-[1.02] transition-transform text-primary">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Type className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Strings</span>
                </div>
                <div className="text-xl font-bold mt-1.5 text-primary">
                  {stringsCount.toLocaleString()}
                </div>
              </div>

              <div className="border border-accent/20 bg-accent/5 rounded-lg p-3 hover:scale-[1.02] transition-transform text-accent">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-accent/10">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">Duration</span>
                </div>
                <div className="text-xl font-bold mt-1.5 text-accent">
                  {analysisDuration || `${aiData?.duration_seconds?.toFixed(1)}s` || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}