// app/dashboard/threat-intel/unified/page.tsx
'use client';

import { motion } from 'framer-motion';
import { UnifiedScanner } from '@/components/threat-intel/UnifiedScanner';
import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  Cpu, 
  Database, 
  Zap, 
  Layers,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Github,
  Twitter,
  Mail,
  Star,
  GitBranch,
  Clock,
  Users,
  Award,
  Sparkles,
  Key,
  Activity,
  Search,
  Target,
  Radar,
  Brain,
  Network,
  TrendingUp,
  Package
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
  );
}

export default function UnifiedThreatIntelPage() {
  return (
    <div className="relative min-h-full bg-[#080808]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Cross-Source Discovery</p>
                <h1 className="text-3xl font-bold text-white">Unified Threat Intelligence</h1>
                <p className="text-muted-foreground mt-2">
                  Orchestrate parallel queries across 7 intelligence platforms for comprehensive threat assessment
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Package className="w-4 h-4" />} label="Platforms" value="7" iconTone="text-cyan-300" />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Query Types" value="5" iconTone="text-emerald-300" />
            <StatCard icon={<Brain className="w-4 h-4" />} label="Aggregation" value="Auto" iconTone="text-violet-300" />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Caching" value="5 min" iconTone="text-amber-300" />
          </motion.div>

          {/* Scanner Section */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Unified Scanner</h2>
                  <p className="text-xs text-muted-foreground">Search IPs, domains, URLs, hashes, and tags across all services simultaneously</p>
                </div>
              </div>

              <Link
                href="/dashboard/integrations"
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-[#1a1a1a] bg-[#101214] text-slate-200 hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                Configure API Keys
                <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
              </Link>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
              <UnifiedScanner />
            </div>
          </motion.div>

          {/* Recommended Workflow */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-white">Recommended Workflow</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  step: 1,
                  title: 'Input Detection',
                  description: 'Automatically classifies input as IP, domain, URL, hash, or tag for intelligent routing',
                },
                {
                  step: 2,
                  title: 'Parallel Search',
                  description: 'Queries all relevant services simultaneously without waiting for individual responses',
                },
                {
                  step: 3,
                  title: 'Threat Aggregation',
                  description: 'Merges verdicts from multiple sources with automated threat confidence scoring',
                },
              ].map((item) => (
                <div key={item.step} className="group relative rounded-lg border border-[#1a1a1a] bg-black/40 p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 font-medium text-primary text-sm">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Service Coverage */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-white">Service Coverage</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  service: 'VirusTotal',
                  types: 'IP • Domain • URL • Hash',
                  desc: 'Largest shared dataset of malicious indicators',
                },
                {
                  service: 'MalwareBazaar',
                  types: 'Hash • Tag',
                  desc: 'Fresh malware samples and threat tags',
                },
                {
                  service: 'HybridAnalysis',
                  types: 'Hash • File',
                  desc: 'Behavioral analysis and execution patterns',
                },
                {
                  service: 'Filescan.io',
                  types: 'File • URL',
                  desc: 'Advanced sandbox with IOC extraction',
                },
                {
                  service: 'AlienVault OTX',
                  types: 'IP • Domain • URL • Hash',
                  desc: 'Community-curated threat intelligence',
                },
                {
                  service: 'AbuseIPDB',
                  types: 'IP',
                  desc: 'Crowdsourced IP abuse reporting',
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border border-[#1a1a1a] bg-black/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-white">{item.service}</h4>
                    <Shield className="w-4 h-4 text-emerald-300/80" />
                  </div>
                  <p className="text-xs text-primary/70 font-mono">{item.types}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Analyst Tip */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-primary/5 p-6"
          >
            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent" />
            </div>
            <div className="relative flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary/20 h-fit">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Analyst Tip</h4>
                <p className="text-sm text-muted-foreground">
                  Use hash lookups first for the fastest results. The unified scanner caches queries for 5 minutes to respect API
                  rate limits. Configure your API keys in <span className="font-mono text-primary/80">Integrations</span> to unlock
                  higher rate limits and fresh data for all 7 platforms.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
