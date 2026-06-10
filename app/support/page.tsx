"use client"

import { motion } from "framer-motion"
import { 
  HelpCircle, 
  Mail, 
  FileText, 
  BookOpen, 
  MessageCircle,
  ChevronRight,
  Shield,
  Target,
  Brain,
  Database,
  Server,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { Github, Twitter, Linkedin, Mail as MailIcon } from "lucide-react"

const faqs = [
  {
    question: "What types of files can Chameleon analyze?",
    answer: "Chameleon supports analysis of Windows Portable Executable (PE) files including .exe, .dll, .sys, and script files. The platform executes samples in a sandboxed environment to capture behavioral data."
  },
  {
    question: "How long does an analysis take?",
    answer: "Typical analysis completes in 2-3 minutes per file, including sandbox execution, behavioral parsing, LLM analysis, and threat intelligence enrichment."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. All malware execution occurs in isolated virtual machines with no internet access. Analysis results are stored in MongoDB with user isolation and JWT authentication."
  },
  {
    question: "What threat intelligence sources are integrated?",
    answer: "Chameleon integrates with VirusTotal, AlienVault OTX, AbuseIPDB, MalwareBazaar, ThreatFox, URLhaus, FileScan.io, and Hybrid Analysis."
  },
  {
    question: "How does the Red Team module work?",
    answer: "The Red Team module uses a WGAN-GP trained on EMBER 2024 dataset to generate feature-space perturbations that evade LightGBM classifiers. It achieved 94.00% evasion at peak performance."
  },
  {
    question: "Can I export analysis reports?",
    answer: "Yes. Chameleon generates professional PDF reports containing metadata, behavioral analysis, LLM insights, threat intelligence, and MITRE ATT&CK mappings."
  },
  {
    question: "What is the difference between Blue Team and Red Team?",
    answer: "Blue Team focuses on detection and analysis of malware behavior. Red Team researches adversarial evasion techniques to test and improve detection capabilities."
  },
  {
    question: "Do I need to install anything to use Chameleon?",
    answer: "No. Chameleon is a web-based platform. Simply sign in through your browser and upload files for analysis."
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

export default function SupportPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
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

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-black/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo type="icon" size="md" className="shrink-0" />
            <div>
              <p className="font-[var(--font-sora)] text-lg font-semibold tracking-wide">Chameleon</p>
              <p className="font-[var(--font-inter)] text-xs text-muted-foreground">Adaptive Malware Intelligence</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/#platform" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Platform</Link>
            <Link href="/#blue-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="/#architecture" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Architecture</Link>
            <Link href="/#integrations" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Threat Intelligence</Link>
            <Link href="/#research" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Research</Link>
            <Link href="/docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">Documentation</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg border border-border px-3 py-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
              Launch Platform
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border/80 bg-gradient-to-b from-black to-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Reveal>
            <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/80 bg-card/50 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="rounded-2xl bg-primary/10 p-4">
                <HelpCircle className="h-12 w-12 text-primary" />
              </div>
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.18em] text-primary">
                  Support Center
                </p>
                <h1 className="mt-4 font-[var(--font-sora)] text-4xl font-semibold sm:text-5xl">Find answers, docs, and direct support</h1>
                <p className="mt-3 font-[var(--font-inter)] text-lg text-muted-foreground">
                  Get help with Chameleon usage, reporting, integrations, and research workflow guidance without leaving the platform feel behind.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal>
            <Link href="/docs" className="group flex h-full items-center justify-between rounded-2xl border border-border/80 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card/70">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-[var(--font-sora)] font-semibold">Documentation</span>
                  <p className="mt-1 font-[var(--font-inter)] text-xs text-muted-foreground">Setup, workflows, and technical references</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <Link href="/contact" className="group flex h-full items-center justify-between rounded-2xl border border-border/80 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card/70">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-[var(--font-sora)] font-semibold">Contact Us</span>
                  <p className="mt-1 font-[var(--font-inter)] text-xs text-muted-foreground">Direct email and project supervisor details</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <a href="https://github.com/A-P-P-LE/ChameleonServer" target="_blank" rel="noopener noreferrer" className="group flex h-full items-center justify-between rounded-2xl border border-border/80 bg-card/50 p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card/70">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-[var(--font-sora)] font-semibold">GitHub Issues</span>
                  <p className="mt-1 font-[var(--font-inter)] text-xs text-muted-foreground">Open source repo, bugs, and release notes</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Reveal>
          <h2 className="font-[var(--font-sora)] text-2xl font-semibold">Frequently Asked Questions</h2>
          <p className="mt-2 font-[var(--font-inter)] text-muted-foreground">
            Everything you need to know about the Chameleon platform
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq, idx) => (
            <Reveal key={faq.question} delay={idx * 0.03}>
              <div className="h-full rounded-2xl border border-border/80 bg-card/40 p-5 transition-all hover:-translate-y-1 hover:border-primary/20 hover:bg-card/60">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h3 className="font-[var(--font-sora)] text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 font-[var(--font-inter)] text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="mx-auto max-w-7xl px-6 py-12 pb-24">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-[#08130f] via-[#081018] to-[#150915] p-8 text-center shadow-2xl shadow-black/20 sm:p-10">
            <div className="mx-auto inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-[var(--font-sora)] text-2xl font-semibold sm:text-3xl">Still need help?</h3>
            <p className="mx-auto mt-3 max-w-2xl font-[var(--font-inter)] text-muted-foreground">
              Can't find what you're looking for? Contact our support team directly and we will point you to the right workflow or resource.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Contact Support
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-black/70">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3">
                <Logo type="icon" size="sm" />
                <p className="font-[var(--font-sora)] text-xl font-semibold tracking-tight">Chameleon</p>
              </div>
              <p className="mt-4 max-w-sm font-[var(--font-inter)] text-sm leading-relaxed text-muted-foreground">
                AI-Powered Adaptive Malware Analysis Platform. Analyze, simulate, and detect evolving cyber threats with enterprise-grade intelligence.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <a href="https://github.com/A-P-P-LE/ChameleonServer" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://twitter.com/NEDUETOfficial" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/furqanpatel" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="mailto:mfurqanpatel61@gmail.com" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                  <MailIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider">Platform</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/dashboard/analysis" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Analysis Engine</Link></li>
                <li><Link href="/dashboard/threat-intelligence" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Threat Intelligence</Link></li>
                <li><Link href="/dashboard/red-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Red Team Module</Link></li>
                <li><Link href="/dashboard/api-docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">API Access</Link></li>
                <li><Link href="/dashboard/integrations" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider">Research</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/dashboard/analysis?tab=ml" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">AI Classification</Link></li>
                <li><Link href="/dashboard/red-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Adversarial Testing</Link></li>
                <li><Link href="/dashboard/analysis" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Behavioral Analysis</Link></li>
                <li><Link href="/dashboard/frameworks/mitre" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">MITRE ATT&CK</Link></li>
                <li><Link href="/dashboard/publications" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Publications</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-[var(--font-sora)] text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/about" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">About</Link></li>
                <li><Link href="/docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Documentation</Link></li>
                <li><Link href="/support" className="font-[var(--font-inter)] text-sm text-primary transition-colors">Support</Link></li>
                <li><Link href="/contact" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
            <p className="font-[var(--font-inter)] text-xs text-muted-foreground">
              © {new Date().getFullYear()} Chameleon. All rights reserved. Built for research and defense.
            </p>
            <div className="flex gap-6">
              <Link href="/legal/privacy" className="font-[var(--font-inter)] text-xs text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link>
              <Link href="/legal/terms" className="font-[var(--font-inter)] text-xs text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link>
              <Link href="/legal/ethical-use" className="font-[var(--font-inter)] text-xs text-muted-foreground transition-colors hover:text-primary">Ethical Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}