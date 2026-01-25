"use client"

interface CustomJSONViewerProps {
  data: any
  mode: "pretty" | "raw"
}

export default function CustomJSONViewer({ data, mode }: CustomJSONViewerProps) {
  if (mode === "raw") {
    return (
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[500px] overflow-y-auto bg-black/5 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }

  try {
    return (
      <div className="json-pretty-container">
        <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[500px] overflow-y-auto bg-black/5 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
        <style jsx global>{`
          .json-pretty-container pre {
            font-family: 'Geist Mono', monospace;
            font-size: 13px;
          }
          .json-pretty-container .string { color: #f1fa8c; }
          .json-pretty-container .number { color: #bd93f9; }
          .json-pretty-container .boolean { color: #ff79c6; }
          .json-pretty-container .null { color: #ff5555; }
          .json-pretty-container .key { color: #8be9fd; }
        `}</style>
      </div>
    )
  } catch {
    return (
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto bg-black/5 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }
}