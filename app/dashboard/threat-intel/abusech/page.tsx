"use client"

import { motion } from "framer-motion"
import { AbuseChScanner } from "@/components/threat-intel/AbuseChScanner"
import {
  Database,
  Shield,
  Globe,
  FileText,
  Radar,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  Link2,
  Hash,
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

export default function AbuseChPage() {
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
                <Database className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Open IOC Intelligence</p>
                <h1 className="text-3xl font-bold text-white">Abuse.ch</h1>
                <p className="text-muted-foreground mt-2">
                  Unified hunting across URLhaus and ThreatFox for malware URLs, hashes, C2 indicators, and IOC metadata.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Globe className="w-4 h-4" />} label="Coverage" value="URL + IOC" iconTone="text-cyan-300" />
            <StatCard icon={<Radar className="w-4 h-4" />} label="Feeds" value="URLhaus + ThreatFox" iconTone="text-violet-300" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Update Pace" value="Near Real-Time" iconTone="text-slate-300" />
            <StatCard icon={<Shield className="w-4 h-4" />} label="Use Case" value="Threat Triage" iconTone="text-emerald-300" />
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Indicator Scanner</h2>
                  <p className="text-xs text-muted-foreground">Investigate suspicious indicators against Abuse.ch datasets</p>
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
              <AbuseChScanner />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                Test Indicators
              </h2>

              <div className="pt-4 border-t border-[#1a1a1a] grid grid-cols-1 gap-3">
                <div className="p-3 rounded-lg border border-[#1a1a1a] bg-black/20">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Link2 className="w-3 h-3" /> URL</p>
                  <p className="font-mono text-xs text-white break-all">http://120.7.95.185:23/1/Photo.scr</p>
                </div>
                <div className="p-3 rounded-lg border border-[#1a1a1a] bg-black/20">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> C2 Endpoint</p>
                  <p className="font-mono text-xs text-white break-all">86.38.225.228:5555</p>
                </div>
                <div className="p-3 rounded-lg border border-[#1a1a1a] bg-black/20">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> SHA256</p>
                  <p className="font-mono text-xs text-white break-all">af94ddf7c35b9d9f016a5a4b232b43e071d59c6beb1560ba76df20df7b49ca4c</p>
                </div>
                <div className="p-3 rounded-lg border border-[#1a1a1a] bg-black/20">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Malware Tag</p>
                  <p className="font-mono text-xs text-white break-all">CoinMiner</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}