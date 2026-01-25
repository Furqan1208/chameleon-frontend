// components/threat-intel/AbuseIPDBHistory.tsx
'use client';

import { useState } from 'react';
import { 
  History, 
  Search, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  ChevronRight,
  Download,
  Calendar,
  Globe,
  Users,
  Filter,
  X
} from 'lucide-react';

interface HistoryItem {
  id: string;
  ip: string;
  timestamp: string;
  confidence_score: number;
  threat_level: string;
  country: string;
  result: any;
}

interface AbuseIPDBHistoryProps {
  history: HistoryItem[];
  onSearch: (ip: string) => void;
  onClear: () => void;
}

export function AbuseIPDBHistory({ history, onSearch, onClear }: AbuseIPDBHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const filteredHistory = history.filter(item => {
    // Search filter
    const matchesSearch = item.ip.includes(searchTerm) || 
                         item.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Threat level filter
    const matchesFilter = filter === 'all' || item.threat_level === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getThreatIcon = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-accent" />;
      case 'low':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'clean':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'high':
        return 'border-destructive/20 bg-destructive/5';
      case 'medium':
        return 'border-accent/20 bg-accent/5';
      case 'low':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'clean':
        return 'border-primary/20 bg-primary/5';
      default:
        return 'border-border bg-muted/5';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const exportHistory = () => {
    const exportData = filteredHistory.map(item => ({
      ip: item.ip,
      timestamp: item.timestamp,
      confidence_score: item.confidence_score,
      threat_level: item.threat_level,
      country: item.country,
      total_reports: item.result.total_reports || 0,
      isp: item.result.isp || 'Unknown'
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abuseipdb-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No search history yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start checking IPs to build your history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* History Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-foreground">Search History</h3>
          <span className="text-sm px-2 py-1 bg-muted rounded">{filteredHistory.length} items</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportHistory}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
            title="Export history as JSON"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={onClear}
            className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by IP or country..."
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {['all', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === level
                    ? level === 'high' ? 'bg-destructive text-white' :
                      level === 'medium' ? 'bg-accent text-white' :
                      level === 'low' ? 'bg-yellow-500 text-white' :
                      'bg-blue-500 text-white'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
              selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : ''
            } ${getThreatColor(item.threat_level)}`}
            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getThreatIcon(item.threat_level)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono font-medium text-foreground text-sm">
                      {item.ip}
                    </code>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                      item.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                      item.threat_level === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {item.confidence_score}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>{item.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{item.result.total_reports || 0} reports</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSearch(item.ip);
                  }}
                  className="p-1.5 rounded hover:bg-black/10 transition-colors"
                  title="Search this IP again"
                >
                  <Search className="w-4 h-4" />
                </button>
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  selectedItem?.id === item.id ? 'rotate-90' : ''
                }`} />
              </div>
            </div>
            
            {/* Expanded Details */}
            {selectedItem?.id === item.id && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ISP</p>
                    <p className="text-sm font-medium">{item.result.isp || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Domain</p>
                    <p className="text-sm font-medium">{item.result.domain || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usage Type</p>
                    <p className="text-sm font-medium">{item.result.usage_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Distinct Users</p>
                    <p className="text-sm font-medium">{item.result.distinct_users || 0}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearch(item.ip);
                      setSelectedItem(null);
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Check this IP Again
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No matching history items found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try changing your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}