// components/threat-intel/HAAnalysisDashboard.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  CheckCircle,
  HelpCircle,
  FileText,
  Cpu,
  Globe,
  Activity,
  Users,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Hash,
  Clock,
  BarChart,
  Target,
  Zap,
  Network
} from 'lucide-react';
import type { HAAnalysisResult, HAThreatFeedItem } from '@/lib/threat-intel/ha-types';
import { getVerdictInfo, formatDate } from '@/lib/threat-intel/ha-utils';

interface HAAnalysisDashboardProps {
  results: HAAnalysisResult[];
  threatFeed: HAThreatFeedItem[];
}

export function HAAnalysisDashboard({ results, threatFeed }: HAAnalysisDashboardProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [selectedMetric, setSelectedMetric] = useState<'threats' | 'files' | 'network'>('threats');

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.sha256 === result.sha256)
    );

    // Verdict distribution
    const verdictDistribution = {
      malicious: uniqueResults.filter(r => r.threat_level === 'malicious').length,
      suspicious: uniqueResults.filter(r => r.threat_level === 'suspicious').length,
      whitelisted: uniqueResults.filter(r => r.threat_level === 'whitelisted').length,
      no_specific_threat: uniqueResults.filter(r => r.threat_level === 'no_specific_threat').length,
      no_verdict: uniqueResults.filter(r => r.threat_level === 'no_verdict').length,
      unknown: uniqueResults.filter(r => r.threat_level === 'unknown').length
    };

    // File type distribution
    const fileTypes = uniqueResults.reduce((acc, result) => {
      const type = result.type || 'Unknown';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {} as Record<string, number>);

    const topFileTypes = Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Threat score distribution
    const threatScores = uniqueResults.map(r => r.threat_score_computed);
    const avgThreatScore = threatScores.length > 0 
      ? threatScores.reduce((sum, score) => sum + score, 0) / threatScores.length 
      : 0;

    // Threat feed stats
    const recentThreats = threatFeed.slice(0, 50);
    const threatFeedVerdicts = {
      malicious: recentThreats.filter(t => t.verdict === 60).length,
      suspicious: recentThreats.filter(t => t.verdict === 50).length,
      other: recentThreats.filter(t => ![60, 50].includes(t.verdict || 0)).length
    };

    // Environment distribution
    const environments = uniqueResults.flatMap(r => 
      r.reports?.map(rep => rep.environment_description || `Env ${rep.environment_id}`) || []
    );
    const envDistribution = environments.reduce((acc, env) => {
      if (!acc[env]) acc[env] = 0;
      acc[env]++;
      return acc;
    }, {} as Record<string, number>);

    const topEnvironments = Object.entries(envDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // MITRE ATT&CK techniques
    const mitreAttacks = uniqueResults.flatMap(r => r.mitre_attcks || []);
    const topTechniques = Array.from(new Set(mitreAttacks.map(a => a.technique)))
      .slice(0, 8);

    // Network indicators
    const networkIndicators = {
      domains: uniqueResults.flatMap(r => r.summary?.domains || []).length,
      hosts: uniqueResults.flatMap(r => r.summary?.hosts || []).length,
      connections: uniqueResults.reduce((sum, r) => sum + (r.summary?.total_network_connections || 0), 0)
    };

    return {
      totalScans: uniqueResults.length,
      verdictDistribution,
      fileTypes: topFileTypes,
      avgThreatScore,
      threatFeedVerdicts,
      environments: topEnvironments,
      mitreTechniques: topTechniques,
      networkIndicators,
      recentThreats
    };
  }, [results, threatFeed]);

  // Render verdict distribution chart
  const renderVerdictChart = () => {
    const { verdictDistribution } = stats;
    const total = Object.values(verdictDistribution).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const verdicts = [
      { label: 'Malicious', value: verdictDistribution.malicious, color: 'bg-destructive', text: 'text-destructive' },
      { label: 'Suspicious', value: verdictDistribution.suspicious, color: 'bg-accent', text: 'text-accent' },
      { label: 'Whitelisted', value: verdictDistribution.whitelisted, color: 'bg-green-500', text: 'text-green-500' },
      { label: 'No Threat', value: verdictDistribution.no_specific_threat, color: 'bg-yellow-500', text: 'text-yellow-500' },
      { label: 'No Verdict', value: verdictDistribution.no_verdict, color: 'bg-blue-500', text: 'text-blue-500' },
      { label: 'Unknown', value: verdictDistribution.unknown, color: 'bg-muted', text: 'text-muted-foreground' }
    ].filter(v => v.value > 0);

    return (
      <div className="space-y-4">
        {verdicts.map((verdict, idx) => {
          const percentage = (verdict.value / total) * 100;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${verdict.color}`} />
                  <span className="text-sm font-medium text-foreground">{verdict.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {verdict.value} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${verdict.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render threat feed chart
  const renderThreatFeedChart = () => {
    const { threatFeedVerdicts } = stats;
    const total = Object.values(threatFeedVerdicts).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const sections = [
      { label: 'Malicious', value: threatFeedVerdicts.malicious, color: 'bg-destructive' },
      { label: 'Suspicious', value: threatFeedVerdicts.suspicious, color: 'bg-accent' },
      { label: 'Other', value: threatFeedVerdicts.other, color: 'bg-muted' }
    ].filter(s => s.value > 0);

    return (
      <div className="relative h-40 flex items-center justify-center">
        <div className="relative w-32 h-32">
          {sections.map((section, idx, arr) => {
            const percentage = (section.value / total) * 100;
            const startAngle = arr.slice(0, idx).reduce((sum, s) => sum + (s.value / total) * 360, 0);
            const angle = (section.value / total) * 360;
            
            return (
              <div
                key={idx}
                className="absolute inset-0 rounded-full"
                style={{
                  clipPath: `conic-gradient(from ${startAngle}deg, transparent 0deg, transparent ${angle}deg, ${section.color} ${angle}deg, ${section.color} 360deg)`,
                  transform: 'rotate(-90deg)'
                }}
              />
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{total}</div>
              <div className="text-xs text-muted-foreground">Recent threats</div>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-3">
          {sections.map((section, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${section.color}`} />
              <span className="text-sm text-foreground">{section.label}</span>
              <span className="text-sm text-muted-foreground ml-auto">{section.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Analysis Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive threat intelligence overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            {(['threats', 'files', 'network'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  selectedMetric === metric
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            {(['24h', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={AlertTriangle}
          label="Malicious Files"
          value={stats.verdictDistribution.malicious}
          change={stats.verdictDistribution.malicious > 0 ? '+' : '0'}
          color="destructive"
        />
        <MetricCard
          icon={Shield}
          label="Avg Threat Score"
          value={stats.avgThreatScore.toFixed(1)}
          max={100}
          color={stats.avgThreatScore > 50 ? 'destructive' : 'primary'}
        />
        <MetricCard
          icon={Cpu}
          label="Sandbox Runs"
          value={stats.totalScans}
          description="Total analyses"
          color="purple"
        />
        <MetricCard
          icon={Network}
          label="Network Indicators"
          value={stats.networkIndicators.domains + stats.networkIndicators.hosts}
          description="Domains & hosts"
          color="blue"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verdict Distribution */}
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Verdict Distribution
            </h4>
            <span className="text-sm text-muted-foreground">
              {stats.totalScans} total scans
            </span>
          </div>
          {stats.totalScans > 0 ? renderVerdictChart() : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No scan data available</p>
            </div>
          )}
        </div>

        {/* Recent Threats */}
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Recent Threat Feed
            </h4>
            <span className="text-sm text-muted-foreground">
              {stats.recentThreats.length} threats
            </span>
          </div>
          {stats.recentThreats.length > 0 ? renderThreatFeedChart() : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No threat feed data</p>
            </div>
          )}
        </div>
      </div>

      {/* File Types and Environments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Types */}
        <div className="glass border border-border rounded-xl p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            File Type Distribution
          </h4>
          {stats.fileTypes.length > 0 ? (
            <div className="space-y-4">
              {stats.fileTypes.map(([type, count], idx) => {
                const percentage = (count / stats.totalScans) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-foreground">{type}</code>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No file type data</p>
            </div>
          )}
        </div>

        {/* Environments */}
        <div className="glass border border-border rounded-xl p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            Sandbox Environments
          </h4>
          {stats.environments.length > 0 ? (
            <div className="space-y-4">
              {stats.environments.map(([env, count], idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                  <span className="text-sm text-foreground">{env}</span>
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs">
                    {count} runs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No environment data</p>
            </div>
          )}
        </div>
      </div>

      {/* MITRE ATT&CK Techniques */}
      {stats.mitreTechniques.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-destructive" />
            MITRE ATT&CK Techniques Detected
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.mitreTechniques.map((technique, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg bg-black/5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {technique}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Analysis */}
      {stats.networkIndicators.domains > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Network Indicators Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
              <div className="text-2xl font-bold text-blue-500">{stats.networkIndicators.domains}</div>
              <div className="text-sm text-muted-foreground">Domains Contacted</div>
            </div>
            <div className="text-center p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
              <div className="text-2xl font-bold text-blue-500">{stats.networkIndicators.hosts}</div>
              <div className="text-sm text-muted-foreground">Hosts Contacted</div>
            </div>
            <div className="text-center p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
              <div className="text-2xl font-bold text-blue-500">{stats.networkIndicators.connections}</div>
              <div className="text-sm text-muted-foreground">Total Connections</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  max, 
  change, 
  color, 
  description 
}: { 
  icon: any;
  label: string;
  value: any;
  max?: number;
  change?: string;
  color: string;
  description?: string;
}) {
  const colorClasses = {
    destructive: 'text-destructive border-destructive/20 bg-destructive/5',
    primary: 'text-primary border-primary/20 bg-primary/5',
    purple: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    green: 'text-green-500 border-green-500/20 bg-green-500/5'
  };

  return (
    <div className={`border rounded-xl p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses].split(' ')[0].replace('text-', 'bg-')} bg-opacity-10`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-xs px-2 py-1 rounded ${
            change.startsWith('+') ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">
          {typeof value === 'number' && max ? (
            <>
              {value}
              <span className="text-lg text-muted-foreground">/{max}</span>
            </>
          ) : (
            value
          )}
        </p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function Flame({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}