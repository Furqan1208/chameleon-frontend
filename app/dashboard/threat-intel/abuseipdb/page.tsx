"use client"

import { motion } from "framer-motion"
import { AbuseIPDBScanner } from "@/components/threat-intel/AbuseIPDBScanner"
import {
  Shield,
  AlertTriangle,
  Globe,
  Users,
  Flag,
  Building,
  Cpu,
  Zap,
  CheckCircle,
  Clock,
  Radar,
  Search,
  ChevronRight,
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

function StatCard({ icon, label, value, iconTone }: { icon: React.ReactNode; label: string; value: string | number; iconTone: string }) {
  return (
    <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 hover:bg-white/5 transition-colors">
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

export default function AbuseIPDBPage() {
  return (
    <div className="relative min-h-full bg-[#080808]">
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

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Globe className="w-7 h-7 text-sky-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Network Intelligence</p>
                <h1 className="text-3xl font-bold text-white">AbuseIPDB</h1>
                <p className="text-muted-foreground mt-2">
                  Community-driven IP abuse intelligence with confidence scoring, report history, and ASN/ISP context.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Zap className="w-4 h-4" />} label="Rate Limit" value="1,000/day" iconTone="text-amber-300" />
            <StatCard icon={<Radar className="w-4 h-4" />} label="Score Range" value="0-100" iconTone="text-violet-300" />
            <StatCard icon={<Users className="w-4 h-4" />} label="Source" value="Community" iconTone="text-emerald-300" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Response" value="Fast" iconTone="text-slate-300" />
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">IP Reputation Scanner</h2>
                  <p className="text-xs text-muted-foreground">Query public abuse reports, confidence scores, and geolocation context</p>
                </div>
              </div>

              <a
                href="/dashboard/integrations"
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-[#1a1a1a] bg-[#101214] text-slate-200 hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                Configure API Key
                <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
              </a>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
              <AbuseIPDBScanner />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-violet-300" />
                API Information
              </h2>

              <div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Free Tier</span>
                  <span className="text-sm font-medium text-white">1,000 requests/day</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Signal Type</span>
                  <span className="text-sm font-medium text-white">Abuse Confidence</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <span className="text-sm font-medium text-white">23 abuse classes</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Coverage</span>
                  <span className="text-sm font-medium text-white">Global IP telemetry</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                Getting Started
              </h2>

              <ol className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">1</span>
                  <span className="text-sm text-muted-foreground">
                    Create a free account and generate an API key from{" "}
                    <a href="https://www.abuseipdb.com/register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                      AbuseIPDB
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-sm text-muted-foreground">
                    Configure your key in the{" "}
                    <a href="/dashboard/integrations" className="text-primary hover:underline font-medium">
                      Integrations page
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">3</span>
                  <span className="text-sm text-muted-foreground">Start scanning suspicious IPs and pivot from high-confidence reports to investigation workflows</span>
                </li>
              </ol>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5 border border-primary/25">
                  <Flag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Country Intelligence</p>
                  <p className="text-sm text-muted-foreground">Geolocation context including country code and regional attribution.</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5 border border-primary/25">
                  <Building className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">ISP & ASN Details</p>
                  <p className="text-sm text-muted-foreground">Provider ownership, domain, and network identity for attribution decisions.</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5 border border-primary/25">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Abuse Category Breakdown</p>
                  <p className="text-sm text-muted-foreground">Granular classification across spam, botnet, brute force, phishing, and more.</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-0.5 border border-primary/25">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">Community Evidence</p>
                  <p className="text-sm text-muted-foreground">Real incident reports with timestamps and analyst-provided context.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-transparent p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              Analyst Tip
            </h3>
            <p className="text-sm text-muted-foreground">
              Combine AbuseIPDB confidence with historical report count and recent activity window before making block decisions. High score + recent repeated reports usually indicates active abuse infrastructure.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}