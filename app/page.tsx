"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Shield, Upload, BarChart3, Database, Brain, Zap } from "lucide-react"
import { NetworkBackground } from "@/components/3d/NetworkBackground"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-background">
      <NetworkBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="text-center space-y-8 mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-16 h-16 text-primary neon-text" />
              <h1 className="text-6xl font-bold text-foreground neon-text">Chameleon</h1>
            </div>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">Advanced Malware Analysis Platform</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by CapeV2 sandbox integration and AI-driven threat intelligence
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg rounded-lg hover:bg-primary/90 transition-all neon-glow"
            >
              Launch Dashboard
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <FeatureCard
              icon={<Upload className="w-8 h-8" />}
              title="File Analysis"
              description="Submit files for comprehensive malware analysis using CapeV2 sandbox"
              color="green"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI-Powered Insights"
              description="Enhanced analysis using Gemini, GPT, and other AI models"
              color="blue"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Detailed Reports"
              description="Comprehensive reports with behavior, memory, and signature analysis"
              color="pink"
            />
            <FeatureCard
              icon={<Database className="w-8 h-8" />}
              title="Report Management"
              description="Store and retrieve analysis reports for future reference"
              color="green"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Threat Detection"
              description="Detect and classify malware using multiple detection engines"
              color="blue"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Real-time Analysis"
              description="Get instant results with parallel processing and caching"
              color="pink"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: "green" | "blue" | "pink"
}) {
  const glowClass = color === "green" ? "glow-green" : color === "blue" ? "glow-blue" : "glow-pink"
  const iconColor = color === "green" ? "text-primary" : color === "blue" ? "text-secondary" : "text-accent"

  return (
    <div className={`glass border border-border rounded-lg p-6 hover:${glowClass} transition-all duration-300`}>
      <div className={`${iconColor} mb-4`}>{icon}</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
