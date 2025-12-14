// app/dashboard/threat-intel/layout.tsx
'use client';

import { Shield, Globe, Network, Cpu, AlertTriangle, FileText } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const threatIntelSources = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'File hash, IP, domain, URL analysis',
    icon: Shield,
    path: '/dashboard/threat-intel/virustotal',
    color: 'green'
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    description: 'IP reputation and abuse reports',
    icon: Globe,
    path: '/dashboard/threat-intel/abuseipdb',
    color: 'blue',
    comingSoon: true
  },
  {
    id: 'hybridanalysis',
    name: 'Hybrid Analysis',
    description: 'Sandbox malware analysis',
    icon: Cpu,
    path: '/dashboard/threat-intel/hybridanalysis',
    color: 'purple',
    comingSoon: true
  },
  {
    id: 'urlhaus',
    name: 'URLhaus',
    description: 'Malware URL database',
    icon: Network,
    path: '/dashboard/threat-intel/urlhaus',
    color: 'pink',
    comingSoon: true
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    description: 'Open threat intelligence',
    icon: AlertTriangle,
    path: '/dashboard/threat-intel/alienvault',
    color: 'orange',
    comingSoon: true
  },
  {
    id: 'malwarebazaar',
    name: 'MalwareBazaar',
    description: 'Malware sample repository',
    icon: FileText,
    path: '/dashboard/threat-intel/malwarebazaar',
    color: 'red',
    comingSoon: true
  }
];

export default function ThreatIntelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar for threat intel sources */}
      
      
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}