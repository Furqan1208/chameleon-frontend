// D:\FYP\Chameleon Frontend\components\threat-intel\OTXStatsCards.tsx

'use client';

import { 
  Activity, 
  AlertTriangle, 
  Globe, 
  BarChart3, 
  Database, 
  Users, 
  Shield, 
  Network,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  FileText,
  Link as LinkIcon,
  PieChart,
  Cpu,
  Layers
} from 'lucide-react';
import type { OTXResult, OTXScanHistory } from '@/lib/threat-intel/otx-types';
import { useMemo } from 'react';

interface OTXStatsCardsProps {
  results: OTXResult[];
  history: OTXScanHistory[];
}

interface OTXStats {
  totalScans: number;
  uniqueScans: number;
  highRiskScans: number;
  mediumRiskScans: number;
  lowRiskScans: number;
  cleanScans: number;
  avgThreatScore: number;
  totalPulses: number;
  totalMalware: number;
  totalURLs: number;
  totalDNSRecords: number;
  detectionRate: number;
  recentActivity: number;
  topIndicatorType: string;
  pulseGrowth: number;
}

export function OTXStatsCards({ results, history }: OTXStatsCardsProps) {
  const stats = useMemo(() => {
    const allResults = [
      ...history.map(h => h.result),
      ...results
    ];

    if (allResults.length === 0) {
      return {
        totalScans: 0,
        uniqueScans: 0,
        highRiskScans: 0,
        mediumRiskScans: 0,
        lowRiskScans: 0,
        cleanScans: 0,
        avgThreatScore: 0,
        totalPulses: 0,
        totalMalware: 0,
        totalURLs: 0,
        totalDNSRecords: 0,
        detectionRate: 0,
        recentActivity: 0,
        topIndicatorType: 'None',
        pulseGrowth: 0
      };
    }

    const uniqueResultsMap = new Map<string, OTXResult>();
    [...allResults].reverse().forEach(result => {
      if (!uniqueResultsMap.has(result.ioc)) {
        uniqueResultsMap.set(result.ioc, result);
      }
    });
    const uniqueResults = Array.from(uniqueResultsMap.values());

    const highRiskScans = uniqueResults.filter(r => r.threat_level === 'high').length;
    const mediumRiskScans = uniqueResults.filter(r => r.threat_level === 'medium').length;
    const lowRiskScans = uniqueResults.filter(r => r.threat_level === 'low').length;
    const cleanScans = uniqueResults.filter(r => r.threat_level === 'clean').length;
    const totalScans = allResults.length;
    const uniqueScans = uniqueResults.length;
    
    const totalPulses = uniqueResults.reduce((sum, r) => sum + r.pulse_count, 0);
    const totalMalware = uniqueResults.reduce((sum, r) => sum + r.malware_count, 0);
    const totalURLs = uniqueResults.reduce((sum, r) => sum + r.url_count, 0);
    const totalDNSRecords = uniqueResults.reduce((sum, r) => sum + r.passive_dns_count, 0);
    
    const avgThreatScore = uniqueResults.length > 0 
      ? Number((uniqueResults.reduce((sum, r) => sum + r.threat_score, 0) / uniqueResults.length).toFixed(1))
      : 0;
    
    const detectionRate = uniqueScans > 0 
      ? Number(((highRiskScans + mediumRiskScans) / uniqueScans * 100).toFixed(1))
      : 0;

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const recentActivity = allResults.filter(r => {
      try {
        const scanDate = new Date(r.timestamp);
        return scanDate > twentyFourHoursAgo;
      } catch {
        return false;
      }
    }).length;

    const indicatorTypeCounts = uniqueResults.reduce((acc, result) => {
      const type = result.ioc_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIndicatorType = Object.entries(indicatorTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    let pulseGrowth = 0;
    if (history.length >= 2) {
      const sortedHistory = [...history].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const firstHalf = sortedHistory.slice(0, Math.floor(sortedHistory.length / 2));
      const secondHalf = sortedHistory.slice(Math.floor(sortedHistory.length / 2));
      
      const firstHalfPulses = firstHalf.reduce((sum, scan) => sum + scan.result.pulse_count, 0);
      const secondHalfPulses = secondHalf.reduce((sum, scan) => sum + scan.result.pulse_count, 0);
      
      if (firstHalfPulses > 0) {
        pulseGrowth = Number(((secondHalfPulses - firstHalfPulses) / firstHalfPulses * 100).toFixed(1));
      }
    }

    return {
      totalScans,
      uniqueScans,
      highRiskScans,
      mediumRiskScans,
      lowRiskScans,
      cleanScans,
      avgThreatScore,
      totalPulses,
      totalMalware,
      totalURLs,
      totalDNSRecords,
      detectionRate,
      recentActivity,
      topIndicatorType,
      pulseGrowth
    };
  }, [results, history]);

  const getThreatScoreColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 50) return 'text-accent';
    if (score >= 30) return 'text-yellow-500';
    if (score >= 10) return 'text-orange-500';
    return 'text-green-500';
  };

  const getThreatScoreLabel = (score: number) => {
    if (score >= 70) return 'Very High';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Medium';
    if (score >= 10) return 'Low';
    return 'Very Low';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 20) return 'text-destructive';
    if (growth > 10) return 'text-accent';
    if (growth > 0) return 'text-yellow-500';
    if (growth < -10) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-3 h-3" />;
    if (growth < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  const getIndicatorTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('ip')) return <Network className="w-4 h-4" />;
    if (lowerType.includes('domain') || lowerType.includes('hostname')) return <Globe className="w-4 h-4" />;
    if (lowerType.includes('url')) return <LinkIcon className="w-4 h-4" />;
    if (lowerType.includes('file') || lowerType.includes('hash')) return <FileText className="w-4 h-4" />;
    return <Cpu className="w-4 h-4" />;
  };

  // Reduced to 6 main cards instead of 8
  const cardData = [
    {
      id: 'total-scans',
      icon: Database,
      label: 'Total Scans',
      value: stats.totalScans.toString(),
      description: 'All scan requests',
      color: 'blue',
      trend: `Unique: ${stats.uniqueScans}`,
      showTrend: true
    },
    {
      id: 'threat-score',
      icon: BarChart3,
      label: 'Threat Score',
      value: stats.avgThreatScore.toFixed(1),
      description: 'Average score',
      color: 'score',
      trend: getThreatScoreLabel(stats.avgThreatScore),
      showTrend: true
    },
    {
      id: 'pulses',
      icon: Activity,
      label: 'Total Pulses',
      value: stats.totalPulses.toString(),
      description: 'Threat intelligence',
      color: 'orange',
      trend: stats.pulseGrowth !== 0 ? (
        <span className={`flex items-center gap-1 ${getGrowthColor(stats.pulseGrowth)}`}>
          {getGrowthIcon(stats.pulseGrowth)}
          {stats.pulseGrowth > 0 ? '+' : ''}{stats.pulseGrowth}%
        </span>
      ) : 'No change',
      showTrend: stats.pulseGrowth !== 0
    },
    {
      id: 'detection-rate',
      icon: Shield,
      label: 'Detection Rate',
      value: `${stats.detectionRate}%`,
      description: 'High/Medium risk',
      color: 'red',
      trend: `${stats.highRiskScans} high, ${stats.mediumRiskScans} medium`,
      showTrend: true
    },
    {
      id: 'malware',
      icon: AlertTriangle,
      label: 'Malware Samples',
      value: stats.totalMalware.toString(),
      description: 'Associated malware',
      color: 'purple',
      trend: stats.totalMalware > 0 ? 'Active threats' : 'Clean',
      showTrend: stats.totalMalware > 0
    },
    {
      id: 'recent-activity',
      icon: Clock,
      label: 'Recent Activity',
      value: stats.recentActivity.toString(),
      description: 'Last 24 hours',
      color: 'green',
      trend: stats.recentActivity > 0 ? 'Active scanning' : 'No recent scans',
      showTrend: stats.recentActivity > 0
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-500 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40';
      case 'orange':
        return 'text-orange-500 border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40';
      case 'red':
        return 'text-destructive border-destructive/20 bg-destructive/5 hover:border-destructive/40';
      case 'purple':
        return 'text-purple-500 border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40';
      case 'green':
        return 'text-green-500 border-green-500/20 bg-green-500/5 hover:border-green-500/40';
      case 'score':
        const scoreColor = getThreatScoreColor(stats.avgThreatScore);
        return `${scoreColor} border-${scoreColor.replace('text-', '')}/20 bg-${scoreColor.replace('text-', '')}/5 hover:border-${scoreColor.replace('text-', '')}/40`;
      default:
        return 'text-orange-500 border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40';
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cardData.map((card) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        const isThreatScoreCard = card.id === 'threat-score';
        const threatScoreColor = isThreatScoreCard ? getThreatScoreColor(stats.avgThreatScore) : '';
        
        return (
          <div
            key={card.id}
            className={`glass border rounded-xl p-4 transition-all duration-300 ${colorClasses} hover:scale-[1.02] hover:shadow-md cursor-pointer group`}
            title={`Click to view ${card.label.toLowerCase()} details`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                colorClasses.includes('text-blue-500') ? 'bg-blue-500/10' :
                colorClasses.includes('text-orange-500') ? 'bg-orange-500/10' :
                colorClasses.includes('text-destructive') ? 'bg-destructive/10' :
                colorClasses.includes('text-purple-500') ? 'bg-purple-500/10' :
                colorClasses.includes('text-green-500') ? 'bg-green-500/10' :
                'bg-orange-500/10'
              } group-hover:bg-opacity-20 transition-all`}>
                <Icon className="w-5 h-5" />
              </div>
              {card.showTrend && (
                <span className="text-xs px-2 py-1 rounded bg-black/5 text-muted-foreground">
                  {card.trend}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${isThreatScoreCard ? threatScoreColor : ''}`}>
                {card.value}
              </p>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>

            {card.id === 'detection-rate' && stats.detectionRate > 0 && (
              <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stats.detectionRate > 50 ? 'bg-destructive' : 'bg-accent'} transition-all duration-500`}
                  style={{ width: `${Math.min(stats.detectionRate, 100)}%` }}
                />
              </div>
            )}

            {card.id === 'recent-activity' && stats.recentActivity > 0 && (
              <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Active now</span>
              </div>
            )}

            {card.id === 'malware' && stats.totalMalware > 0 && (
              <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Threat detected</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}