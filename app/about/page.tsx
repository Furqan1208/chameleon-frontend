"use client"

import { motion } from "framer-motion"
import { ArrowRight, Github, Linkedin, Mail, Shield, Brain, Database, Server, Twitter } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

const teamMembers = [
  {
    name: "Tayyab Qamar",
    seatNo: "CY-22041",
    role: "Team Lead",
    bio: "Led overall project coordination, system integration, and technical direction. Managed CI/CD pipeline and ensured seamless component integration.",
    contributions: ["Team coordination", "System integration", "CI/CD pipeline", "Technical direction"],
    icon: Brain,
    linkedin: "https://www.linkedin.com/in/tayyab-qamar",
    github: "https://github.com/tayyabqamar",
    email: "tayyabqamar63@gmail.com",
  },
  {
    name: "Muhammad Furqan Patel",
    seatNo: "CY-22032",
    role: "Blue Team Lead",
    bio: "Led Blue Team development including frontend dashboard, parser service, threat intelligence integration, and authentication systems.",
    contributions: ["Frontend development", "Parser service", "Threat intel integration", "Authentication system", "PDF reporting"],
    icon: Shield,
    linkedin: "https://www.linkedin.com/in/furqanpatel",
    github: "https://github.com/A-P-P-LE",
    email: "mfurqanpatel61@gmail.com",
  },
  {
    name: "Anum Mateen",
    seatNo: "CY-22002",
    role: "Sandbox & Infrastructure Engineer",
    bio: "Deployed and configured CAPE Sandbox environment, sourced malware datasets, and managed LLM integration for behavioral analysis.",
    contributions: ["CAPE Sandbox deployment", "Dataset sourcing", "LLM integration", "Data preprocessing"],
    icon: Server,
    linkedin: "https://www.linkedin.com/in/anum-mateen",
    github: "https://github.com/anummateen",
    email: "anummateen5311@gmail.com",
  },
  {
    name: "Iqra Yousuf",
    seatNo: "AI-22018",
    role: "Red Team Lead",
    bio: "Researched adversarial techniques, trained GAN and RL models, built data preprocessing pipelines, and managed Red Team security framework.",
    contributions: ["GAN/RL model training", "Adversarial research", "Data preprocessing", "Security framework"],
    icon: Database,
    linkedin: "https://www.linkedin.com/in/iqra-yousuf",
    github: "https://github.com/iqrayousuf",
    email: "shaikhqrah57@gmail.com",
  },
]

const supervisor = {
  name: "Ms. Saadia Arshad",
  role: "Project Supervisor",
  designation: "Lecturer, Department of CS & IT",
  bio: "Provided continuous technical guidance, ensured ethical compliance, and reviewed project progress throughout the development lifecycle.",
}

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

export default function AboutPage() {
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
          <div className="flex items-center gap-3">
            <Logo type="icon" size="md" className="shrink-0" />
            <div>
              <p className="font-[var(--font-sora)] text-lg font-semibold tracking-wide">Chameleon</p>
              <p className="font-[var(--font-inter)] text-xs text-muted-foreground">Adaptive Malware Intelligence</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            <a href="/#platform" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Platform
            </a>
            <a href="/#blue-team" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="/#architecture" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Architecture
            </a>
            <a href="/#integrations" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Threat Intelligence
            </a>
            <a href="/#research" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Research
            </a>
            <a href="/docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground">
              Documentation
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-border px-3 py-2 font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Launch Platform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border/80 bg-gradient-to-b from-black to-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Reveal>
            <h1 className="font-[var(--font-sora)] text-4xl font-semibold sm:text-5xl">
              About Chameleon
            </h1>
            <p className="mt-4 max-w-3xl font-[var(--font-inter)] text-lg text-muted-foreground">
              Meet the team behind the AI-powered adaptive malware analysis platform. 
              Built as a final year project at NED University of Engineering & Technology.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Team Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <h2 className="font-[var(--font-sora)] text-2xl font-semibold">Project Team</h2>
          <p className="mt-2 font-[var(--font-inter)] text-muted-foreground">
            Four dedicated students from Computer Science & Information Technology
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {teamMembers.map((member, idx) => {
            const Icon = member.icon
            return (
              <Reveal key={member.name} delay={idx * 0.1}>
                <div className="group rounded-2xl border border-border/80 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card/70">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-[var(--font-sora)] text-xl font-semibold">{member.name}</h3>
                      <p className="font-[var(--font-jetbrains-mono)] text-xs text-primary">{member.seatNo}</p>
                      <p className="mt-1 font-[var(--font-inter)] text-sm text-cyan-400">{member.role}</p>
                      <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.contributions.map((cont) => (
                          <span key={cont} className="rounded-full bg-primary/10 px-2 py-0.5 font-[var(--font-jetbrains-mono)] text-[10px] text-primary/80">
                            {cont}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
                          <Github className="h-4 w-4" />
                        </a>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a href={`mailto:${member.email}`} className="text-muted-foreground transition-colors hover:text-primary">
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Supervisor Section */}
        <Reveal delay={0.4}>
          <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/20 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-[var(--font-sora)] text-xl font-semibold">{supervisor.name}</h3>
                <p className="font-[var(--font-inter)] text-sm text-primary">{supervisor.role}</p>
                <p className="font-[var(--font-inter)] text-xs text-muted-foreground">{supervisor.designation}</p>
                <p className="mt-2 font-[var(--font-inter)] text-sm text-muted-foreground">
                  {supervisor.bio}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer - Same as landing page */}
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
                  <Mail className="h-4 w-4" />
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
                <li><Link href="/about" className="font-[var(--font-inter)] text-sm text-primary transition-colors">About</Link></li>
                <li><Link href="/docs" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Documentation</Link></li>
                <li><Link href="/support" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Support</Link></li>
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