// app/dashboard/threat-intel/hybridanalysis/page.tsx
'use client';

import { HAScanner } from '@/components/threat-intel/HAScanner';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
import { Cpu, Shield, AlertTriangle, FileText, Database, Globe, Users } from 'lucide-react';

export default function HybridAnalysisPage() {
  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <HAScanner />
        
        {/* Information Section */}
        <div className="mt-8 glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            About Hybrid Analysis Integration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-foreground">Sandbox Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Execute files in isolated environments to observe behavior and detect malware.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">Threat Intelligence</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed reports including MITRE ATT&CK techniques, behavioral analysis, and threat scoring.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-secondary" />
                <span className="font-medium text-foreground">File Support</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Windows executables, documents, scripts, archives, and various file formats.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Real-time Feed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Access to the latest malware detections and threat intelligence feed.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">1.</span>
                <span>Get a free Hybrid Analysis API key from <a href="https://www.hybrid-analysis.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">their website</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">2.</span>
                <span>Add <code className="bg-muted px-1 rounded font-mono">NEXT_PUBLIC_HYBRID_ANALYSIS_API_KEY=your_key_here</code> to your <code className="bg-muted px-1 rounded font-mono">.env.local</code> file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">3.</span>
                <span>Upload files or enter hashes to start analyzing with the sandbox</span>
              </li>
            </ol>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Supported Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">File Analysis</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                  <li>• Hash lookups (MD5, SHA1, SHA256, SHA512)</li>
                  <li>• File upload with automatic hash calculation</li>
                  <li>• Detailed behavioral analysis</li>
                  <li>• MITRE ATT&CK mapping</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Threat Intelligence</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                  <li>• Latest threat feed</li>
                  <li>• Sandbox environment analysis</li>
                  <li>• Network indicators extraction</li>
                  <li>• Static and dynamic analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}