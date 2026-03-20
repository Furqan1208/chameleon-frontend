// app/dashboard/threat-intel/virustotal/page.tsx
"use client"

import { motion } from "framer-motion"
import { VTScanner } from "@/components/threat-intel/VTScanner"
import {
  Shield,
  AlertTriangle,
  Globe,
  Cpu,
  Zap,
  Database,
  Network,
  Lock,
  TrendingUp,
  CheckCircle,
  Clock,
  Flame,
  Search,
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/25 mt-1">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({
  icon,
  label,
  value,
  iconTone,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  iconTone: string
}) {
  return (
    <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs uppercase tracking-wider">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#1a1a1a] bg-[#101214] ${iconTone}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </motion.div>
  )
}

export default function VirusTotalPage() {
  return (
    <div className="relative min-h-full bg-[#080808]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Shield className="w-7 h-7 text-sky-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Intelligence Platform</p>
                <h1 className="text-3xl font-bold text-white">VirusTotal Scanner</h1>
                <p className="text-muted-foreground mt-2">
                  70+ antivirus engines • Real-time threat intelligence • Multi-indicator analysis
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Zap className="w-4 h-4" />} label="Engines" value="70+" iconTone="text-emerald-300" />
            <StatCard icon={<Globe className="w-4 h-4" />} label="IOC Types" value="5" iconTone="text-sky-300" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Rate Limit" value="4/min" iconTone="text-amber-300" />
            <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Coverage" value="Global" iconTone="text-violet-300" />
          </motion.div>

          {/* Scanner Section */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                <Search className="w-5 h-5 text-sky-300" />
              </div>
              <h2 className="text-lg font-semibold text-white">Threat Scanner</h2>
            </div>

            <VTScanner />
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-300" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                icon={<Database className="w-4 h-4 text-primary" />}
                title="Multi-Engine Analysis"
                description="70+ antivirus engines scanning simultaneously for comprehensive threat detection"
              />
              <FeatureCard
                icon={<Network className="w-4 h-4 text-primary" />}
                title="Network Expert"
                description="Advanced network traffic analysis and behavioral patterns detection"
              />
              <FeatureCard
                icon={<TrendingUp className="w-4 h-4 text-primary" />}
                title="Threat Scoring"
                description="Machine learning-powered confidence scores and threat assessment"
              />
              <FeatureCard
                icon={<Lock className="w-4 h-4 text-primary" />}
                title="Historical Data"
                description="Access historical analysis results and trend analysis over time"
              />
            </div>
          </motion.div>

          {/* Supported Indicators */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Supported Indicators of Compromise
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-[#1a1a1a]">
              {[
                { name: "MD5 Hash", example: "d41d8cd98f00b204e9800998ecf8427e" },
                { name: "SHA1 Hash", example: "da39a3ee5e6b4b0d3255bfef95601890afd80709" },
                { name: "SHA256 Hash", example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e..." },
                { name: "IPv4 Address", example: "8.8.8.8" },
                { name: "Domain", example: "google.com" },
              ].map((indicator) => (
                <div key={indicator.name} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                  <p className="font-medium text-white text-sm mb-1">{indicator.name}</p>
                  <code className="text-xs text-muted-foreground break-all">{indicator.example}</code>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Information Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Information */}
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                API Information
              </h2>

              <div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Rate Limit</span>
                  <span className="text-sm font-medium text-white">4 requests/minute (free)</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Daily Limit</span>
                  <span className="text-sm font-medium text-white">Unlimited</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Engine Count</span>
                  <span className="text-sm font-medium text-white">70+ antivirus vendors</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm font-medium text-white">500ms - 2s average</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Cache TTL</span>
                  <span className="text-sm font-medium text-white">1 hour local cache</span>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Getting Started
              </h2>

              <ol className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Get a free VirusTotal API key from{" "}
                    <a
                      href="https://www.virustotal.com/gui/join-us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      their website
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Configure your API key in the{" "}
                    <a
                      href="/dashboard/integrations"
                      className="text-primary hover:underline font-medium"
                    >
                      Integrations page
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                    3
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Start scanning indicators (hashes, IPs, domains) above
                  </span>
                </li>
              </ol>
            </div>
          </motion.div>

          {/* Use Cases */}
          <motion.div variants={itemVariants} className="rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-transparent p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Common Use Cases
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Hash Reputation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check file hash against all antivirus vendors to identify malware
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  IP Intelligence
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyze IP addresses for security threats and reputation scoring
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Domain Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Investigate domain safety, SSL certificates, and hosting details
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Pro Tips
            </h2>

            <ul className="space-y-2 pt-4 border-t border-[#1a1a1a]">
              <li className="flex gap-3 text-sm">
                <span className="text-primary flex-shrink-0">✓</span>
                <span className="text-muted-foreground">
                  Use SHA256 hashes for most reliable detection across antivirus engines
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary flex-shrink-0">✓</span>
                <span className="text-muted-foreground">
                  Check the "Relationships" section to find connected files, IPs, and domains
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary flex-shrink-0">✓</span>
                <span className="text-muted-foreground">
                  Review Community Votes before conclusions - check analyst comments
                </span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary flex-shrink-0">✓</span>
                <span className="text-muted-foreground">
                  Use Unified Scanner for quick multi-source analysis alongside VirusTotal
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}