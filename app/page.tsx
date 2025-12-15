// app/page.tsx - Complete updated version
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Upload, 
  Brain, 
  Zap, 
  Database, 
  BarChart3, 
  Cpu,
  Globe,
  Network,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Lock,
  CircuitBoard,
  Radar,
  ShieldCheck
} from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/ui/Logo"

// Integration data with logos
const integrations = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: '70+ antivirus engines, file analysis, threat intelligence',
    icon: ShieldCheck,
    color: '#00ff88',
    status: 'active'
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    description: 'IP reputation & abuse database',
    icon: Globe,
    color: '#0088ff',
    status: 'coming'
  },
  {
    id: 'hybridanalysis',
    name: 'Hybrid Analysis',
    description: 'Advanced sandbox malware analysis',
    icon: Cpu,
    color: '#aa00ff',
    status: 'coming'
  },
  {
    id: 'urlhaus',
    name: 'URLhaus',
    description: 'Malware URL database from abuse.ch',
    icon: Network,
    color: '#ff0088',
    status: 'coming'
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    description: 'Open threat intelligence platform',
    icon: AlertTriangle,
    color: '#ff8800',
    status: 'coming'
  },
  {
    id: 'malwarebazaar',
    name: 'MalwareBazaar',
    description: 'Malware sample repository',
    icon: FileText,
    color: '#ff0000',
    status: 'coming'
  },
  {
    id: 'filescan',
    name: 'FileScan.io',
    description: 'Advanced file analysis',
    icon: Database,
    color: '#00ccff',
    status: 'coming'
  },
  {
    id: 'threatfox',
    name: 'ThreatFox',
    description: 'IOC database & sharing',
    icon: Radar,
    color: '#8800ff',
    status: 'coming'
  }
]

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Gemini AI for intelligent threat detection and behavioral analysis",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Real-time Scanning",
    description: "Instant analysis with multiple threat intelligence sources",
    color: "text-accent"
  },
  {
    icon: Lock,
    title: "Advanced Security",
    description: "Comprehensive malware analysis with sandbox integration",
    color: "text-secondary"
  },
  {
    icon: Database,
    title: "Centralized Intelligence",
    description: "Aggregated results from 10+ threat intelligence APIs",
    color: "text-primary"
  }
]

export default function HomePage() {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  const [glowingIndex, setGlowingIndex] = useState(0)
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number }>>([])

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1
    }))
    setParticles(newParticles)

    // Rotate glowing integration
    const interval = setInterval(() => {
      setGlowingIndex((prev) => (prev + 1) % integrations.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Network Grid */}
        <div className="absolute inset-0 cyber-grid opacity-10" />
        
        {/* Floating Particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 mb-16"
          >
            <div className="flex flex-col items-center gap-4 mb-6">
              {/* Bigger Logo without rotation */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Logo type="full" size="2xl" className="relative z-10 neon-text scale-125" />
              </div>
              
              <h1 className="text-7xl md:text-8xl font-bold text-foreground neon-text tracking-tighter">
                CHAMELEON
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-12 bg-primary" />
                <p className="text-2xl text-muted-foreground">ADVANCED MALWARE ANALYSIS PLATFORM</p>
                <div className="h-0.5 w-12 bg-primary" />
              </div>
            </div>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Multi-engine threat intelligence platform powered by AI and integrated with 
              <span className="text-primary font-semibold"> 10+ security APIs</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => router.push("/dashboard/upload")}
                className="group relative px-12 py-6 bg-primary text-primary-foreground font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-shimmer" />
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Upload className="w-6 h-6" />
                  <span className="text-xl">UPLOAD & ANALYZE</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl group-hover:border-primary/60 transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="px-12 py-6 bg-transparent border-2 border-primary text-primary font-bold text-lg rounded-2xl hover:bg-primary/10 transition-all duration-300"
              >
                EXPLORE DASHBOARD
              </motion.button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className="glass border border-border rounded-2xl p-8 hover:glow-green transition-all duration-500"
                >
                  <div className={`${feature.color} mb-6`}>
                    <Icon className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Integrated Services */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <CircuitBoard className="w-8 h-8 text-primary" />
                <h2 className="text-4xl font-bold text-foreground">INTEGRATED THREAT INTELLIGENCE</h2>
                <CircuitBoard className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Powered by the world's leading security APIs and AI models
              </p>
            </div>

            {/* Integration Grid - FIXED: All logos now properly visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 max-w-7xl mx-auto">
              {integrations.map((integration, index) => {
                const Icon = integration.icon
                const isGlowing = index === glowingIndex
                
                return (
                  <motion.div
                    key={integration.id}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative aspect-square rounded-2xl p-5 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden group ${
                      integration.status === 'active' 
                        ? 'bg-black/40 border-2 border-primary/30 hover:border-primary' 
                        : 'bg-black/30 border border-border hover:border-border/80'
                    } ${isGlowing && integration.status === 'active' ? 'glow-green' : ''}`}
                  >
                    {/* Connection lines */}
                    {index < integrations.length - 1 && (
                      <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-border/30 hidden lg:block" />
                    )}
                    
                    {/* Status indicator */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-3 h-3 rounded-full ${integration.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                    </div>
                    
                    {/* Logo container - FIXED opacity issue */}
                    <div 
                      className="mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ 
                        color: integration.color,
                        opacity: integration.status === 'coming' ? 0.7 : 1
                      }}
                    >
                      <Icon className="w-10 h-10" />
                    </div>
                    
                    <h4 className="text-sm font-bold text-foreground text-center mb-1">
                      {integration.name}
                    </h4>
                    
                    {/* Status badge */}
                    <div className="absolute bottom-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        integration.status === 'active' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        {integration.status === 'active' ? 'ACTIVE' : 'COMING SOON'}
                      </span>
                    </div>
                    
                    {integration.status === 'active' && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Active vs Coming Soon */}
            <div className="flex justify-center gap-8 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground">Active Integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="glass border border-border rounded-3xl p-12 mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Security APIs</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-secondary mb-2">70+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">AV Engines</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">AI</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Real-time</div>
              </div>
            </div>
          </div>

          {/* CTA Section - BIGGER TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative">
              {/* Animated border */}
              <div className="absolute inset-0 border-2 border-primary/30 rounded-3xl animate-pulse" />
              
              {/* Larger CTA section */}
              <div className="relative glass border border-border rounded-3xl p-16 bg-gradient-to-br from-black/50 to-primary/5">
                {/* Bigger logo */}
                <Logo type="icon" size="xl" className="mx-auto mb-10 neon-text scale-125" />
                
                {/* Bigger heading */}
                <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
                  Ready to Analyze Threats?
                </h2>
                
                {/* Bigger paragraph text */}
                <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                  Upload any file, hash, IP, or domain for comprehensive malware analysis 
                  across multiple threat intelligence sources.
                </p>
                
                {/* Bigger buttons */}
                <div className="flex flex-col sm:flex-row gap-8 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/dashboard/upload")}
                    className="px-12 py-6 bg-primary text-primary-foreground font-bold text-xl rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group"
                  >
                    <Upload className="w-8 h-8" />
                    START ANALYSIS
                    <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/dashboard/integrations")}
                    className="px-12 py-6 bg-transparent border-2 border-primary text-primary font-bold text-xl rounded-xl hover:bg-primary/10 transition-all duration-300"
                  >
                    EXPLORE INTEGRATIONS
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo type="icon" size="md" className="neon-text" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">CHAMELEON</h3>
                  <p className="text-sm text-muted-foreground">Advanced Malware Analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/dashboard/upload")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={() => router.push("/dashboard/integrations")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Integrations
                </button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                © 2025 Chameleon Security Platform
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 136, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .neon-text {
          text-shadow: 
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor;
        }
        
        .glow-green {
          box-shadow: 
            0 0 30px rgba(0, 255, 136, 0.3),
            inset 0 0 30px rgba(0, 255, 136, 0.1);
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}