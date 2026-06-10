"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Brain,
  ChevronRight,
  Cpu,
  Database,
  FileText,
  Github,
  Globe,
  Linkedin,
  Lock,
  Mail,
  Network,
  Server,
  Shield,
  Target,
  Twitter,
  Workflow,
  Zap,
  BarChart3,
  Bug,
  FlaskConical,
  Radar,
  Crosshair,
  Upload,
  Bot,
  FileScan,
  Sparkles,
  Binary,
  ShieldAlert,
  Activity,
  Layers,
  Code,
  TrendingUp
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Logo } from "@/components/ui/Logo"

// Blue Team Section Data - Enhanced with detailed information from thesis
const blueTeamContent = {
  overview: "The Blue Team module forms the core of Chameleon's defensive capabilities. It executes suspicious files in a sandboxed environment, captures runtime behavior, and generates actionable threat intelligence through AI-powered analysis. The system integrates CAPE Sandbox for dynamic analysis, a custom parser service for data extraction, Google Gemini 2.5 Flash for LLM-based behavioral interpretation, and nine threat intelligence platforms for indicator enrichment.",
  
  architecture: {
    frontend: "Next.js dashboard with JWT authentication, Google OAuth, and TOTP-based MFA",
    backend: "FastAPI orchestration service handling async operations, sandbox communication, and parallel processing",
    pipeline: "CAPE Sandbox → JSON Report → Parser Service → Structured Data → LLM Analysis → Threat Intel → Final Report",
    database: "MongoDB for user records, analysis results, AI summaries, and threat intelligence data"
  },
  
  components: [
    {
      name: "CAPE Sandbox Integration",
      description: "Files are executed in isolated virtual machines with comprehensive monitoring of API calls, registry changes, file operations, network traffic, and memory artifacts. CAPE provides automated unpacking and payload extraction capabilities.",
      features: ["Process creation tracking", "Registry modification logging", "File system operations", "Network connection capture", "Memory dump analysis", "Payload extraction", "Automated unpacking", "YARA-based classification"]
    },
    {
      name: "Parser Service",
      description: "Raw JSON output from CAPE is transformed into structured data blocks for efficient analysis and storage. The parser handles reports up to 50MB+ with incremental parsing and fault tolerance.",
      features: ["Behavioral trace extraction", "Signature detection", "Network artifact parsing", "Memory artifact extraction", "Static metadata enrichment", "Incremental JSON parsing", "Fault-tolerant architecture"]
    },
    {
      name: "LLM Analysis Pipeline",
      description: "Google Gemini 2.5 Flash processes structured behavioral data in parallel across multiple sections to generate human-readable intelligence with high efficiency.",
      features: ["Behavior summarization", "MITRE ATT&CK mapping", "Threat severity scoring", "Actionable recommendations", "Parallel section analysis", "Confidence-weighted risk assessment"]
    },
    {
      name: "Threat Intelligence Integration",
      description: "Nine external threat intelligence platforms provide enrichment for extracted indicators through concurrent API queries with normalized response consolidation.",
      features: ["VirusTotal reputation checks", "AlienVault OTX correlation", "MalwareBazaar family lookup", "AbuseIPDB blacklist check", "ThreatFox IOC validation", "Hybrid Analysis integration", "URLhaus domain checking", "FileScan.io scanning"]
    }
  ],
  
  performance: {
    analysisTime: "2-3 minutes per file",
    parallelProcessing: "LLM analysis runs parallel across 5+ sections",
    threatIntelConcurrent: "9 services queried simultaneously",
    parserCapacity: "Handles 50MB+ JSON reports",
    userConcurrency: "Multiple users supported without performance degradation"
  },
  
  workflow: "Upload → Sandbox Execution → JSON Report → Structured Parsing → LLM Analysis → Threat Intel → Final Report"
}

// Red Team Section Data - Enhanced with detailed research information from thesis
const redTeamContent = {
  overview: "The Red Team module explores how AI can generate evasive malware variants to test detection systems. It uses a Wasserstein Generative Adversarial Network with Gradient Penalty (WGAN-GP) trained on EMBER 2024 dataset to produce feature-space perturbations that fool LightGBM classifiers. Six model iterations were trained, with Model 6 (M12) achieving 94.00% evasion at peak performance.",
  
  dataset: {
    malicious: "5,004 samples across PSW (2,355), Ransomware (1,392), Downloader (1,257)",
    benign: "5,004 elite benign samples with Authenticode signatures, import diversity >15 DLLs, entropy <6.0",
    platforms: "Win32 (38.2%), Win64 (20.9%), Dot_Net (40.8%)",
    featureSpace: "2,568-dimensional vectors across 14 EMBER fields"
  },
  
  architecture: {
    generator: "128-dim latent noise + 2,568-dim malware features + 6-dim condition vector → adversarial output with hierarchical gating",
    critic: "5-layer spectral-normalized network with WGAN-div loss (k=2, p=4)",
    surrogate: "4-member ensemble: PlainMLP, ResidualMLP, FeatureMixer, SoftTree (depth-6, 64 leaves)",
    constraints: "IQR clamping, byte histogram freezing (dims 0-511), hierarchical feature gating (16 semantic groups)"
  },
  
  training: {
    models: "6 variants trained sequentially from Model 1 to Model 6 (M12)",
    bestModel: "Model 6 (M12) at Epoch 127",
    perClass: "Password Stealers: 94.4%, Ransomware: 94.9%, Downloader: 92.5%",
    transfer: "Random Forest: 1.0%, XGBoost: 1.4%",
    peakEvasion: "94.00% against LightGBM oracle",
    phaseTransition: "SoftTree gradient caused jump from 31.8% → 83.2% over two epochs"
  },
  
  innovations: [
    "SoftTree surrogate - Differentiable tree approximation providing gradient signal for tree-based classifiers",
    "Hierarchical gate system - 16 semantic groups + per-dimension gates + feature attention for structured mutations",
    "Stratified dataset construction - Balanced across PSW/Ransomware/Downloader and Win32/Win64/.NET",
    "Temporal relevance - EMBER 2024 (v3) with Windows 11 telemetry fields"
  ],
  
  modelProgression: [
    { name: "Model 1", evasion: "91.51%", issue: "Outlier exploit - crashed next epoch" },
    { name: "Model 2", evasion: "85.31%", issue: "Loss divergence into degenerate space" },
    { name: "Model 3", evasion: "93.91%", issue: "RobustScaler introduced, balanced across classes" },
    { name: "Model 4", evasion: "33.37%", issue: "GradScaler error - discarded" },
    { name: "Model 5 (M11)", evasion: "31.20%", issue: "No SoftTree - poor tree classifier transfer" },
    { name: "Model 6 (M12)", evasion: "94.00%", issue: "SoftTree + Gate Entropy - NEW BEST" }
  ],
  
  ethical: "All operations in air-gapped environment. Offline snapshot taken before malware loading. No internet connectivity during execution. No mechanism to deploy generated adversarial files outside isolated host. All PE binaries from established research repositories under standard research-use agreements. Research consistent with ethical frameworks described by Anderson et al. (2018) and Demetrio et al. (2021)."
}

type DocSection = {
  id: "blue-team" | "red-team"
  title: string
  icon: LucideIcon
  description: string
}

const docSections: DocSection[] = [
  {
    id: "blue-team",
    title: "Blue Team Analysis Engine",
    icon: Shield,
    description: "Dynamic behavioral analysis pipeline for malware detection with CAPE Sandbox, LLM interpretation, and threat intelligence enrichment."
  },
  {
    id: "red-team",
    title: "Red Team Evasion Engine",
    icon: Target,
    description: "AI-assisted adversarial malware generation using WGAN-GP with SoftTree surrogate achieving 94% evasion against LightGBM."
  }
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<"blue-team" | "red-team">("blue-team")

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "48px 48px", "0px 0px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 top-32 h-[30rem] w-[30rem] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-black/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Logo type="icon" size="sm" className="shrink-0" />
            <div className="hidden sm:block">
              <p className="font-[var(--font-sora)] text-base sm:text-lg font-semibold tracking-wide">Chameleon</p>
              <p className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground">Adaptive Malware Intelligence</p>
            </div>
            <div className="block sm:hidden">
              <p className="font-[var(--font-sora)] text-base font-semibold tracking-wide">Chameleon</p>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            <a href="/#platform" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Platform</a>
            <a href="/#blue-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="/#architecture" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Architecture</a>
            <a href="/#integrations" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Threat Intelligence</a>
            <a href="/#research" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Research</a>
            <a href="/docs" className="font-[var(--font-inter)] text-sm text-primary transition-colors">Documentation</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg border border-border px-2.5 sm:px-3 py-1.5 sm:py-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3 sm:px-4 py-1.5 sm:py-2 font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
              Launch Platform
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="border-b border-border/80 bg-gradient-to-b from-black to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
            <Reveal>
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <h1 className="font-[var(--font-sora)] text-3xl sm:text-4xl lg:text-5xl font-semibold">Documentation</h1>
                  <p className="mt-1 sm:mt-2 font-[var(--font-inter)] text-base sm:text-lg text-muted-foreground">
                    Complete technical documentation for Chameleon's Blue Team and Red Team modules.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="shrink-0 lg:w-64">
              <div className="sticky top-24 space-y-1">
                {docSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-[var(--font-inter)] text-sm">{section.title}</span>
                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${activeSection === section.id ? "rotate-90" : ""}`} />
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1">
              <Reveal>
                {activeSection === "blue-team" ? (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="font-[var(--font-sora)] text-xl sm:text-2xl font-semibold">Blue Team Analysis Engine</h2>
                    </div>
                    <p className="font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">{docSections[0].description}</p>

                    {/* Overview */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-2 sm:mb-3">Overview</h3>
                      <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground leading-relaxed">{blueTeamContent.overview}</p>
                    </div>

                    {/* Architecture Overview */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">System Architecture</h3>
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <Code className="h-4 w-4 text-primary mb-2" />
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Frontend</p>
                          <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{blueTeamContent.architecture.frontend}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <Server className="h-4 w-4 text-primary mb-2" />
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Backend</p>
                          <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{blueTeamContent.architecture.backend}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <Workflow className="h-4 w-4 text-primary mb-2" />
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Pipeline</p>
                          <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{blueTeamContent.architecture.pipeline}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <Database className="h-4 w-4 text-primary mb-2" />
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Database</p>
                          <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{blueTeamContent.architecture.database}</p>
                        </div>
                      </div>
                    </div>

                    {/* Components */}
                    <div className="space-y-4">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold">Core Components</h3>
                      {blueTeamContent.components.map((component, idx) => (
                        <div key={component.name} className="rounded-xl border border-border/80 bg-card/30 p-4 sm:p-5">
                          <h4 className="font-[var(--font-sora)] text-sm sm:text-base font-semibold text-primary">{component.name}</h4>
                          <p className="mt-1.5 sm:mt-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{component.description}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                            {component.features.map((feature) => (
                              <span key={feature} className="rounded-full bg-primary/5 px-1.5 sm:px-2 py-0.5 font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-primary/70">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Performance Metrics */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Performance Metrics</h3>
                      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                        <div className="text-center p-2 rounded-lg border border-border/60 bg-black/30">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Analysis Time</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary">{blueTeamContent.performance.analysisTime}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg border border-border/60 bg-black/30">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Parallel Processing</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary">5+ sections</p>
                        </div>
                        <div className="text-center p-2 rounded-lg border border-border/60 bg-black/30">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Threat Intel</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary">9 concurrent</p>
                        </div>
                        <div className="text-center p-2 rounded-lg border border-border/60 bg-black/30">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Parser Capacity</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary">50MB+ JSON</p>
                        </div>
                        <div className="text-center p-2 rounded-lg border border-border/60 bg-black/30">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Multi-User</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm font-semibold text-primary">Supported</p>
                        </div>
                      </div>
                    </div>

                    {/* Workflow */}
                    <div className="rounded-xl border border-border/80 bg-black/40 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3">Analysis Workflow</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {blueTeamContent.workflow.split(" → ").map((step, index) => (
                          <div key={step} className="flex items-center gap-1.5 sm:gap-2">
                            <span className="rounded-full bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 font-[var(--font-jetbrains-mono)] text-[9px] sm:text-xs text-primary whitespace-nowrap">
                              {step}
                            </span>
                            {index < 6 && <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="font-[var(--font-sora)] text-xl sm:text-2xl font-semibold">Red Team Evasion Engine</h2>
                    </div>
                    <p className="font-[var(--font-inter)] text-sm sm:text-base text-muted-foreground">{docSections[1].description}</p>

                    {/* Overview */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-2 sm:mb-3">Overview</h3>
                      <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground leading-relaxed">{redTeamContent.overview}</p>
                    </div>

                    {/* Dataset */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Dataset Construction</h3>
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Malicious Samples</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.dataset.malicious}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Elite Benign</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.dataset.benign}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Platforms</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.dataset.platforms}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] text-primary">Feature Space</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.dataset.featureSpace}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Innovations */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3">Key Research Innovations</h3>
                      <ul className="space-y-2">
                        {redTeamContent.innovations.map((item) => (
                          <li key={item} className="flex items-start gap-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">
                            <Sparkles className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Model Progression Table */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Model Progression (6 Variants)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="pb-2 font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Model</th>
                              <th className="pb-2 font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Evasion Rate</th>
                              <th className="pb-2 font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Key Finding</th>
                            </tr>
                          </thead>
                          <tbody>
                            {redTeamContent.modelProgression.map((model) => (
                              <tr key={model.name} className="border-b border-border/40">
                                <td className="py-2 font-[var(--font-inter)] text-xs sm:text-sm">{model.name}</td>
                                <td className={`py-2 font-[var(--font-jetbrains-mono)] text-xs sm:text-sm ${model.evasion === "94.00%" ? "text-green-500 font-bold" : "text-muted-foreground"}`}>{model.evasion}</td>
                                <td className="py-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{model.issue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Architecture */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Architecture</h3>
                      <div className="grid gap-3 sm:gap-4">
                        <div>
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Generator:</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.architecture.generator}</p>
                        </div>
                        <div>
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Critic:</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.architecture.critic}</p>
                        </div>
                        <div>
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Surrogate Ensemble:</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.architecture.surrogate}</p>
                        </div>
                        <div>
                          <p className="font-[var(--font-jetbrains-mono)] text-[10px] sm:text-xs text-primary">Constraints:</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.architecture.constraints}</p>
                        </div>
                      </div>
                    </div>

                    {/* Training Results */}
                    <div className="rounded-xl border border-border/80 bg-card/50 p-4 sm:p-6">
                      <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Training Results</h3>
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Best Model</p>
                          <p className="font-[var(--font-sora)] text-sm sm:text-base font-semibold text-primary">{redTeamContent.training.bestModel}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Peak Evasion</p>
                          <p className="font-[var(--font-sora)] text-sm sm:text-base font-semibold text-green-500">{redTeamContent.training.peakEvasion}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Per-Class Performance</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.training.perClass}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-black/30 p-3">
                          <p className="font-[var(--font-jetbrains-mono)] text-[8px] sm:text-[10px] text-muted-foreground">Transfer Evasion</p>
                          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground">{redTeamContent.training.transfer}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 rounded-lg border border-secondary/20 bg-secondary/5">
                        <p className="font-[var(--font-jetbrains-mono)] text-[9px] sm:text-[10px] text-secondary">Phase Transition</p>
                        <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground mt-1">{redTeamContent.training.phaseTransition}</p>
                        <div className="mt-2 h-1 w-full rounded-full bg-black/70 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                            initial={{ width: "31.8%" }}
                            whileInView={{ width: "83.2%" }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ethical Framework */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-6">
                      <div className="flex items-start gap-3">
                        <Lock className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        <div>
                          <h3 className="font-[var(--font-sora)] text-base sm:text-lg font-semibold">Ethical Framework</h3>
                          <p className="mt-1.5 sm:mt-2 font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground leading-relaxed">{redTeamContent.ethical}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            </main>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-black/70 mt-8 sm:mt-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3">
                <Logo type="icon" size="sm" />
                <p className="font-[var(--font-sora)] text-lg sm:text-xl font-semibold tracking-tight">Chameleon</p>
              </div>
              <p className="mt-3 sm:mt-4 max-w-sm font-[var(--font-inter)] text-xs sm:text-sm leading-relaxed text-muted-foreground">
                AI-Powered Adaptive Malware Analysis Platform. Analyze, simulate, and detect evolving cyber threats with enterprise-grade intelligence.
              </p>
              <div className="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4">
                <a href="https://github.com/A-P-P-LE/ChameleonServer" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a href="https://twitter.com/NEDUETOfficial" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a href="https://www.linkedin.com/in/furqanpatel" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
                <a href="mailto:mfurqanpatel61@gmail.com" className="rounded-lg border border-border/60 p-1.5 sm:p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-xs sm:text-sm font-semibold uppercase tracking-wider">Platform</h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <li><Link href="/dashboard/analysis" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Analysis Engine</Link></li>
                <li><Link href="/dashboard/threat-intelligence" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Threat Intelligence</Link></li>
                <li><Link href="/dashboard/red-team" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Red Team Module</Link></li>
                <li><Link href="/dashboard/api-docs" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">API Access</Link></li>
                <li><Link href="/dashboard/integrations" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-xs sm:text-sm font-semibold uppercase tracking-wider">Research</h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <li><Link href="/dashboard/analysis?tab=ml" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">AI Classification</Link></li>
                <li><Link href="/dashboard/red-team" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Adversarial Testing</Link></li>
                <li><Link href="/dashboard/analysis" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Behavioral Analysis</Link></li>
                <li><Link href="/dashboard/frameworks/mitre" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">MITRE ATT&CK</Link></li>
                <li><Link href="/dashboard/publications" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Publications</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-xs sm:text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <li><Link href="/about" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">About</Link></li>
                <li><Link href="/docs" className="font-[var(--font-inter)] text-xs sm:text-sm text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Support</Link></li>
                <li><Link href="/contact" className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 flex flex-col items-center justify-between gap-3 sm:gap-4 border-t border-border/60 pt-6 sm:pt-8 sm:flex-row">
            <p className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground">
              © {new Date().getFullYear()} Chameleon. All rights reserved. Built for research and defense.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/legal/privacy" className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link>
              <Link href="/legal/terms" className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link>
              <Link href="/legal/ethical-use" className="font-[var(--font-inter)] text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-primary">Ethical Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}