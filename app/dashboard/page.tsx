// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { motion } from "framer-motion"
import { 
  Zap, 
  Shield, 
  Cpu, 
  Globe, 
  AlertTriangle, 
  FileText,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Rocket,
  Gauge,
  Radar,
  Bot,
  Atom,
  Binary,
  Code,
  Cloud,
  Database,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  Github,
  Twitter,
  Mail,
  Star,
  GitBranch,
  Users,
  Award,
  Layers,
  Workflow,
  Compass,
  Box,
  Shield as ShieldIcon,
  Target,
  Radio,
  Satellite,
  Scan,
  Eye,
  AlertOctagon,
  Fingerprint,
  Hash,
  Link as LinkIcon,
  Network,
  Server,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Settings,
  Bell,
  BellRing,
  Menu,
  X,
  Home,
  File,
  Folder,
  FolderOpen,
  FolderTree,
  FileCode,
  FileJson,
  FileText as FileTextIcon,
  Image,
  Video,
  Music,
  Archive,
  Package,
  Box as BoxIcon,
  Cpu as CpuIcon,
  Globe as GlobeIcon,
  Shield as ShieldIcon2,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key,
  KeyRound,
  Fingerprint as FingerprintIcon,
  Scan as ScanIcon,
  Radar as RadarIcon,
  Satellite as SatelliteIcon,
  Radio as RadioIcon,
  Target as TargetIcon,
  Crosshair,
  Cross,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Eye as EyeIcon,
  EyeOff,
  EyeClosed,
  Ear,
  EarOff,
  Mic,
  MicOff,
  Speaker,
  Volume1,
  Volume2,
  VolumeX,
  Headphones,
  Headset,
  Radio as RadioIcon2,
  Tv,
  Monitor,
  Tablet,
  Smartphone,
  Watch,
  Clock as ClockIcon,
  AlarmClock,
  Timer,
  Hourglass,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarHeart,
  CalendarClock,
  CalendarOff,
  CalendarCog,
  CalendarArrowUp,
  CalendarArrowDown,
  Loader,
  Brain
} from "lucide-react"
import { apiService } from "@/services/api/api.service"

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

export default function DashboardPage() {
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    threatIntelQueries: 0,
    maliciousDetected: 0,
    pendingAnalyses: 0,
    activeIntegrations: 8
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Get recent reports
      const reports = await apiService.getAllReports()
      setRecentActivity(reports.slice(0, 5))
      
      // Calculate stats
      setStats({
        totalAnalyses: reports.length,
        threatIntelQueries: Math.floor(Math.random() * 100) + 50, // Mock data - replace with actual
        maliciousDetected: reports.filter((r: any) => (r.malscore || 0) >= 7).length,
        pendingAnalyses: reports.filter((r: any) => 
          r.status === "created" || r.status === "pending" || r.status === "processing"
        ).length,
        activeIntegrations: 8
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-background to-gray-900">
      <NetworkBackground />
      
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header with Welcome and Quick Actions */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-xl">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome back, Analyst
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Real-time malware analysis and threat intelligence at your fingertips
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadDashboardData}
                className="p-2 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/upload")}
                className="px-4 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:from-primary/90 hover:to-purple-600/90 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                New Analysis
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards - Enhanced */}
          <motion.div variants={itemVariants}>
            <StatsCards />
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <QuickActions />
              </motion.div>

              {/* Recent Analyses */}
              <motion.div variants={itemVariants}>
                <RecentAnalyses />
              </motion.div>

              {/* Activity Timeline */}
              <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  <Link 
                    href="/dashboard/reports"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/5 border border-border/50 animate-pulse">
                        <div className="w-10 h-10 bg-muted/20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted/20 rounded w-3/4" />
                          <div className="h-3 bg-muted/20 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => {
                      const isMalicious = (activity.malscore || 0) >= 7
                      const isProcessing = activity.status === "created" || activity.status === "pending"
                      
                      return (
                        <motion.div
                          key={activity.analysis_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => router.push(`/dashboard/analysis/${activity.analysis_id}`)}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/5 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                          <div className={`p-2 rounded-lg ${
                            isMalicious ? 'bg-red-500/10' : 
                            isProcessing ? 'bg-blue-500/10' : 
                            'bg-green-500/10'
                          }`}>
                            {isMalicious ? (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            ) : isProcessing ? (
                              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">
                                {activity.filename || "Unknown File"}
                              </p>
                              {activity.malscore && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  activity.malscore >= 7 ? 'bg-red-500/10 text-red-500' :
                                  activity.malscore >= 4 ? 'bg-yellow-500/10 text-yellow-500' :
                                  'bg-green-500/10 text-green-500'
                                }`}>
                                  Score: {activity.malscore}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.created_at 
                                  ? new Date(activity.created_at).toLocaleDateString()
                                  : "Unknown"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {activity.analysis_id?.slice(0, 8)}...
                              </span>
                              <span>•</span>
                              <span className="capitalize">{activity.status || "unknown"}</span>
                            </div>
                          </div>
                          
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/20 rounded-full mb-3">
                      <Activity className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No recent activity</p>
                    <button
                      onClick={() => router.push("/dashboard/upload")}
                      className="mt-3 text-sm text-primary hover:underline"
                    >
                      Start your first analysis
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Threat Intelligence Overview */}
              <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Radar className="w-5 h-5 text-purple-500" />
                    Threat Intel
                  </h3>
                  <Link 
                    href="/dashboard/threat-intel/unified"
                    className="text-sm text-purple-500 hover:underline flex items-center gap-1"
                  >
                    Unified Scanner
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Active Sources</p>
                      <p className="text-2xl font-bold text-purple-500">{stats.activeIntegrations}</p>
                    </div>
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Queries Today</p>
                      <p className="text-2xl font-bold text-blue-500">{stats.threatIntelQueries}</p>
                    </div>
                  </div>

                  {/* Integration List */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground mb-2">Active Integrations</p>
                    <IntegrationBadge name="VirusTotal" color="green" status="active" />
                    <IntegrationBadge name="AbuseIPDB" color="blue" status="active" />
                    <IntegrationBadge name="MalwareBazaar" color="purple" status="active" />
                    <IntegrationBadge name="Hybrid Analysis" color="orange" status="active" />
                    <IntegrationBadge name="AlienVault OTX" color="teal" status="active" />
                    <IntegrationBadge name="Filescan.io" color="indigo" status="active" />
                    <IntegrationBadge name="ThreatFox" color="pink" status="active" />
                  </div>

                  <Link 
                    href="/dashboard/threat-intel/unified"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-center text-sm font-medium"
                  >
                    Search All Sources
                  </Link>
                </div>
              </motion.div>

              {/* System Health */}
              <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-500" />
                  System Health
                </h3>
                
                <div className="space-y-4">
                  <HealthMetric
                    label="API Response Time"
                    value="124ms"
                    status="good"
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <HealthMetric
                    label="Queue Length"
                    value="3 analyses"
                    status="warning"
                    icon={<Clock className="w-4 h-4" />}
                  />
                  <HealthMetric
                    label="Storage Used"
                    value="2.4 GB / 10 GB"
                    status="good"
                    icon={<HardDrive className="w-4 h-4" />}
                  />
                  <HealthMetric
                    label="Active Users"
                    value="1 (You)"
                    status="good"
                    icon={<Users className="w-4 h-4" />}
                  />
                </div>
              </motion.div>

              {/* Quick Tips */}
              <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-6 backdrop-blur-xl bg-gradient-to-br from-primary/5 to-purple-500/5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Pro Tips
                </h3>
                
                <div className="space-y-3">
                  <TipItem
                    icon={<Rocket className="w-4 h-4" />}
                    text="Use 'Complete Analysis' for executable files to get sandbox results"
                  />
                  <TipItem
                    icon={<FileJson className="w-4 h-4" />}
                    text="Upload existing CAPE JSON reports for parsing and AI analysis"
                  />
                  <TipItem
                    icon={<Radar className="w-4 h-4" />}
                    text="Try the Unified Scanner to search across all threat intel sources"
                  />
                  <TipItem
                    icon={<Hash className="w-4 h-4" />}
                    text="Hash lookups are fastest - check hashes in MalwareBazaar first"
                  />
                  <TipItem
                    icon={<Brain className="w-4 h-4" />}
                    text="Gemini AI provides natural language summaries of analysis results"
                  />
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={itemVariants} className="glass border border-border/50 rounded-xl p-4 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-2">
                  <QuickLink
                    icon={<Upload className="w-4 h-4" />}
                    label="Upload"
                    href="/dashboard/upload"
                  />
                  <QuickLink
                    icon={<FileText className="w-4 h-4" />}
                    label="Reports"
                    href="/dashboard/reports"
                  />
                  <QuickLink
                    icon={<Shield className="w-4 h-4" />}
                    label="Threat Intel"
                    href="/dashboard/threat-intel"
                  />
                  <QuickLink
                    icon={<Settings className="w-4 h-4" />}
                    label="Settings"
                    href="/dashboard/settings"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
            <FooterStat
              label="Total Analyses"
              value={stats.totalAnalyses.toString()}
              change="+12%"
              icon={<BarChart3 className="w-4 h-4" />}
            />
            <FooterStat
              label="Threats Detected"
              value={stats.maliciousDetected.toString()}
              change="+3"
              icon={<AlertTriangle className="w-4 h-4" />}
              critical
            />
            <FooterStat
              label="Pending"
              value={stats.pendingAnalyses.toString()}
              change="-2"
              icon={<Clock className="w-4 h-4" />}
            />
            <FooterStat
              label="Integrations"
              value={`${stats.activeIntegrations}/8`}
              change="Active"
              icon={<Globe className="w-4 h-4" />}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Helper Components

function IntegrationBadge({ name, color, status }: { name: string; color: string; status: string }) {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    teal: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
  }

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <span className="text-sm">{name}</span>
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-xs">Active</span>
      </span>
    </div>
  )
}

function HealthMetric({ label, value, status, icon }: { label: string; value: string; status: 'good' | 'warning' | 'bad'; icon: React.ReactNode }) {
  const statusColors = {
    good: 'text-green-500',
    warning: 'text-yellow-500',
    bad: 'text-red-500'
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{value}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${statusColors[status]} animate-pulse`} />
      </div>
    </div>
  )
}

function TipItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="text-primary mt-0.5">{icon}</div>
      <p className="text-muted-foreground">{text}</p>
    </div>
  )
}

function QuickLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const router = useRouter()
  
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-2 p-3 rounded-lg bg-muted/5 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  )
}

function FooterStat({ label, value, change, icon, critical = false }: { 
  label: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode;
  critical?: boolean;
}) {
  const isPositive = change.startsWith('+') && !critical
  const isNegative = change.startsWith('-') || critical

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted/20">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-foreground">{value}</p>
          <span className={`text-xs ${
            isPositive ? 'text-green-500' : 
            isNegative ? 'text-red-500' : 
            'text-yellow-500'
          }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  )
}