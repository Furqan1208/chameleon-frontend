"use client"

import { motion } from "framer-motion"
import { OTXScanner } from "@/components/threat-intel/OTXScanner"
import {
  Globe,
  Shield,
  Database,
  Network,
  Link as LinkIcon,
  FileText,
  Lock,
  Activity,
  Search,
  ChevronRight,
  Clock,
  Users,
  CheckCircle,
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

function StatCard({ icon, label, value, iconTone }: { icon: React.ReactNode; label: string; value: string; iconTone: string }) {
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

function IndicatorTypeCard({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <div className="p-3 border border-[#1a1a1a] rounded-lg text-center bg-black/20 hover:border-primary/30 hover:bg-primary/5 transition-colors">
      <div className="flex items-center justify-center mb-2 text-sky-300">{icon}</div>
      <div className="font-medium text-white text-sm">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  )
}

export default function AlienVaultOTXPage() {
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
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Globe className="w-7 h-7 text-violet-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Community Threat Exchange</p>
                <h1 className="text-3xl font-bold text-white">AlienVault OTX</h1>
                <p className="text-muted-foreground mt-2">
                  Investigate indicators with pulse context, malware observations, URL intelligence, and analyst-contributed telemetry.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Activity className="w-4 h-4" />} label="Free Tier" value="10 req/min" iconTone="text-amber-300" />
            <StatCard icon={<Users className="w-4 h-4" />} label="Source" value="Community" iconTone="text-cyan-300" />
            <StatCard icon={<Database className="w-4 h-4" />} label="Coverage" value="Millions of IOCs" iconTone="text-emerald-300" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Access" value="Unlimited Daily" iconTone="text-slate-300" />
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">OTX Indicator Scanner</h2>
                  <p className="text-xs text-muted-foreground">Search IPs, domains, URLs, hashes, hostnames, and CVE identifiers</p>
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
              <OTXScanner />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Supported Indicator Types
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 pt-4 border-t border-[#1a1a1a]">
              <IndicatorTypeCard icon={<Network className="w-4 h-4" />} label="IPv4" description="IP addresses" />
              <IndicatorTypeCard icon={<Network className="w-4 h-4" />} label="IPv6" description="IPv6 addresses" />
              <IndicatorTypeCard icon={<Globe className="w-4 h-4" />} label="Domain" description="Domain names" />
              <IndicatorTypeCard icon={<LinkIcon className="w-4 h-4" />} label="URL" description="Full URLs" />
              <IndicatorTypeCard icon={<FileText className="w-4 h-4" />} label="File Hash" description="MD5, SHA1, SHA256" />
              <IndicatorTypeCard icon={<Globe className="w-4 h-4" />} label="Hostname" description="FQDN indicators" />
              <IndicatorTypeCard icon={<Lock className="w-4 h-4" />} label="CVE" description="Vulnerability IDs" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-transparent p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              Analyst Tip
            </h3>
            <p className="text-sm text-muted-foreground">
              Correlate pulse count with threat score and last-seen timing before escalating an indicator. High score plus active community pulses usually signals live abuse infrastructure.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}