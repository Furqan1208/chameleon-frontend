// components/threat-intel/VTStatsCards.tsx
'use client';

import { Shield, AlertTriangle, CheckCircle, Globe, FileText, BarChart3 } from 'lucide-react';
import type { VTAnalysisResult, VTScanHistory } from '@/lib/threat-intel/vt-types';

interface VTStatsCardsProps {
  results: VTAnalysisResult[];
  history: VTScanHistory[];
}

export function VTStatsCards({ results, history }: VTStatsCardsProps) {
  const stats = {
    totalScans: history.length,
    maliciousCount: results.filter(r => r.threat_level === 'high').length,
    suspiciousCount: results.filter(r => r.threat_level === 'medium').length,
    cleanCount: results.filter(r => r.threat_level === 'clean').length,
    avgThreatScore: results.length > 0 
      ? results.reduce((sum, r) => sum + r.threat_score, 0) / results.length 
      : 0
  };

  const cardData = [
    {
      icon: Shield,
      label: 'Total Scans',
      value: stats.totalScans.toString(),
      description: 'Historical scans',
      color: 'blue',
      trend: '+12%'
    },
    {
      icon: AlertTriangle,
      label: 'Malicious',
      value: stats.maliciousCount.toString(),
      description: 'High threat detections',
      color: 'pink',
      trend: stats.maliciousCount > 0 ? 'Active threats' : 'Clean'
    },
    {
      icon: Globe,
      label: 'Threat Score',
      value: stats.avgThreatScore.toFixed(1),
      description: 'Average score',
      color: 'green',
      trend: `${stats.avgThreatScore > 50 ? 'High' : 'Low'} risk`
    },
    {
      icon: BarChart3,
      label: 'Detection Rate',
      value: results.length > 0 
        ? `${((stats.maliciousCount + stats.suspiciousCount) / results.length * 100).toFixed(1)}%`
        : '0%',
      description: 'Malicious/suspicious rate',
      color: 'accent',
      trend: results.length > 0 ? 'Across scans' : 'No data'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      case 'pink':
        return 'text-pink-500 border-pink-500/20 bg-pink-500/5';
      case 'green':
        return 'text-primary border-primary/20 bg-primary/5';
      case 'accent':
        return 'text-accent border-accent/20 bg-accent/5';
      default:
        return 'text-primary border-primary/20 bg-primary/5';
    }
  };

  const getGlowClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'hover:glow-blue';
      case 'pink':
        return 'hover:glow-pink';
      case 'green':
        return 'hover:glow-green';
      case 'accent':
        return 'hover:glow-green';
      default:
        return 'hover:glow-green';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        const glowClass = getGlowClass(card.color);
        
        return (
          <div
            key={index}
            className={`glass border rounded-xl p-4 transition-all duration-300 ${colorClasses} ${glowClass}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorClasses.split(' ')[0].replace('text-', 'bg-')} bg-opacity-10`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                {card.trend}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}