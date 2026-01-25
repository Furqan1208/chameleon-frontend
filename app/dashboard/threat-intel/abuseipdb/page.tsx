// app/dashboard/threat-intel/abuseipdb/page.tsx
'use client';

import { AbuseIPDBScanner } from '@/components/threat-intel/AbuseIPDBScanner';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
import { Shield, AlertTriangle, Globe, Users, Flag, Building, Cpu } from 'lucide-react';

export default function AbuseIPDBPage() {
  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <AbuseIPDBScanner />
        
        {/* Information Section */}
        <div className="mt-8 glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            About AbuseIPDB Integration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-foreground">Free Tier</span>
              </div>
              <p className="text-sm text-muted-foreground">
                1,000 requests per day. Perfect for security monitoring.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">Confidence Scoring</span>
              </div>
              <p className="text-sm text-muted-foreground">
                0-100% confidence score based on community reports and analysis.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span className="font-medium text-foreground">Community Reports</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real abuse reports from security professionals and researchers.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Geolocation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Country, ISP, and usage type information for each IP.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">1.</span>
                <span>Get a free AbuseIPDB API key from <a href="https://www.abuseipdb.com/register" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">their website</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">2.</span>
                <span>Add <code className="bg-muted px-1 rounded font-mono">NEXT_PUBLIC_ABUSEIPDB_API_KEY=your_key_here</code> to your <code className="bg-muted px-1 rounded font-mono">.env.local</code> file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">3.</span>
                <span>Start checking IPs in the scanner above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">4.</span>
                <span>Use the blacklist feature to get high-risk IPs for monitoring</span>
              </li>
            </ol>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
                  <Flag className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Country Information</p>
                  <p className="text-sm text-muted-foreground">
                    Geolocation data including country code and name
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
                  <Building className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">ISP Details</p>
                  <p className="text-sm text-muted-foreground">
                    Internet Service Provider information and domain
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Category Breakdown</p>
                  <p className="text-sm text-muted-foreground">
                    23 different abuse categories with detailed breakdown
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Community Reports</p>
                  <p className="text-sm text-muted-foreground">
                    View actual abuse reports with comments and timestamps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}