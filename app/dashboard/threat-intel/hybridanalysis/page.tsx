// app/dashboard/threat-intel/hybridanalysis/page.tsx
'use client';

import { motion } from 'framer-motion';
import { HAScanner } from '@/components/threat-intel/HAScanner';
import {
  Cpu,
  Shield,
  AlertTriangle,
  FileText,
  Database,
  Globe,
  Users,
  Zap,
  TrendingUp,
  Target,
  Lock,
  Search,
  CheckCircle,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
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
  );
}

function StatCard({
  icon,
  label,
  value,
  iconTone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconTone: string;
}) {
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

export default function HybridAnalysisPage() {
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
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Cpu className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Sandbox Analysis</p>
                <h1 className="text-3xl font-bold text-white">Hybrid Analysis</h1>
                <p className="text-muted-foreground mt-2">
                  Deep behavior detonation, IOC extraction, and MITRE ATT&CK context in one investigation workflow.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Zap className="w-4 h-4" />} label="Environments" value="7" iconTone="text-emerald-300" />
            <StatCard icon={<Database className="w-4 h-4" />} label="AV Engines" value="100+" iconTone="text-violet-300" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Max File Size" value="65MB" iconTone="text-slate-300" />
            <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Analysis Time" value="1-5 min" iconTone="text-amber-300" />
          </motion.div>

          {/* Scanner Section */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Behavioral Analysis Scanner</h2>
                  <p className="text-xs text-muted-foreground">Hash and file-driven sandbox lookups with immediate triage context</p>
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

            <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Pro workflow: submit a file, auto-calculate hash, inspect top signatures and MITRE techniques, then open full environment reports for deep forensics.
              </p>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
              <HAScanner />
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                icon={<Zap className="w-4 h-4 text-primary" />}
                title="Multi-Environment"
                description="Windows 7, 10, 11, macOS, Linux, Android VMs with full isolation"
              />
              <FeatureCard
                icon={<Target className="w-4 h-4 text-primary" />}
                title="MITRE ATT&CK"
                description="Automatic behavior mapping to tactics and techniques framework"
              />
              <FeatureCard
                icon={<TrendingUp className="w-4 h-4 text-primary" />}
                title="Threat Scoring"
                description="ML-powered analysis with confidence scores and verdict assessment"
              />
              <FeatureCard
                icon={<Lock className="w-4 h-4 text-primary" />}
                title="IOC Extraction"
                description="Automatic extraction of domains, IPs, URLs, and file relationships"
              />
            </div>
          </motion.div>

          {/* Supported File Types */}
          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Supported Analysis Types
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#1a1a1a]">
              {[
                { icon: '📁', name: 'Executables', desc: 'EXE, DLL, MSI, COM' },
                { icon: '📄', name: 'Documents', desc: 'PDF, Word, Excel, PPT' },
                { icon: '🔧', name: 'Scripts', desc: 'JS, VBS, PS1, Python' },
                { icon: '📦', name: 'Archives', desc: 'ZIP, RAR, 7Z, TAR' },
                { icon: '🌐', name: 'URLs', desc: 'Website Analysis' },
                { icon: '🔐', name: 'Hashes', desc: 'MD5, SHA256, SHA1' },
                { icon: '📱', name: 'Mobile', desc: 'APK, IPA (via API)' },
                { icon: '⚙️', name: 'Custom', desc: 'Other file types' },
              ].map((type) => (
                <div key={type.name} className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3 text-center">
                  <p className="text-2xl mb-1">{type.icon}</p>
                  <p className="font-medium text-white text-xs">{type.name}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
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
                  <span className="text-sm font-medium text-white">10 requests/minute (free tier typical)</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Max File Size</span>
                  <span className="text-sm font-medium text-white">65MB per submission</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Free Limit</span>
                  <span className="text-sm font-medium text-white">Provider policy dependent</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Analysis Time</span>
                  <span className="text-sm font-medium text-white">1-5 minutes average</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Environments</span>
                  <span className="text-sm font-medium text-white">7 sandbox types</span>
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
                    Get a free Hybrid Analysis API key from{" "}
                    <a
                      href="https://www.hybrid-analysis.com/"
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
                    Upload files or submit hashes to start behavioral analysis with full sandbox simulation
                  </span>
                </li>
              </ol>
            </div>
          </motion.div>

          {/* Use Cases */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Analyst Use Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-white">Deep Malware Analysis</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Understand malware capabilities, behaviors, and IOCs through sandboxed execution
                </p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-white">Email Threat Detection</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyze suspicious attachments and embedded threats before reaching endpoints
                </p>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-white">Incident Response</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rapidly analyze samples during security incidents to determine threat level and TTPs
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pro Tips */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4">Pro Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex gap-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Private Submissions</p>
                  <p className="text-xs text-muted-foreground">Keep your samples confidential with private submission mode</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Bulk Analysis</p>
                  <p className="text-xs text-muted-foreground">Submit multiple samples at once for faster analysis</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex gap-3">
                <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Historical Data</p>
                  <p className="text-xs text-muted-foreground">Access past analyses and compare threat intelligence</p>
                </div>
              </div>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 flex gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Threat Intelligence</p>
                  <p className="text-xs text-muted-foreground">Get access to community threat feeds and intelligence</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}