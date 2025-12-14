"use client"

import type React from "react"

import { useCallback } from "react"
import { Upload } from "lucide-react"

interface DropZoneProps {
  onFileDrop: (file: File) => void
  selectedFile: File | null
}

export function DropZone({ onFileDrop, selectedFile }: DropZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) onFileDrop(file)
    },
    [onFileDrop],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileDrop(file)
    },
    [onFileDrop],
  )

  if (selectedFile) return null

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="glass border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary hover:glow-green transition-all duration-300 cursor-pointer"
    >
      <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">Drop file here or click to browse</h3>
      <p className="text-muted-foreground mb-6">Supported: EXE, DLL, PDF, DOC, JS, VBS, JSON and more</p>
      <input type="file" id="file-upload" className="hidden" onChange={handleFileSelect} />
      <label
        htmlFor="file-upload"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
      >
        Select File
      </label>
    </div>
  )
}
