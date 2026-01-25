// components/threat-intel/HAStatsCards.tsx
'use client';

import { Cpu, AlertTriangle, Shield, BarChart3, Database, Flame, Target, Zap, Users, FileText } from 'lucide-react';
import type { HAAnalysisResult, HAThreatFeedItem } from '@/lib/threat-intel/ha-types';

interface HAStatsCardsProps {
  results: HAAnalysisResult[];
  threatFeed: HAThreatFeedItem[];
}

export function HAStatsCards({ results, threatFeed }: HAStatsCardsProps) {
  // Calculate stats from results and threat feed
  const calculateStats = () => {
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.sha256 === result.sha256)
    );

    const maliciousResults = uniqueResults.filter(r => r.threat_level === 'malicious');
    const suspiciousResults = uniqueResults.filter(r => r.threat_level === 'suspicious');
    const cleanResults = uniqueResults.filter(r => r.threat_level === 'whitelisted');
    
    const totalScans = uniqueResults.length;
    const avgThreatScore = totalScans > 0 
      ? uniqueResults.reduce((sum, r) => sum + r.threat_score_computed, 0) / totalScans 
      : 0;
    
    const detectionRate = totalScans > 0
      ? ((maliciousResults.length + suspiciousResults.length) / totalScans) * 100
      : 0;

    // Threat feed stats
    const maliciousThreats = threatFeed.filter(t => t.verdict === 60).length;
    const suspiciousThreats = threatFeed.filter(t => t.verdict === 50).length;
    const totalThreats = threatFeed.length;

    // File type distribution
    const fileTypes = results.reduce((acc, result) => {
      const type = result.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFileType = Object.entries(fileTypes).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    return {
      totalScans,
      maliciousCount: maliciousResults.length,
      suspiciousCount: suspiciousResults.length,
      cleanCount: cleanResults.length,
      avgThreatScore,
      detectionRate,
      threatFeedStats: {
        total: totalThreats,
        malicious: maliciousThreats,
        suspicious: suspiciousThreats
      },
      topFileType: {
        name: topFileType[0],
        count: topFileType[1]
      }
    };
  };

  const stats = calculateStats();

  const getThreatScoreColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 50) return 'text-accent';
    if (score >= 30) return 'text-yellow-500';
    if (score >= 10) return 'text-primary';
    return 'text-green-500';
  };

  const getThreatScoreLabel = (score: number) => {
    if (score >= 70) return 'Very High';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    if (score >= 10) return 'Low';
    return 'Very Low';
  };

  const cardData = [
    {
      icon: Database,
      label: 'Total Scans',
      value: stats.totalScans.toString(),
      description: 'Unique files analyzed',
      color: 'purple',
      trend: stats.totalScans > 0 ? `${stats.totalScans} files` : 'No scans'
    },
    {
      icon: AlertTriangle,
      label: 'Malicious',
      value: stats.maliciousCount.toString(),
      description: 'Confirmed threats',
      color: 'destructive',
      trend: stats.maliciousCount > 0 ? 'Active threats' : 'Clean'
    },
    {
      icon: Shield,
      label: 'Threat Score',
      value: stats.avgThreatScore.toFixed(1),
      description: 'Average score',
      color: 'green',
      trend: getThreatScoreLabel(stats.avgThreatScore)
    },
    {
      icon: BarChart3,
      label: 'Detection Rate',
      value: `${stats.detectionRate.toFixed(1)}%`,
      description: 'Malicious/suspicious rate',
      color: 'accent',
      trend: stats.totalScans > 0 ? 'Across scans' : 'No data'
    },
    {
      icon: Flame,
      label: 'Latest Threats',
      value: stats.threatFeedStats.total.toString(),
      description: 'Recent detections',
      color: 'orange',
      trend: `${stats.threatFeedStats.malicious} malicious`
    },
    {
      icon: FileText,
      label: 'Top File Type',
      value: stats.topFileType.name,
      description: `${stats.topFileType.count} files`,
      color: 'blue',
      trend: 'Most common'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'text-purple-500 border-purple-500/20 bg-purple-500/5';
      case 'destructive':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      case 'green':
        return 'text-green-500 border-green-500/20 bg-green-500/5';
      case 'accent':
        return 'text-accent border-accent/20 bg-accent/5';
      case 'orange':
        return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
      case 'blue':
        return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      default:
        return 'text-primary border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        
        // Special styling for threat score card
        const isThreatScoreCard = card.label === 'Threat Score';
        const threatScoreColor = isThreatScoreCard ? getThreatScoreColor(stats.avgThreatScore) : '';
        
        return (
          <div
            key={index}
            className={`glass border rounded-xl p-4 transition-all duration-300 ${colorClasses} hover:scale-[1.02] hover:shadow-lg ${
              isThreatScoreCard ? 'hover:glow-green' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${colorClasses.split(' ')[0].replace('text-', 'bg-')} bg-opacity-10`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                isThreatScoreCard 
                  ? `${threatScoreColor}/20 ${threatScoreColor}`
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {card.trend}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${isThreatScoreCard ? threatScoreColor : ''}`}>
                {card.value}
              </p>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}