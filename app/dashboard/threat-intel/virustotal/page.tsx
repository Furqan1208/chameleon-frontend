// app/dashboard/threat-intel/virustotal/page.tsx
'use client';

import { VTScanner } from '@/components/threat-intel/VTScanner';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
import { Shield, AlertTriangle, Globe, Cpu } from 'lucide-react';

export default function VirusTotalPage() {
  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <VTScanner />
        
        {/* Information Section */}
        <div className="mt-8 glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            About VirusTotal Integration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Free Tier</span>
              </div>
              <p className="text-sm text-muted-foreground">
                4 requests per minute, no daily limits. Perfect for occasional scans.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">Threat Detection</span>
              </div>
              <p className="text-sm text-muted-foreground">
                70+ antivirus engines, behavioral analysis, sandbox results, and threat scoring.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-secondary" />
                <span className="font-medium text-foreground">IOC Types</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hashes (MD5, SHA1, SHA256), IP addresses, domains, URLs, and file names.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Caching</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Results cached locally for 1 hour. History saved in browser storage.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">1.</span>
                <span>Get a free VirusTotal API key from <a href="https://www.virustotal.com/gui/join-us" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">their website</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">2.</span>
                <span>Add <code className="bg-muted px-1 rounded font-mono">NEXT_PUBLIC_VIRUSTOTAL_API_KEY=your_key_here</code> to your <code className="bg-muted px-1 rounded font-mono">.env.local</code> file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">3.</span>
                <span>Start scanning indicators in the search bar above</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}