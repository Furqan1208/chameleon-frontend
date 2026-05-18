"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/services/api/api.service"
import { isCompletedStatus, isPendingStatus, isFailedStatus } from "@/lib/analysis-status"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Loader,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Search,
  Filter,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  Database,
  Copy,
  Rocket,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [filteredReports, setFilteredReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [threatFilter, setThreatFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "threat" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  })

  useEffect(() => {
    loadReports()
  }, [])

  useEffect(() => {
    if (reports.length > 0) {
      // Apply filters and search
      let filtered = [...reports]
      
      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(report => 
          report.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.analysis_id?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter(report => {
          if (statusFilter === "completed") {
            return isCompletedStatus(report.status)
          }
          if (statusFilter === "processing") {
            return isPendingStatus(report.status)
          }
          if (statusFilter === "failed") {
            return isFailedStatus(report.status)
          }
          return false
        })
      }
      
      // Threat filter
      if (threatFilter !== "all") {
        filtered = filtered.filter(report => {
          const score = report.malscore || 0
          if (threatFilter === "high") return score >= 7
          if (threatFilter === "medium") return score >= 4 && score < 7
          if (threatFilter === "low") return score >= 1 && score < 4
          if (threatFilter === "unknown") return !report.malscore || report.malscore === 0
          return true
        })
      }
      
      // Sort
      filtered.sort((a, b) => {
        if (sortBy === "date") {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB
        }
        if (sortBy === "threat") {
          const scoreA = a.malscore || 0
          const scoreB = b.malscore || 0
          return sortOrder === "desc" ? scoreB - scoreA : scoreA - scoreB
        }
        if (sortBy === "name") {
          const nameA = a.filename || ""
          const nameB = b.filename || ""
          return sortOrder === "desc" 
            ? nameB.localeCompare(nameA) 
            : nameA.localeCompare(nameB)
        }
        return 0
      })
      
      setFilteredReports(filtered)
      
      // Calculate stats
      const newStats = {
        total: reports.length,
        completed: reports.filter(r => isCompletedStatus(r.status)).length,
        pending: reports.filter(r => isPendingStatus(r.status)).length,
        failed: reports.filter(r => isFailedStatus(r.status)).length,
        highRisk: reports.filter(r => (r.malscore || 0) >= 7).length,
        mediumRisk: reports.filter(r => (r.malscore || 0) >= 4 && (r.malscore || 0) < 7).length,
        lowRisk: reports.filter(r => (r.malscore || 0) >= 1 && (r.malscore || 0) < 4).length
      }
      setStats(newStats)
    }
  }, [reports, searchQuery, statusFilter, threatFilter, sortBy, sortOrder])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllReports()
      console.log("Loaded reports:", data)
      setReports(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadReports()
  }

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map(r => r.analysis_id))
    }
  }

  const handleSelectReport = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete ${selectedReports.length} selected reports?`)) {
      try {
        await Promise.all(selectedReports.map(id => apiService.deleteAnalysis(id)))
        await loadReports()
        setSelectedReports([])
      } catch (err) {
        console.error("Failed to delete reports:", err)
        alert("Failed to delete reports")
      }
    }
  }

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    alert("Analysis ID copied to clipboard!")
  }

  const handleViewReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/analysis/${id}`)
  }

  const handleOpenReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/analysis/${id}`)
  }

  const getThreatInfo = (score?: number) => {
    if (!score || score === 0) return { 
      label: "Unknown", 
      color: "text-gray-500", 
      bg: "bg-gray-500/10", 
      border: "border-gray-500/20",
      icon: HelpCircle
    }
    if (score >= 7) return { 
      label: "High Risk", 
      color: "text-red-500", 
      bg: "bg-red-500/10", 
      border: "border-red-500/20",
      icon: ShieldAlert
    }
    if (score >= 4) return { 
      label: "Medium Risk", 
      color: "text-yellow-500", 
      bg: "bg-yellow-500/10", 
      border: "border-yellow-500/20",
      icon: Shield
    }
    return { 
      label: "Low Risk", 
      color: "text-green-500", 
      bg: "bg-green-500/10", 
      border: "border-green-500/20",
      icon: ShieldCheck
    }
  }

  const getStatusInfo = (status?: string) => {
    if (isCompletedStatus(status)) {
      return { 
        label: "Completed", 
        color: "text-green-500", 
        bg: "bg-green-500/10", 
        border: "border-green-500/20",
        icon: CheckCircle,
        spin: false
      }
    }
    if (isPendingStatus(status)) {
      return { 
        label: "Processing", 
        color: "text-blue-500", 
        bg: "bg-blue-500/10", 
        border: "border-blue-500/20",
        icon: Loader,
        spin: true
      }
    }
    if (isFailedStatus(status)) {
      return { 
        label: "Failed", 
        color: "text-red-500", 
        bg: "bg-red-500/10", 
        border: "border-red-500/20",
        icon: AlertTriangle,
        spin: false
      }
    }
    return { 
      label: "Unknown", 
      color: "text-gray-500", 
      bg: "bg-gray-500/10", 
      border: "border-gray-500/20",
      icon: HelpCircle,
      spin: false
    }
  }

  return (
    <div className="relative min-h-full bg-[#131313]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/4 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card/50 p-6 shadow-2xl shadow-black/10 backdrop-blur-sm lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">Archive</p>
                <h1 className="text-3xl font-bold text-white">Analysis Reports</h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/65">
                  <Zap className="h-4 w-4 text-sky-400" />
                  Browse and manage your malware analysis reports
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="rounded-xl border border-border bg-white/[0.03] p-2 text-white/70 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              
              {selectedReports.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-red-300 transition-colors hover:bg-red-500/15"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedReports.length} Selected
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            <StatsCard
              icon={<Database className="w-4 h-4" />}
              label="Total"
              value={stats.total}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatsCard
              icon={<CheckCircle className="w-4 h-4" />}
              label="Completed"
              value={stats.completed}
              gradient="from-green-500 to-emerald-500"
            />
            <StatsCard
              icon={<Loader className="w-4 h-4" />}
              label="Processing"
              value={stats.pending}
              gradient="from-yellow-500 to-orange-500"
            />
            <StatsCard
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Failed"
              value={stats.failed}
              gradient="from-red-500 to-pink-500"
            />
            <StatsCard
              icon={<ShieldAlert className="w-4 h-4" />}
              label="High Risk"
              value={stats.highRisk}
              gradient="from-red-500 to-orange-500"
            />
            <StatsCard
              icon={<Shield className="w-4 h-4" />}
              label="Medium Risk"
              value={stats.mediumRisk}
              gradient="from-yellow-500 to-amber-500"
            />
            <StatsCard
              icon={<ShieldCheck className="w-4 h-4" />}
              label="Low Risk"
              value={stats.lowRisk}
              gradient="from-green-500 to-teal-500"
            />
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card/50 p-4 shadow-2xl shadow-black/10 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
                  <input
                    type="text"
                    placeholder="Search by filename or analysis ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-white/85 outline-none transition-all placeholder:text-white/35 focus:border-emerald-500/40"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-12 min-w-[132px] px-4 rounded-xl border transition-all inline-flex items-center justify-center gap-2 ${
                    showFilters 
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                      : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </motion.button>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "threat" | "name")}>
                  <SelectTrigger className="h-12 min-w-[168px] rounded-xl border-border bg-card px-4 text-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    <SelectItem value="date" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Sort by Date</SelectItem>
                    <SelectItem value="threat" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Sort by Threat</SelectItem>
                    <SelectItem value="name" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/80 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                  title={sortOrder === "desc" ? "Descending" : "Ascending"}
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </button>
              </div>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 border-t border-white/5 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Status
                      </label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-10 w-full rounded-lg border-border bg-card px-3 text-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card text-foreground">
                          <SelectItem value="all" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">All Status</SelectItem>
                          <SelectItem value="completed" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Completed</SelectItem>
                          <SelectItem value="processing" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Processing</SelectItem>
                          <SelectItem value="failed" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Threat Level
                      </label>
                      <Select value={threatFilter} onValueChange={setThreatFilter}>
                        <SelectTrigger className="h-10 w-full rounded-lg border-border bg-card px-3 text-foreground hover:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-primary/20">
                          <SelectValue placeholder="All Threats" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card text-foreground">
                          <SelectItem value="all" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">All Threats</SelectItem>
                          <SelectItem value="high" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">High Risk</SelectItem>
                          <SelectItem value="medium" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Medium Risk</SelectItem>
                          <SelectItem value="low" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Low Risk</SelectItem>
                          <SelectItem value="unknown" className="focus:bg-primary/20 focus:text-foreground data-[state=checked]:bg-primary/20 data-[state=checked]:text-foreground">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setStatusFilter("all")
                          setThreatFilter("all")
                          setSortBy("date")
                          setSortOrder("desc")
                        }}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/75 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <p className="text-sm text-white/65">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
            {filteredReports.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-emerald-400 transition-colors hover:text-emerald-300"
              >
                {selectedReports.length === filteredReports.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card/50 p-12 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-emerald-400" />
                  </div>
                </div>
                <p className="text-white/65">Loading reports...</p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div variants={itemVariants} className="rounded-3xl border border-red-500/20 bg-card/50 p-8 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">Failed to Load Reports</h3>
                  <p className="text-white/65">{error}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="ml-auto flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-black transition-colors hover:brightness-105"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredReports.length === 0 && (
            <motion.div variants={itemVariants} className="rounded-3xl border border-border bg-card/50 p-12 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                  <FileText className="h-10 w-10 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">No Reports Found</h3>
                <p className="mx-auto mb-6 max-w-md text-white/65">
                  {searchQuery || statusFilter !== "all" || threatFilter !== "all"
                    ? "No reports match your search criteria. Try adjusting your filters."
                    : "Start by uploading a file for analysis to see reports here."}
                </p>
                <div className="flex items-center justify-center gap-4">
                  {(searchQuery || statusFilter !== "all" || threatFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                        setThreatFilter("all")
                      }}
                      className="rounded-xl border border-white/10 px-6 py-3 text-white/75 transition-colors hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/dashboard/upload")}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition-all hover:brightness-105"
                  >
                    <Rocket className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reports Grid */}
          {!loading && !error && filteredReports.length > 0 && (
            <motion.div variants={containerVariants} className="space-y-4">
              <AnimatePresence>
                {filteredReports.map((report) => {
                  const threatInfo = getThreatInfo(report.malscore)
                  const statusInfo = getStatusInfo(report.status)
                  const ThreatIcon = threatInfo.icon
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <motion.div
                      key={report.analysis_id}
                      variants={cardVariants}
                      layout
                      className={`relative overflow-hidden rounded-3xl border border-border bg-card/50 transition-colors hover:border-emerald-500/25 ${
                        selectedReports.includes(report.analysis_id) 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Selection Checkbox */}
                          <div 
                            className="flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedReports.includes(report.analysis_id)}
                              onChange={(e) => handleSelectReport(report.analysis_id, e)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5 cursor-pointer rounded border-border bg-white/[0.03] checked:bg-emerald-500 focus:ring-emerald-500"
                            />
                          </div>

                          {/* File Icon - Made clickable */}
                          <motion.div 
                            className={`cursor-pointer rounded-xl p-3 transition-transform hover:scale-110 ${threatInfo.bg} ${threatInfo.border}`}
                            onClick={(e) => handleOpenReport(report.analysis_id, e)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Open report"
                          >
                            <FileText className={`w-5 h-5 ${threatInfo.color}`} />
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  {/* Filename - Made clickable */}
                                  <motion.h3 
                                    className="max-w-md cursor-pointer truncate text-lg font-semibold text-white transition-colors hover:text-emerald-300"
                                    onClick={(e) => handleOpenReport(report.analysis_id, e)}
                                    whileHover={{ x: 2 }}
                                    title="Open report"
                                  >
                                    {report.filename || "Unknown File"}
                                  </motion.h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${threatInfo.bg} ${threatInfo.color} ${threatInfo.border} flex items-center gap-1`}>
                                    <ThreatIcon className="w-3 h-3" />
                                    {threatInfo.label}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} flex items-center gap-1`}>
                                    <StatusIcon className={`w-3 h-3 ${statusInfo.spin ? 'animate-spin' : ''}`} />
                                    {statusInfo.label}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="mb-1 text-white/55">Analysis ID</p>
                                    <div className="flex items-center gap-2">
                                      <code className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-xs text-white/85">
                                        {report.analysis_id?.slice(0, 12)}...
                                      </code>
                                      <button
                                        onClick={(e) => handleCopyId(report.analysis_id, e)}
                                        className="rounded p-1 transition-colors hover:bg-white/[0.06]"
                                      >
                                        <Copy className="h-3 w-3 text-white/65" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="mb-1 text-white/55">Threat Score</p>
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                                        <div 
                                          className={`h-full ${
                                            (report.malscore || 0) >= 7 ? 'bg-red-500' :
                                            (report.malscore || 0) >= 4 ? 'bg-yellow-500' :
                                            (report.malscore || 0) > 0 ? 'bg-green-500' :
                                            'bg-gray-500'
                                          }`}
                                          style={{ width: `${Math.min((report.malscore || 0) * 10, 100)}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-sm text-white">
                                        {report.malscore ? `${report.malscore}/10` : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="mb-1 text-white/55">Created</p>
                                    <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-white/80">
                                      <Calendar className="h-3 w-3 text-sky-400" />
                                      <span>
                                        {report.created_at
                                          ? format(new Date(report.created_at), "MMM d, yyyy")
                                          : "Unknown"}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="mb-1 text-white/55">Time Ago</p>
                                    <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-white/80">
                                      <Clock className="h-3 w-3 text-violet-400" />
                                      <span>
                                        {report.created_at
                                          ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true })
                                          : "Unknown"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Analysis Type Badge */}
                                {report.analysis_type && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-white/55">Type:</span>
                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                                      {report.analysis_type}
                                    </span>
                                    {report.model_used && (
                                      <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-xs text-violet-300">
                                        {report.model_used}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* View Button - Only action button remaining */}
                              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewReport(report.analysis_id, e)
                                  }}
                                  className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300 transition-colors hover:bg-emerald-500/15"
                                  title="View Report"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>

                            {/* Threat Intel Sources */}
                            {report.threat_intel && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {report.threat_intel.malicious_sources?.map((source: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                                  >
                                    {source}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Helper Components
function StatsCard({ icon, label, value, gradient }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  gradient: string;
}) {
  const accentMap: Record<string, string> = {
    "from-blue-500 to-cyan-500": "text-sky-400 bg-sky-400/10",
    "from-green-500 to-emerald-500": "text-emerald-400 bg-emerald-400/10",
    "from-yellow-500 to-orange-500": "text-amber-400 bg-amber-400/10",
    "from-red-500 to-pink-500": "text-rose-400 bg-rose-400/10",
    "from-red-500 to-orange-500": "text-red-400 bg-red-400/10",
    "from-yellow-500 to-amber-500": "text-yellow-400 bg-yellow-400/10",
    "from-green-500 to-teal-500": "text-teal-400 bg-teal-400/10",
  }
  const accent = accentMap[gradient] ?? "text-primary bg-primary/10"

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-border bg-card/50 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${accent}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-white/55">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}