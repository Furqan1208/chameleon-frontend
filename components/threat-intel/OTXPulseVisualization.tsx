// D:\FYP\Chameleon Frontend\components\threat-intel\OTXPulseVisualization.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Users,
  Tag,
  Calendar,
  Globe,
  FileText,
  Hash,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Download,
  Copy,
  Network,
  Cpu,
  PieChart,
  Layers,
  Database,
  Clock,
  Search,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart,
  LineChart,
  ChartBar,
  ChartPie
} from 'lucide-react';
import type { OTXScanHistory } from '@/lib/threat-intel/otx-types';

interface OTXPulseVisualizationProps {
  history: OTXScanHistory[];
}

interface PulseAggregate {
  id: string;
  name: string;
  description?: string;
  count: number;
  tags: string[];
  author: string;
  created: string;
  modified: string;
  subscriber_count: number;
  indicator_count: number;
  threat_level: 'high' | 'medium' | 'low' | 'clean' | 'unknown';
  indicator_types: Record<string, number>;
  scans: OTXScanHistory[];
  tlp?: string;
  industries: string[];
  malware_families: string[];
  adversary?: string;
  pulse_info?: {
    count: number;
    pulses: Array<{
      id: string;
      name: string;
      description?: string;
      modified: string;
      created: string;
      tags: string[];
      author: {
        username: string;
        id: string;
      };
      subscriber_count: number;
      indicator_count: number;
      indicator_type_counts?: Record<string, number>;
      TLP?: string;
      industries?: string[];
      malware_families?: Array<{
        id: string;
        display_name: string;
      }>;
      adversary?: string;
    }>;
  };
}

export function OTXPulseVisualization({ history }: OTXPulseVisualizationProps) {
  const [pulses, setPulses] = useState<PulseAggregate[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'date' | 'subscribers' | 'indicators'>('count');
  const [selectedPulse, setSelectedPulse] = useState<string | null>(null);
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'chart'>('list');

  // Aggregate pulses from history
  useEffect(() => {
    if (history.length === 0) {
      setPulses([]);
      return;
    }

    console.log('[PulseVisualization] Processing history:', history.length, 'scans');

    const pulseMap: Record<string, PulseAggregate> = {};

    history.forEach(scan => {
      const pulseInfo = scan.result.sections.general?.pulse_info;
      
      if (!pulseInfo?.pulses || !Array.isArray(pulseInfo.pulses)) {
        return;
      }

      console.log(`[PulseVisualization] Found ${pulseInfo.pulses.length} pulses in scan ${scan.id}`);

      pulseInfo.pulses.forEach(pulse => {
        if (!pulse.id) return;

        if (!pulseMap[pulse.id]) {
          // Extract pulse data safely
          const pulseData: PulseAggregate = {
            id: pulse.id,
            name: pulse.name || 'Unnamed Pulse',
            description: pulse.description,
            count: 0,
            tags: Array.isArray(pulse.tags) ? pulse.tags : [],
            author: pulse.author?.username || 'Unknown',
            created: pulse.created || new Date().toISOString(),
            modified: pulse.modified || new Date().toISOString(),
            subscriber_count: pulse.subscriber_count || 0,
            indicator_count: pulse.indicator_count || 0,
            threat_level: 'unknown',
            indicator_types: pulse.indicator_type_counts || {},
            scans: [],
            tlp: pulse.TLP,
            industries: Array.isArray(pulse.industries) ? pulse.industries : [],
            malware_families: Array.isArray(pulse.malware_families) 
              ? pulse.malware_families.map(mf => mf.display_name || mf.id || 'Unknown')
              : [],
            adversary: pulse.adversary,
            pulse_info: {
              count: 1,
              pulses: [{
                id: pulse.id,
                name: pulse.name || 'Unnamed Pulse',
                description: pulse.description,
                modified: pulse.modified || new Date().toISOString(),
                created: pulse.created || new Date().toISOString(),
                tags: Array.isArray(pulse.tags) ? pulse.tags : [],
                author: {
                  username: pulse.author?.username || 'Unknown',
                  id: pulse.author?.id || 'unknown'
                },
                subscriber_count: pulse.subscriber_count || 0,
                indicator_count: pulse.indicator_count || 0,
                indicator_type_counts: pulse.indicator_type_counts || {},
                TLP: pulse.TLP,
                industries: Array.isArray(pulse.industries) ? pulse.industries : [],
                malware_families: Array.isArray(pulse.malware_families) 
                  ? pulse.malware_families.map(mf => ({
                      id: mf.id || 'unknown',
                      display_name: mf.display_name || 'Unknown'
                    }))
                  : [],
                adversary: pulse.adversary
              }]
            }
          };
          pulseMap[pulse.id] = pulseData;
        }

        pulseMap[pulse.id].count++;
        
        // Determine threat level based on scan results
        const scanThreatLevel = scan.result.threat_level;
        if (scanThreatLevel === 'high') {
          pulseMap[pulse.id].threat_level = 'high';
        } else if (scanThreatLevel === 'medium' && pulseMap[pulse.id].threat_level !== 'high') {
          pulseMap[pulse.id].threat_level = 'medium';
        } else if (scanThreatLevel === 'low' && !['high', 'medium'].includes(pulseMap[pulse.id].threat_level)) {
          pulseMap[pulse.id].threat_level = 'low';
        } else if (scanThreatLevel === 'clean' && pulseMap[pulse.id].threat_level === 'unknown') {
          pulseMap[pulse.id].threat_level = 'clean';
        }

        // Add scan if not already in list
        if (!pulseMap[pulse.id].scans.find(s => s.id === scan.id)) {
          pulseMap[pulse.id].scans.push(scan);
        }

        // Merge indicator types
        if (pulse.indicator_type_counts) {
          Object.entries(pulse.indicator_type_counts).forEach(([type, count]) => {
            pulseMap[pulse.id].indicator_types[type] = 
              (pulseMap[pulse.id].indicator_types[type] || 0) + (Number(count) || 0);
          });
        }
      });
    });

    // Convert to array
    const pulseArray = Object.values(pulseMap);
    
    console.log('[PulseVisualization] Aggregated pulses:', pulseArray.length);

    // Apply sorting
    pulseArray.sort((a, b) => {
      switch (sortBy) {
        case 'count':
          return b.count - a.count;
        case 'date':
          return new Date(b.modified).getTime() - new Date(a.modified).getTime();
        case 'subscribers':
          return (b.subscriber_count || 0) - (a.subscriber_count || 0);
        case 'indicators':
          return (b.indicator_count || 0) - (a.indicator_count || 0);
        default:
          return b.count - a.count;
      }
    });

    setPulses(pulseArray);
  }, [history, sortBy]);

  // Get filtered pulses
  const filteredPulses = useMemo(() => {
    return pulses.filter(pulse => {
      if (filter === 'all') return true;
      if (filter === 'high' && pulse.threat_level === 'high') return true;
      if (filter === 'medium' && pulse.threat_level === 'medium') return true;
      if (filter === 'low' && pulse.threat_level === 'low') return true;
      if (filter === 'clean' && pulse.threat_level === 'clean') return true;
      return false;
    }).filter(pulse =>
      pulse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pulse.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pulse.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pulse.description && pulse.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pulse.adversary && pulse.adversary.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [pulses, filter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPulses = pulses.length;
    const highRiskPulses = pulses.filter(p => p.threat_level === 'high').length;
    const mediumRiskPulses = pulses.filter(p => p.threat_level === 'medium').length;
    const lowRiskPulses = pulses.filter(p => p.threat_level === 'low').length;
    const cleanPulses = pulses.filter(p => p.threat_level === 'clean').length;
    
    const totalIndicators = pulses.reduce((sum, p) => sum + p.count, 0);
    const totalSubscribers = pulses.reduce((sum, p) => sum + (p.subscriber_count || 0), 0);
    const totalPulseIndicators = pulses.reduce((sum, p) => sum + (p.indicator_count || 0), 0);
    
    const uniqueTags = new Set(pulses.flatMap(p => p.tags)).size;
    const averageSubscribers = pulses.length > 0 ? Math.round(totalSubscribers / pulses.length) : 0;
    
    const totalIndicatorTypes = pulses.reduce((acc, pulse) => {
      Object.entries(pulse.indicator_types || {}).forEach(([type, count]) => {
        acc[type] = (acc[type] || 0) + (Number(count) || 0);
      });
      return acc;
    }, {} as Record<string, number>);

    const topIndicatorTypes = Object.entries(totalIndicatorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      totalPulses,
      highRiskPulses,
      mediumRiskPulses,
      lowRiskPulses,
      cleanPulses,
      totalIndicators,
      totalSubscribers,
      totalPulseIndicators,
      uniqueTags,
      averageSubscribers,
      topIndicatorTypes
    };
  }, [pulses]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      case 'medium':
        return 'text-accent border-accent/20 bg-accent/5';
      case 'low':
        return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      case 'clean':
        return 'text-green-500 border-green-500/20 bg-green-500/5';
      default:
        return 'text-muted-foreground border-border bg-muted/5';
    }
  };

  const getIndicatorTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('ip')) return <Network className="w-3 h-3" />;
    if (lowerType.includes('domain') || lowerType.includes('hostname')) return <Globe className="w-3 h-3" />;
    if (lowerType.includes('url')) return <ExternalLink className="w-3 h-3" />;
    if (lowerType.includes('file') || lowerType.includes('hash')) return <FileText className="w-3 h-3" />;
    if (lowerType.includes('cve')) return <Lock className="w-3 h-3" />;
    if (lowerType.includes('email')) return <Users className="w-3 h-3" />;
    return <Cpu className="w-3 h-3" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown date';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return dateString;
    }
  };

  const formatDetailedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const toggleTags = (pulseId: string) => {
    setExpandedTags(prev => ({
      ...prev,
      [pulseId]: !prev[pulseId]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleSelectPulse = (pulseId: string) => {
    setSelectedPulse(selectedPulse === pulseId ? null : pulseId);
  };

  if (history.length === 0) {
    return (
      <div className="glass border border-border rounded-xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <Activity className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Pulse Visualization</h3>
        <p className="text-muted-foreground">No scan history available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start scanning indicators to see threat intelligence pulses
        </p>
      </div>
    );
  }

  if (pulses.length === 0) {
    return (
      <div className="glass border border-border rounded-xl p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No pulses found in scan history</p>
          <p className="text-sm text-muted-foreground mt-1">
            Pulses will appear when you scan indicators with threat intelligence data
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Try scanning popular indicators like:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <code className="px-2 py-1 bg-muted rounded">8.8.8.8</code>
              <code className="px-2 py-1 bg-muted rounded">google.com</code>
              <code className="px-2 py-1 bg-muted rounded">malware.exe hash</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.totalPulses}</div>
          <div className="text-xs text-muted-foreground">Total Pulses</div>
        </div>
        <div className="glass border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{stats.highRiskPulses}</div>
          <div className="text-xs text-muted-foreground">High Risk</div>
        </div>
        <div className="glass border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.mediumRiskPulses}</div>
          <div className="text-xs text-muted-foreground">Medium Risk</div>
        </div>
        <div className="glass border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.uniqueTags}</div>
          <div className="text-xs text-muted-foreground">Unique Tags</div>
        </div>
      </div>

      {/* Top Indicator Types */}
      {stats.topIndicatorTypes.length > 0 && (
        <div className="glass border border-border rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Top Indicator Types
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.topIndicatorTypes.map(({ type, count }) => (
              <div
                key={type}
                className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg bg-background/50"
              >
                {getIndicatorTypeIcon(type)}
                <span className="text-sm font-medium text-foreground">{type}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'hover:bg-muted/20 text-muted-foreground'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'hover:bg-muted/20 text-muted-foreground'}`}
              title="Grid View"
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-2 transition-colors ${viewMode === 'chart' ? 'bg-orange-500 text-white' : 'hover:bg-muted/20 text-muted-foreground'}`}
              title="Chart View"
            >
              <ChartBar className="w-4 h-4" />
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              All ({pulses.length})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'high'
                  ? 'bg-destructive text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              High ({stats.highRiskPulses})
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'medium'
                  ? 'bg-accent text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Medium ({stats.mediumRiskPulses})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'low'
                  ? 'bg-yellow-500 text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <Shield className="w-3 h-3" />
              Low ({stats.lowRiskPulses})
            </button>
            <button
              onClick={() => setFilter('clean')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'clean'
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Clean ({stats.cleanPulses})
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 transition-colors"
            >
              <option value="count">Sort by Occurrences</option>
              <option value="date">Sort by Date</option>
              <option value="subscribers">Sort by Subscribers</option>
              <option value="indicators">Sort by Indicators</option>
            </select>
            <ChevronRight className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pulses..."
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Pulse List/Grid/Chart */}
      {viewMode === 'chart' ? (
        // Chart View
        <div className="glass border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Threat Level Distribution */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Threat Level Distribution</h4>
              <div className="space-y-2">
                {[
                  { level: 'high', count: stats.highRiskPulses, color: 'bg-destructive' },
                  { level: 'medium', count: stats.mediumRiskPulses, color: 'bg-accent' },
                  { level: 'low', count: stats.lowRiskPulses, color: 'bg-yellow-500' },
                  { level: 'clean', count: stats.cleanPulses, color: 'bg-green-500' }
                ].map(({ level, count, color }) => (
                  <div key={level} className="flex items-center gap-3">
                    <div className="w-24 text-sm capitalize">{level}</div>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-500`}
                        style={{ width: `${(count / stats.totalPulses) * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pulses */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Top Pulses by Occurrences</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pulses.slice(0, 5).map((pulse, idx) => (
                  <div
                    key={pulse.id}
                    className="flex items-center justify-between p-2 border border-border rounded hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                        {pulse.name}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                        pulse.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                        pulse.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                        pulse.threat_level === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {pulse.threat_level}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-orange-500">{pulse.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPulses.map((pulse) => {
            const isSelected = selectedPulse === pulse.id;
            
            return (
              <div
                key={pulse.id}
                className={`glass border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                  getThreatColor(pulse.threat_level)
                } ${isSelected ? 'ring-2 ring-orange-500' : 'hover:scale-[1.02]'}`}
                onClick={() => handleSelectPulse(pulse.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4" />
                      <h4 className="font-semibold text-foreground truncate">{pulse.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        pulse.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                        pulse.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                        pulse.threat_level === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {pulse.threat_level}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(pulse.modified)}
                      </span>
                    </div>
                    
                    {pulse.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {pulse.description}
                      </p>
                    )}
                    
                    {pulse.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pulse.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-1.5 py-0.5 bg-muted/50 text-muted-foreground rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {pulse.tags.length > 3 && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted/30 text-muted-foreground rounded">
                            +{pulse.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{pulse.subscriber_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>{pulse.indicator_count} indicators</span>
                  </div>
                  <div className="text-orange-500 font-bold">
                    {pulse.count}×
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {filteredPulses.map((pulse) => {
            const isExpanded = expandedTags[pulse.id];
            const isSelected = selectedPulse === pulse.id;

            return (
              <div
                key={pulse.id}
                className={`glass border rounded-xl p-4 transition-all duration-300 ${
                  getThreatColor(pulse.threat_level)
                } hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4" />
                      <h4 className="font-semibold text-foreground truncate">{pulse.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        pulse.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                        pulse.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                        pulse.threat_level === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {pulse.threat_level} risk
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>By: {pulse.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Updated: {formatDate(pulse.modified)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{pulse.subscriber_count} subscribers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span>{pulse.indicator_count} indicators</span>
                      </div>
                    </div>

                    {/* Description */}
                    {pulse.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {pulse.description}
                      </p>
                    )}

                    {/* Tags */}
                    {pulse.tags.length > 0 && (
                      <div className="mb-2">
                        <button
                          onClick={() => toggleTags(pulse.id)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-1"
                        >
                          <Tag className="w-3 h-3" />
                          Tags ({pulse.tags.length})
                          {isExpanded ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {pulse.tags.slice(0, 10).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {pulse.tags.length > 10 && (
                              <span className="px-2 py-0.5 bg-muted/50 text-muted-foreground rounded text-xs">
                                +{pulse.tags.length - 10} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Indicator Types */}
                    {Object.keys(pulse.indicator_types).length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Indicator Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(pulse.indicator_types)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([type, count]) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 bg-background/50 text-foreground rounded text-xs flex items-center gap-1"
                              >
                                {getIndicatorTypeIcon(type)}
                                <span>{type}: {count}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {pulse.tlp && (
                        <span className="px-1.5 py-0.5 bg-muted/30 rounded">
                          TLP: {pulse.tlp}
                        </span>
                      )}
                      {pulse.adversary && (
                        <span className="px-1.5 py-0.5 bg-muted/30 rounded">
                          Adversary: {pulse.adversary}
                        </span>
                      )}
                      {pulse.industries.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-muted/30 rounded">
                          Industries: {pulse.industries.slice(0, 2).join(', ')}
                          {pulse.industries.length > 2 && '...'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-orange-500">{pulse.count}</div>
                    <div className="text-xs text-muted-foreground">Occurrences</div>
                  </div>
                </div>

                {/* Related Scans */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Related Indicators ({pulse.scans.length}):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pulse.scans.slice(0, 4).map((scan) => (
                      <div
                        key={scan.id}
                        className="p-2 border border-border rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-mono text-foreground truncate">
                              {scan.indicator}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                                {scan.type}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                scan.result.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                                scan.result.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                                'bg-green-500/20 text-green-500'
                              }`}>
                                {scan.result.threat_level}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopy(scan.indicator)}
                            className="p-1 hover:bg-black/10 rounded transition-colors"
                            title="Copy indicator"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {pulse.scans.length > 4 && (
                    <p className="text-xs text-muted-foreground italic text-center mt-2">
                      + {pulse.scans.length - 4} more indicators
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredPulses.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No pulses match your filters</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try changing your search or filter criteria
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredPulses.length > 0 && (
        <div className="glass border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredPulses.length} of {pulses.length} pulses
              {searchQuery && (
                <span className="ml-2 text-orange-500">
                  • Searching for "{searchQuery}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{stats.totalIndicators} total occurrences</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{stats.totalSubscribers} total subscribers</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}