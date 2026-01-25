// D:\FYP\Chameleon Frontend\components\threat-intel\VTStatsCards.tsx - FIXED SCOPE ISSUE
'use client';

import { Shield, AlertTriangle, Globe, BarChart3, Database, History, Users } from 'lucide-react';
import type { VTAnalysisResult, VTScanHistory } from '@/lib/threat-intel/vt-types';

interface VTStatsCardsProps {
  results: VTAnalysisResult[];
  history: VTScanHistory[];
}

export function VTStatsCards({ results, history }: VTStatsCardsProps) {
  // NEW: Get threat score from detection ratio (e.g., "65/76")
  const getThreatScoreFromRatio = (result: VTAnalysisResult): number => {
    if (!result.found || !result.detection_stats) return 0;
    
    // Method 1: Parse from detection_ratio string like "65/76"
    if (result.detection_stats.detection_ratio) {
      const ratio = result.detection_stats.detection_ratio;
      console.log(`[VTStatsCards] Parsing ratio: "${ratio}"`);
      
      // Match patterns like "65/76", "12/25", "0/0"
      const match = ratio.match(/(\d+)\/(\d+)/);
      if (match) {
        const detected = parseInt(match[1]);  // Malicious + Suspicious count
        const total = parseInt(match[2]);     // Total scans
        
        if (total > 0) {
          const score = (detected / total) * 100;
          console.log(`[VTStatsCards] Calculated from ratio: ${detected}/${total} = ${score.toFixed(1)}%`);
          return score;
        }
      }
    }
    
    // Method 2: Calculate from malicious + suspicious counts
    if (result.detection_stats.malicious !== undefined) {
      const malicious = result.detection_stats.malicious || 0;
      const suspicious = result.detection_stats.suspicious || 0;
      const total = result.detection_stats.total || 0;
      
      if (total > 0) {
        // Weighted calculation: malicious = 1.0, suspicious = 0.5
        const score = ((malicious * 1.0) + (suspicious * 0.5)) / total * 100;
        console.log(`[VTStatsCards] Calculated from counts: ${malicious}M + ${suspicious}S / ${total} = ${score.toFixed(1)}%`);
        return score;
      }
    }
    
    // Method 3: Use existing threat_score field if available
    if (result.threat_score && result.threat_score > 0) {
      console.log(`[VTStatsCards] Using existing score: ${result.threat_score}`);
      return result.threat_score;
    }
    
    console.log(`[VTStatsCards] No score found for ${result.ioc}`);
    return 0;
  };

  // Calculate stats from BOTH history and current results
  const calculateStats = () => {
    // Combine all data
    const allResults = [
      ...history.map(h => h.result),
      ...results
    ];

    // Remove duplicates by IOC
    const uniqueResults = allResults.filter((result, index, self) =>
      index === self.findIndex(r => r.ioc === result.ioc)
    );

    console.log(`[VTStatsCards] Processing ${uniqueResults.length} unique results`);

    if (uniqueResults.length === 0) {
      return {
        totalScans: 0,
        maliciousCount: 0,
        suspiciousCount: 0,
        cleanCount: 0,
        avgThreatScore: 0,
        highRiskScans: 0,
        uniqueIOCs: 0,
        detectionRate: 0
      };
    }

    // Calculate statistics
    const maliciousCount = uniqueResults.filter(r => r.threat_level === 'high').length;
    const suspiciousCount = uniqueResults.filter(r => r.threat_level === 'medium').length;
    const cleanCount = uniqueResults.filter(r => r.threat_level === 'clean').length;
    const totalScans = uniqueResults.length;
    const highRiskScans = maliciousCount + suspiciousCount;
    
    // Calculate threat scores for each result
    const threatScores: number[] = [];
    const scoreDebugInfo: Array<{ioc: string, score: number, ratio?: string}> = [];
    
    uniqueResults.forEach((result, index) => {
      const score = getThreatScoreFromRatio(result);
      threatScores.push(score);
      
      // Debug first few scores
      if (index < 3) {
        scoreDebugInfo.push({
          ioc: result.ioc.substring(0, 20) + '...',
          score,
          ratio: result.detection_stats?.detection_ratio
        });
      }
    });
    
    // Debug first few scores
    if (scoreDebugInfo.length > 0) {
      console.log('[VTStatsCards] First few scores:', scoreDebugInfo);
    }
    
    // Calculate average, filtering out zeros for better accuracy
    const validScores = threatScores.filter(score => score > 0);
    const avgThreatScore = validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
      : 0;
    
    const detectionRate = totalScans > 0 ? (highRiskScans / totalScans) * 100 : 0;

    // Debug log for first result
    if (uniqueResults.length > 0) {
      const sample = uniqueResults[0];
      console.log('[VTStatsCards] Sample result analysis:', {
        ioc: sample.ioc,
        threat_level: sample.threat_level,
        detection_ratio: sample.detection_stats?.detection_ratio,
        malicious: sample.detection_stats?.malicious,
        suspicious: sample.detection_stats?.suspicious,
        total: sample.detection_stats?.total,
        calculated_score: threatScores[0]
      });
    }

    console.log('[VTStatsCards] Final stats:', {
      totalScans,
      maliciousCount,
      suspiciousCount,
      avgThreatScore: avgThreatScore.toFixed(1),
      detectionRate: detectionRate.toFixed(1) + '%',
      scoreCounts: {
        total: threatScores.length,
        valid: validScores.length,
        zeros: threatScores.filter(s => s === 0).length
      }
    });

    return {
      totalScans,
      maliciousCount,
      suspiciousCount,
      cleanCount,
      avgThreatScore,
      highRiskScans,
      uniqueIOCs: new Set(uniqueResults.map(r => r.ioc)).size,
      detectionRate
    };
  };

  const stats = calculateStats();

  // Function to get threat score color
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
      description: 'Historical searches',
      color: 'blue',
      trend: stats.totalScans > 0 ? `${stats.totalScans} items` : 'No scans'
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
      icon: Shield,
      label: 'High Risk',
      value: stats.highRiskScans.toString(),
      description: 'Malicious + Suspicious',
      color: 'orange',
      trend: stats.highRiskScans > 0 ? 'Potential threats' : 'Safe'
    },
    {
      icon: History,
      label: 'Unique IOCs',
      value: stats.uniqueIOCs.toString(),
      description: 'Distinct indicators',
      color: 'purple',
      trend: 'Diverse tracking'
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        
        // Apply special styling for threat score card
        const isThreatScoreCard = card.label === 'Threat Score';
        const threatScoreColor = isThreatScoreCard ? getThreatScoreColor(stats.avgThreatScore) : '';
        
        return (
          <div
            key={index}
            className={`glass border rounded-xl p-4 transition-all duration-300 ${colorClasses} hover:scale-[1.02] ${
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