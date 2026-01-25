'use client';

import { OTXScanner } from '@/components/threat-intel/OTXScanner';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
import { 
  Globe, 
  AlertTriangle, 
  Shield, 
  Users, 
  Database, 
  Network, 
  Link as LinkIcon,
  FileText,
  Lock,
  Activity,
  TrendingUp,
  BarChart3,
  Cpu
} from 'lucide-react';

export default function AlienVaultOTXPage() {
  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <OTXScanner />
        
        {/* Information Section */}
        <div className="mt-8 glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-500" />
            About AlienVault OTX Integration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-foreground">Free Access</span>
              </div>
              <p className="text-sm text-muted-foreground">
                10 requests per minute, unlimited daily usage. Community-driven threat intelligence.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">Threat Intelligence</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Access to millions of threat indicators, malware samples, attack patterns, and IoCs.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-foreground">IOC Types</span>
              </div>
              <p className="text-sm text-muted-foreground">
                IPs, domains, URLs, file hashes, CVEs, hostnames, email addresses, and more.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-foreground">Pulse System</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Community-created threat intelligence collections with attribution and context.
              </p>
            </div>
          </div>

          {/* Supported IOC Types */}
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">Supported Indicator Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
              <IndicatorTypeCard 
                icon={<Network className="w-4 h-4" />}
                label="IPv4"
                description="IP addresses"
              />
              <IndicatorTypeCard 
                icon={<Network className="w-4 h-4" />}
                label="IPv6"
                description="IPv6 addresses"
              />
              <IndicatorTypeCard 
                icon={<Globe className="w-4 h-4" />}
                label="Domain"
                description="Domain names"
              />
              <IndicatorTypeCard 
                icon={<LinkIcon className="w-4 h-4" />}
                label="URL"
                description="Full URLs"
              />
              <IndicatorTypeCard 
                icon={<FileText className="w-4 h-4" />}
                label="File Hash"
                description="MD5, SHA1, SHA256"
              />
              <IndicatorTypeCard 
                icon={<Globe className="w-4 h-4" />}
                label="Hostname"
                description="Fully qualified domain names"
              />
              <IndicatorTypeCard 
                icon={<Lock className="w-4 h-4" />}
                label="CVE"
                description="CVE identifiers"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">1.</span>
                <span>Get a free AlienVault OTX API key from <a href="https://otx.alienvault.com/api" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">their website</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">2.</span>
                <span>Add <code className="bg-muted px-1 rounded font-mono">NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY=your_key_here</code> to your <code className="bg-muted px-1 rounded font-mono">.env.local</code> file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">3.</span>
                <span>Start scanning indicators in the search bar above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">4.</span>
                <span>Explore threat intelligence pulses and community data</span>
              </li>
            </ol>
          </div>

          {/* Key Features */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-foreground">Real-time Threat Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access to real-time threat intelligence from a global community of security researchers and professionals.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-foreground">Community-Driven</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Benefit from the collective intelligence of thousands of security professionals sharing threat data.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-foreground">Historical Context</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  View historical threat data, including when indicators were first and last seen in the wild.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-foreground">Advanced Analytics</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Threat scoring, reputation analysis, and relationship mapping between different indicators.
                </p>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Usage Tips</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                <span><strong>Pulse Count:</strong> Higher pulse counts indicate more threat intelligence reports mentioning the indicator.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                <span><strong>Threat Score:</strong> Scores above 70 indicate high-risk indicators, while scores below 10 are typically clean.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                <span><strong>Historical Scans:</strong> Previous scan results are cached for 30 minutes to optimize performance.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                <span><strong>Rate Limits:</strong> Respect the 10 requests per minute limit to avoid being throttled.</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <a
                href="https://otx.alienvault.com/api"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-border rounded-lg hover:border-orange-500 hover:bg-orange-500/5 transition-colors"
              >
                <div className="font-medium text-foreground mb-1">OTX API Documentation</div>
                <div className="text-muted-foreground">Complete API reference and usage examples</div>
              </a>
              <a
                href="https://otx.alienvault.com/browse/pulses"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-border rounded-lg hover:border-orange-500 hover:bg-orange-500/5 transition-colors"
              >
                <div className="font-medium text-foreground mb-1">Browse Pulses</div>
                <div className="text-muted-foreground">Explore community threat intelligence collections</div>
              </a>
              <a
                href="https://github.com/AlienVault-OTX/OTX-Python-SDK"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-border rounded-lg hover:border-orange-500 hover:bg-orange-500/5 transition-colors"
              >
                <div className="font-medium text-foreground mb-1">Python SDK</div>
                <div className="text-muted-foreground">Official Python client for OTX API</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component
function IndicatorTypeCard({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <div className="p-3 border border-border rounded-lg text-center hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors">
      <div className="flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="font-medium text-foreground text-sm">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
}