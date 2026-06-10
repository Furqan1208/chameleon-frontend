"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  Linkedin,
  Github,
  Twitter,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { Mail as MailIcon } from "lucide-react"

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission (connect to your backend API in production)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setLoading(false)
    setFormData({ name: "", email: "", subject: "", message: "" })
    
    setTimeout(() => setSubmitted(false), 5000)
  }

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
              <Send className="h-4 w-4" />
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
                <Mail className="h-12 w-12 text-primary" />
              </div>
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-[var(--font-jetbrains-mono)] text-[11px] uppercase tracking-[0.18em] text-primary">
                  Contact
                </p>
                <h1 className="mt-4 font-[var(--font-sora)] text-4xl font-semibold sm:text-5xl">Talk to the Chameleon team</h1>
                <p className="mt-3 font-[var(--font-inter)] text-lg text-muted-foreground">
                  Reach out for collaboration, feedback, deployment questions, or support around the malware analysis workflow.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Contact Info */}
          <Reveal>
            <div className="space-y-6 rounded-3xl border border-border/80 bg-card/45 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
              <div>
                <h2 className="font-[var(--font-sora)] text-2xl font-semibold">Get in Touch</h2>
                <p className="mt-2 font-[var(--font-inter)] text-muted-foreground">
                  Have questions about Chameleon? Want to collaborate? Reach out to us directly.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-black/25 p-4 transition-colors hover:border-primary/25">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <MailIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-sora)] font-semibold">Email</h3>
                    <a href="mailto:mfurqanpatel61@gmail.com" className="font-[var(--font-inter)] text-sm text-muted-foreground hover:text-primary">
                      mfurqanpatel61@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-black/25 p-4 transition-colors hover:border-primary/25">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-sora)] font-semibold">Location</h3>
                    <p className="font-[var(--font-inter)] text-sm text-muted-foreground">
                      NED University of Engineering & Technology<br />
                      University Road, Karachi, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-black/25 p-4 transition-colors hover:border-primary/25">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-sora)] font-semibold">Project Supervisor</h3>
                    <p className="font-[var(--font-inter)] text-sm text-muted-foreground">
                      Ms. Saadia Arshad<br />
                      Lecturer, Department of CS & IT
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-2xl border border-border/80 bg-black/25 p-5">
                <h3 className="font-[var(--font-sora)] font-semibold mb-3">Connect With Us</h3>
                <div className="flex gap-3">
                  <a href="https://github.com/A-P-P-LE/ChameleonServer" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/furqanpatel" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="https://twitter.com/NEDUETOfficial" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Contact Form */}
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-border/80 bg-card/45 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-[var(--font-sora)] text-xl font-semibold">Send a Message</h2>
                  <p className="mt-1 font-[var(--font-inter)] text-sm text-muted-foreground">Drop a message and we’ll respond as soon as possible.</p>
                </div>
                <div className="hidden rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-right sm:block">
                  <p className="font-[var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.18em] text-primary/70">Response</p>
                  <p className="font-[var(--font-inter)] text-xs text-muted-foreground">Usually within 24 hours</p>
                </div>
              </div>
              
              {submitted ? (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <p className="font-[var(--font-inter)] text-sm text-green-500">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-[var(--font-inter)] text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/80 px-4 py-3 font-[var(--font-inter)] text-sm shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-[var(--font-inter)] text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/80 px-4 py-3 font-[var(--font-inter)] text-sm shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block font-[var(--font-inter)] text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/80 px-4 py-3 font-[var(--font-inter)] text-sm shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                      placeholder="What is this regarding?"
                    />
                  </div>
                  <div>
                    <label className="block font-[var(--font-inter)] text-sm font-medium mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-none rounded-xl border border-border bg-background/80 px-4 py-3 font-[var(--font-inter)] text-sm shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-[var(--font-inter)] text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Message"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>

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
                <li><Link href="/support" className="font-[var(--font-inter)] text-sm text-muted-foreground transition-colors hover:text-primary">Support</Link></li>
                <li><Link href="/contact" className="font-[var(--font-inter)] text-sm text-primary transition-colors">Contact</Link></li>
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