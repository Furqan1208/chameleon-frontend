// components/threat-intel/MBStatsCards.tsx - FIXED VERSION
'use client';

import { Database, Tag, Shield, TrendingUp, Users, Globe } from 'lucide-react';
import type { MBStats, MBScanHistory } from '@/lib/threat-intel/malwarebazaar-types';
import { useState, useEffect } from 'react';

interface MBStatsCardsProps {
  stats: MBStats;
  history: MBScanHistory[];
}

export function MBStatsCards({ stats, history }: MBStatsCardsProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculateDetectionRate = () => {
    if (history.length === 0) return 0;
    const foundSearches = history.filter(h => h.result.found).length;
    return (foundSearches / history.length) * 100;
  };

  const getTopMalwareFamily = () => {
    if (stats.topMalwareFamilies.length === 0) return 'None';
    return stats.topMalwareFamilies[0].signature;
  };

  const cardData = [
    {
      icon: Database,
      label: 'Total Samples',
      value: stats.totalSamples.toLocaleString(),
      description: 'In database',
      color: 'blue',
      trend: 'Growing daily'
    },
    {
      icon: Tag,
      label: 'Tags',
      value: stats.totalTags.toLocaleString(),
      description: 'Malware categories',
      color: 'pink',
      trend: 'Diverse threats'
    },
    {
      icon: Shield,
      label: 'Signatures',
      value: stats.totalSignatures.toLocaleString(),
      description: 'AV signatures',
      color: 'green',
      trend: 'Multiple vendors'
    },
    {
      icon: TrendingUp,
      label: 'Detection Rate',
      value: `${calculateDetectionRate().toFixed(1)}%`,
      description: 'Your searches',
      color: 'accent',
      trend: history.length > 0 ? 'Based on history' : 'No data'
    },
    {
      icon: Users,
      label: 'Top Family',
      value: getTopMalwareFamily(),
      description: 'Most common',
      color: 'orange',
      trend: 'Active threat'
    },
    {
      icon: Globe,
      label: 'Recent Threats',
      value: stats.recentThreats.length,
      description: 'Last 24h',
      color: 'purple',
      trend: 'Fresh samples'
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
      case 'orange':
        return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
      case 'purple':
        return 'text-purple-500 border-purple-500/20 bg-purple-500/5';
      default:
        return 'text-primary border-primary/20 bg-primary/5';
    }
  };

  if (!isClient) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        const isTopFamilyCard = card.label === 'Top Family';
        
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
              <p className={`text-2xl font-bold ${isTopFamilyCard ? 'truncate text-sm' : ''}`}>
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