"use client"

import { Loader, CheckCircle } from "lucide-react"

interface UploadProgressProps {
  progress: number
  stage: "idle" | "uploading" | "analyzing" | "complete"
  fileName: string
}

export function UploadProgress({ progress, stage, fileName }: UploadProgressProps) {
  const getStageText = () => {
    switch (stage) {
      case "uploading":
        return "Uploading file..."
      case "analyzing":
        return "Analyzing with CapeV2 and AI models..."
      case "complete":
        return "Analysis complete!"
      default:
        return "Preparing..."
    }
  }

  return (
    <div className="glass border border-border rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        {stage === "complete" ? (
          <CheckCircle className="w-8 h-8 text-primary" />
        ) : (
          <Loader className="w-8 h-8 text-primary animate-spin" />
        )}
        <div className="flex-1">
          <p className="text-foreground font-medium mb-1">{getStageText()}</p>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-right text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
    </div>
  )
}
