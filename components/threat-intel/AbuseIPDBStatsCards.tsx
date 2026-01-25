// components/threat-intel/AbuseIPDBStatsCards.tsx - PROPER FIX
'use client';

import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  BarChart3, 
  Users, 
  Database, 
  History 
} from 'lucide-react';

interface AbuseIPDBStatsCardsProps {
  results: Array<{ found: boolean; country?: string }>;
  blacklist: Array<{ country?: string }>;
  history: Array<{
    found: boolean;
    country?: string;
    confidence_score?: number;
    threat_level?: string;
    result?: { total_reports?: number; isp?: string };
  }>;
}

export function AbuseIPDBStatsCards({ results, blacklist, history }: AbuseIPDBStatsCardsProps) {
  // Count unique countries from ALL data sources
  const getUniqueCountries = () => {
    const allCountries: string[] = [];
    
    // 1. From history (where country is at top level: item.country)
    history.forEach(item => {
      if (item.found && item.country && item.country !== 'Unknown') {
        allCountries.push(item.country);
      }
    });
    
    // 2. From current results
    results.forEach(item => {
      if (item.found && item.country && item.country !== 'Unknown') {
        allCountries.push(item.country);
      }
    });
    
    // 3. From blacklist
    blacklist.forEach(item => {
      if (item.country && item.country !== 'Unknown') {
        allCountries.push(item.country);
      }
    });
    
    // Remove duplicates and count
    return new Set(allCountries.filter(Boolean)).size;
  };

  // Calculate all stats
  const stats = {
    totalChecks: history.length,
    highRiskCount: history.filter(h => h.threat_level === 'high').length,
    uniqueCountries: getUniqueCountries(),
    avgConfidence: history.length > 0 
      ? history.reduce((sum, h) => sum + (h.confidence_score || 0), 0) / history.length 
      : 0,
    totalReports: history.reduce((sum, h) => sum + (h.result?.total_reports || 0), 0),
    ispCount: new Set(
      history
        .filter(h => h.found && h.result?.isp)
        .map(h => h.result!.isp)
    ).size,
    blacklistCount: blacklist.length,
    cacheHits: results.filter(r => r.found).length
  };

  const cardData = [
    {
      icon: History,
      label: 'Total Checks',
      value: stats.totalChecks,
      description: 'Historical searches',
      color: 'blue' as const,
      trend: 'Persistent'
    },
    {
      icon: AlertTriangle,
      label: 'High Risk',
      value: stats.highRiskCount,
      description: 'History items',
      color: 'pink' as const,
      trend: stats.highRiskCount > 0 ? 'Active threats' : 'Clean'
    },
    {
      icon: Database,
      label: 'Blacklist',
      value: stats.blacklistCount,
      description: 'High-risk IPs',
      color: 'orange' as const,
      trend: 'Cached'
    },
    {
      icon: Globe,
      label: 'Countries',
      value: stats.uniqueCountries,
      description: 'Unique locations',
      color: 'green' as const,
      trend: stats.uniqueCountries > 0 ? `${stats.uniqueCountries} countries` : 'No data'
    },
    {
      icon: BarChart3,
      label: 'Avg Confidence',
      value: `${stats.avgConfidence.toFixed(1)}%`,
      description: 'Average score',
      color: 'accent' as const,
      trend: `${stats.avgConfidence > 50 ? 'High' : 'Low'} risk`
    },
    {
      icon: Users,
      label: 'Total Reports',
      value: stats.totalReports,
      description: 'Across all IPs',
      color: 'purple' as const,
      trend: 'Community data'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
      pink: 'text-pink-500 border-pink-500/20 bg-pink-500/5',
      green: 'text-primary border-primary/20 bg-primary/5',
      accent: 'text-accent border-accent/20 bg-accent/5',
      purple: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
      orange: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    };
    return colorMap[color] || 'text-primary border-primary/20 bg-primary/5';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        
        return (
          <div
            key={index}
            className={`glass border rounded-xl p-4 transition-all duration-300 ${colorClasses} hover:scale-[1.02]`}
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
              <p className="text-2xl font-bold">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
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