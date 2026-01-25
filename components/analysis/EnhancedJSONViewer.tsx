// D:\FYP\Chameleon Frontend\components\analysis\EnhancedJSONViewer.tsx
"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Search, Copy, Check } from "lucide-react"

interface EnhancedJSONViewerProps {
  data: any
  initialDepth?: number
  searchable?: boolean
  onCopy?: (value: string) => void
}

export default function EnhancedJSONViewer({ 
  data, 
  initialDepth = 0, 
  searchable = true,
  onCopy 
}: EnhancedJSONViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState(false)

  const renderValue = (value: any, key?: string, depth: number = 0, path: string = "") => {
    const currentPath = path ? `${path}.${key}` : key || ""
    
    if (value === null) {
      return <span className="text-gray-500 italic">null</span>
    }
    
    if (typeof value === "boolean") {
      return (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value.toString()}
        </span>
      )
    }
    
    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>
    }
    
    if (typeof value === "string") {
      // Check if it's a hash
      if (/^[a-fA-F0-9]{32,128}$/.test(value)) {
        return (
          <div className="group relative">
            <code className="text-purple-600 font-mono text-sm break-all">
              {value}
            </code>
            {onCopy && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(value)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        )
      }
      
      // Check if it's a path
      if (value.includes("\\") || value.includes("/")) {
        return <code className="text-gray-600 font-mono text-sm break-all">{value}</code>
      }
      
      // Regular string
      return <span className="text-green-600">"{value}"</span>
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500 italic">[]</span>
      }
      
      const isExpanded = expanded[currentPath] !== undefined ? expanded[currentPath] : depth < 2
      
      return (
        <div className="space-y-1">
          <button
            onClick={() => setExpanded(prev => ({ ...prev, [currentPath]: !isExpanded }))}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>[{value.length} items]</span>
          </button>
          
          {isExpanded && (
            <div className="ml-4 space-y-1 border-l border-gray-200 pl-4">
              {value.slice(0, 10).map((item, idx) => (
                <div key={idx} className="pt-1">
                  {renderValue(item, idx.toString(), depth + 1, currentPath)}
                </div>
              ))}
              {value.length > 10 && (
                <div className="text-sm text-gray-500 italic">
                  + {value.length - 10} more items
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
    
    if (typeof value === "object") {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return <span className="text-gray-500 italic">{"{}"}</span>
      }
      
      const isExpanded = expanded[currentPath] !== undefined ? expanded[currentPath] : depth < 1
      
      return (
        <div className="space-y-1">
          <button
            onClick={() => setExpanded(prev => ({ ...prev, [currentPath]: !isExpanded }))}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>{entries.length} properties</span>
          </button>
          
          {isExpanded && (
            <div className="ml-4 space-y-1 border-l border-gray-200 pl-4">
              {entries.map(([k, v]) => (
                <div key={k} className="pt-1">
                  <span className="text-blue-800 font-medium">{k}:</span>
                  <span className="ml-2">
                    {renderValue(v, k, depth + 1, currentPath)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    return <span>{String(value)}</span>
  }

  // Filter data based on search
  const filterData = (data: any, search: string): any => {
    if (!search) return data
    
    const lowerSearch = search.toLowerCase()
    
    if (typeof data === "string") {
      return data.toLowerCase().includes(lowerSearch) ? data : undefined
    }
    
    if (Array.isArray(data)) {
      const filtered = data.map(item => filterData(item, search)).filter(Boolean)
      return filtered.length > 0 ? filtered : undefined
    }
    
    if (typeof data === "object" && data !== null) {
      const filtered: any = {}
      Object.entries(data).forEach(([key, value]) => {
        const filteredValue = filterData(value, search)
        if (filteredValue !== undefined) {
          filtered[key] = filteredValue
        }
      })
      return Object.keys(filtered).length > 0 ? filtered : undefined
    }
    
    return data
  }

  const filteredData = searchable && search ? filterData(data, search) : data

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in JSON..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      )}
      
      <div className="font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[600px] overflow-auto">
        {filteredData === undefined ? (
          <div className="text-gray-500 italic">No results found</div>
        ) : (
          renderValue(filteredData, "", initialDepth)
        )}
      </div>
    </div>
  )
}