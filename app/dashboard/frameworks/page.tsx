"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, MapPin, Database, Zap, ChevronRight } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function FrameworksIndex() {
  const frameworks = [
    {
      id: 'mitre-attack',
      name: 'MITRE ATT&CK',
      description: 'A globally accessible knowledge base of adversary tactics and techniques based on real-world observations.',
      icon: Shield,
      color: 'from-primary to-primary/50',
      href: '/dashboard/frameworks/mitre-attack',
      features: ['Enterprise', 'Mobile', 'ICS', 'Cloud'],
    },
  ]

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
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">Threat Frameworks</h1>
          <p className="text-muted-foreground text-lg">
            Explore standardized frameworks for understanding and categorizing cyber threats and adversary techniques.
          </p>
        </motion.div>

        {/* Frameworks Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {frameworks.map((framework) => {
            const IconComponent = framework.icon
            return (
              <motion.div key={framework.id} variants={itemVariants}>
                <Link href={framework.href}>
                  <div className="h-full bg-card hover:bg-card/80 border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer group">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-br ${framework.color} p-3 rounded-lg transform group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-2">{framework.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {framework.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {framework.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/30"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="bg-card border border-border rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            What are Threat Frameworks?
          </h2>
          <p className="text-muted-foreground mb-4">
            Threat frameworks are structured approaches to understanding, categorizing, and responding to cyber threats. They help security teams:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Identify and understand adversary tactics and techniques</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Assess security controls and coverage gaps</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Communicate threat scenarios and priorities</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Align defenses with real-world attack patterns</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
