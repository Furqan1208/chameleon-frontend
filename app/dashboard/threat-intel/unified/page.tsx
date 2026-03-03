// app/dashboard/threat-intel/unified/page.tsx
'use client';

import { UnifiedScanner } from '@/components/threat-intel/UnifiedScanner';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
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
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function UnifiedThreatIntelPage() {
  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/dashboard/threat-intel" className="hover:text-foreground transition-colors">
              Threat Intelligence
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Unified Scanner</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Zap className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Unified Threat Intelligence</h1>
              <p className="text-muted-foreground mt-1">
                Search across 7 threat intelligence platforms simultaneously
              </p>
            </div>
          </div>
        </div>

        {/* Main Scanner Component */}
        <UnifiedScanner />

        {/* Information Section */}
        <div className="mt-8 glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            About Unified Threat Intelligence
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Features */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ServiceBadge
                  name="VirusTotal"
                  icon={<Shield className="w-4 h-4" />}
                  color="blue"
                  types={['IP', 'Domain', 'URL', 'Hash']}
                />
                <ServiceBadge
                  name="MalwareBazaar"
                  icon={<Database className="w-4 h-4" />}
                  color="purple"
                  types={['Hash', 'Tag']}
                />
                <ServiceBadge
                  name="HybridAnalysis"
                  icon={<Cpu className="w-4 h-4" />}
                  color="orange"
                  types={['Hash', 'File']}
                />
                <ServiceBadge
                  name="Filescan.io"
                  icon={<Cpu className="w-4 h-4" />}
                  color="green"
                  types={['File', 'URL']}
                />
                <ServiceBadge
                  name="AlienVault OTX"
                  icon={<Globe className="w-4 h-4" />}
                  color="pink"
                  types={['IP', 'Domain', 'URL', 'Hash']}
                />
                <ServiceBadge
                  name="AbuseIPDB"
                  icon={<AlertTriangle className="w-4 h-4" />}
                  color="red"
                  types={['IP']}
                />
                <ServiceBadge
                  name="ThreatFox"
                  icon={<AlertTriangle className="w-4 h-4" />}
                  color="yellow"
                  types={['IP', 'Domain', 'URL', 'Hash', 'Tag']}
                />
              </div>

              {/* How It Works */}
              <div>
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StepCard
                    number="1"
                    title="Smart Detection"
                    description="Automatically detects if input is IP, domain, URL, hash, or tag"
                    icon={<Cpu className="w-5 h-5" />}
                  />
                  <StepCard
                    number="2"
                    title="Parallel Search"
                    description="Queries all relevant services simultaneously for fast results"
                    icon={<Layers className="w-5 h-5" />}
                  />
                  <StepCard
                    number="3"
                    title="Unified View"
                    description="Aggregates results with threat scoring and filtering"
                    icon={<Shield className="w-5 h-5" />}
                  />
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  Common Use Cases
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <UseCaseCard
                    title="Incident Response"
                    description="Quickly check IOCs across multiple sources during investigations"
                    icon={<AlertTriangle className="w-4 h-4" />}
                  />
                  <UseCaseCard
                    title="Threat Hunting"
                    description="Search for indicators across threat intelligence feeds"
                    icon={<Search className="w-4 h-4" />}
                  />
                  <UseCaseCard
                    title="Malware Analysis"
                    description="Upload suspicious files for multi-sandbox analysis"
                    icon={<Cpu className="w-4 h-4" />}
                  />
                  <UseCaseCard
                    title="Security Monitoring"
                    description="Validate alerts by checking IPs and domains against multiple sources"
                    icon={<Shield className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Status & Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Service Status */}
              <div className="p-4 border border-border rounded-lg bg-muted/5">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Service Status
                </h3>
                <div className="space-y-2">
                  <StatusRow service="VirusTotal" status="operational" limits="4/min" />
                  <StatusRow service="MalwareBazaar" status="operational" limits="120/hr" />
                  <StatusRow service="HybridAnalysis" status="operational" limits="10/min" />
                  <StatusRow service="Filescan.io" status="operational" limits="10/min" />
                  <StatusRow service="AlienVault OTX" status="operational" limits="10/min" />
                  <StatusRow service="AbuseIPDB" status="operational" limits="1000/day" />
                  <StatusRow service="ThreatFox" status="operational" limits="120/hr" />
                </div>
              </div>

              {/* Quick Tips */}
              <div className="p-4 border border-border rounded-lg bg-muted/5">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Pro Tips
                </h3>
                <ul className="space-y-2 text-sm">
                  <TipItem text="Use hash lookups for fastest results across all services" />
                  <TipItem text="Filter by 'malicious' to focus on confirmed threats" />
                  <TipItem text="Upload suspicious files for deep sandbox analysis" />
                  <TipItem text="Check tags like 'TrickBot' to find related malware" />
                  <TipItem text="Results are cached for 5 minutes to save API calls" />
                </ul>
              </div>

              {/* Resources */}
              <div className="p-4 border border-border rounded-lg bg-muted/5">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Resources
                </h3>
                <div className="space-y-2">
                  <ResourceLink
                    href="https://www.virustotal.com"
                    label="VirusTotal"
                    icon={<ExternalLink className="w-3 h-3" />}
                  />
                  <ResourceLink
                    href="https://bazaar.abuse.ch"
                    label="MalwareBazaar"
                    icon={<ExternalLink className="w-3 h-3" />}
                  />
                  <ResourceLink
                    href="https://www.hybrid-analysis.com"
                    label="Hybrid Analysis"
                    icon={<ExternalLink className="w-3 h-3" />}
                  />
                  <ResourceLink
                    href="https://otx.alienvault.com"
                    label="AlienVault OTX"
                    icon={<ExternalLink className="w-3 h-3" />}
                  />
                </div>
              </div>

              {/* API Key Status */}
              <div className="p-4 border border-border rounded-lg bg-muted/5">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-500" />
                  API Keys
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Configure API keys in your .env.local file for higher rate limits
                </p>
                <div className="space-y-1 text-xs font-mono bg-muted/20 p-2 rounded text-foreground">
                  <div>NEXT_PUBLIC_VIRUSTOTAL_API_KEY=xxx</div>
                  <div>NEXT_PUBLIC_ABUSEIPDB_API_KEY=xxx</div>
                  <div>NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY=xxx</div>
                  <div>NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY=xxx</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Examples */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Test with Real Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TestExample
                label="EICAR Test File Hash"
                value="275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"
                type="Malicious"
              />
              <TestExample
                label="Google DNS"
                value="8.8.8.8"
                type="Clean"
              />
              <TestExample
                label="Malware Tag"
                value="TrickBot"
                type="Malicious"
              />
              <TestExample
                label="Suspicious Domain"
                value="malware-test-domain.com"
                type="Unknown"
              />
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Unified Threat Intelligence combines data from 7 sources to give you comprehensive visibility.
              Results may vary based on API availability and rate limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function ServiceBadge({ name, icon, color, types }: { name: string; icon: React.ReactNode; color: string; types: string[] }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  };

  return (
    <div className={`p-3 border rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium text-sm">{name}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {types.map((type, idx) => (
          <span key={idx} className="text-xs px-1.5 py-0.5 bg-muted/20 text-muted-foreground rounded">
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative p-4 border border-border rounded-lg bg-muted/5">
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-background text-xs font-bold">
        {number}
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-indigo-500">{icon}</div>
          <h4 className="font-medium text-foreground text-sm">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 border border-border rounded-lg hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors">
      <div className="flex items-start gap-2">
        <div className="text-indigo-500 mt-0.5">{icon}</div>
        <div>
          <h4 className="font-medium text-foreground text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ service, status, limits }: { service: string; status: string; limits: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-foreground">{service}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{limits}</span>
        {status === 'operational' ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : status === 'degraded' ? (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <Sparkles className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
      <span className="text-xs text-muted-foreground">{text}</span>
    </li>
  );
}

function ResourceLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-lg transition-colors text-sm"
    >
      <span>{label}</span>
      {icon}
    </a>
  );
}

function TestExample({ label, value, type }: { label: string; value: string; type: string }) {
  const typeColors = {
    Malicious: 'text-red-500 bg-red-500/10',
    Clean: 'text-green-500 bg-green-500/10',
    Unknown: 'text-yellow-500 bg-yellow-500/10'
  };

  return (
    <div className="p-3 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[type as keyof typeof typeColors]}`}>
          {type}
        </span>
      </div>
      <code className="text-xs font-mono text-foreground break-all">{value}</code>
    </div>
  );
}