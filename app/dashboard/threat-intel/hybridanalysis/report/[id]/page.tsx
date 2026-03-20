// app/dashboard/threat-intel/hybridanalysis/report/[id]/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  FileText, 
  Cpu, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Globe,
  Network,
  Activity,
  Target,
  Code,
  Database,
  Hash,
  Lock,
  Unlock,
  Server,
  HardDrive,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Search,
  Filter,
  Copy,
  Eye,
  Tag,
  Layers,
  Terminal,
  Settings,
  Binary,
  Package,
  Skull,
  Flame,
  Award,
  Flag,
  BookOpen,
  FileArchive,
  Key,
  FileSignature,
  FolderTree,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  GitBranch,
  Cpu as CpuIcon,
  MemoryStick,
  Link,
  ListFilter,
  BookOpenCheck,
  GitCompare,
  FileCode,
  FileSearch,
  Network as NetworkIcon,
  Cloud,
  DownloadCloud,
  EyeOff,
  LockKeyhole,
  UnlockKeyhole,
  FileKey,
  FileWarning,
  FileCheck,
  FileX,
  Calendar,
  Map,
  Layers2,
  GitMerge,
  BookMarked,
  BookCopy,
  BookX,
  Info
} from 'lucide-react';
import { 
  formatDate, 
  formatFileSize, 
  getVerdictInfo, 
  getThreatLevelColor, 
  getThreatLevelLabel 
} from '@/lib/utils/hybrid-analysis.utils';
import { hybridAnalysisApi } from '@/services/api/threat-intel/hybridAnalysis.api';

interface DetailedReport {
  job_id?: string;
  environment_id?: number;
  environment_description?: string;
  size?: number;
  type?: string;
  type_short?: string[];
  target_url?: string;
  state?: string;
  error_type?: string;
  error_origin?: string;
  submit_name?: string;
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha512?: string;
  ssdeep?: string;
  imphash?: string;
  entrypoint?: string;
  entrypoint_section?: string;
  image_base?: string;
  subsystem?: string;
  image_file_characteristics?: string[];
  dll_characteristics?: string[];
  major_os_version?: number;
  minor_os_version?: number;
  av_detect?: number;
  vx_family?: string;
  url_analysis?: boolean;
  analysis_start_time?: string;
  threat_score?: number;
  interesting?: boolean;
  threat_level?: number;
  verdict?: string;
  certificates?: Array<{
    owner?: string;
    issuer?: string;
    serial_number?: string;
    md5?: string;
    sha1?: string;
    valid_from?: string;
    valid_until?: string;
  }>;
  is_certificates_valid?: boolean;
  certificates_validation_message?: string;
  domains?: string[];
  compromised_hosts?: string[];
  hosts?: string[];
  total_network_connections?: number;
  total_processes?: number;
  total_signatures?: number;
  extracted_files?: Array<{
    name?: string;
    file_path?: string;
    file_size?: number;
    sha1?: string;
    sha256?: string;
    md5?: string;
    type_tags?: string[];
    description?: string;
    runtime_process?: string;
    threat_level?: number;
    threat_level_readable?: string;
    av_label?: string;
    av_matched?: number;
    av_total?: number;
    file_available_to_download?: boolean;
  }>;
  file_metadata?: {
    file_compositions?: string[];
    imported_objects?: string[];
    file_analysis?: string[];
    total_file_compositions_imports?: number;
  };
  processes?: Array<{
    uid?: string;
    parentuid?: string;
    name?: string;
    normalized_path?: string;
    command_line?: string;
    sha256?: string;
    av_label?: string;
    av_matched?: number;
    av_total?: number;
    pid?: string;
    icon?: string;
    file_accesses?: Array<{
      type: string;
      path: string;
      mask: string;
    }>;
    created_files?: Array<{
      file: string;
      null_byte: boolean;
    }>;
    registry?: Array<{
      operation?: string;
      path?: string;
      key?: string;
      value?: string;
      status?: string;
      status_human_readable?: string;
    }>;
    mutants?: string[];
    handles?: Array<{
      id: number;
      type: string;
      path: string;
    }>;
    streams?: Array<{
      uid?: string;
      file_name?: string;
      human_keywords?: string;
      instructions?: string[];
      executed?: boolean;
      matched_signatures?: Array<{
        id: string;
        value: string;
      }>;
    }>;
    script_calls?: Array<{
      cls_id?: string;
      dispatch_id?: string;
      status?: string;
      result?: string;
      parameters?: Array<{
        name?: string;
        value?: string;
        comment?: string;
        argument_number?: number;
        meaning?: string;
      }>;
      matched_malicious_signatures?: string[];
    }>;
    process_flags?: Array<{
      name: string;
      data?: string;
      image: any[];
    }>;
    amsi_calls?: Array<{
      app_name: string;
      filename?: string;
      raw_script_content: string;
    }>;
    modules?: Array<{
      path: string;
      base: string;
      interesting: boolean;
    }>;
  }>;
  mitre_attcks?: Array<{
    tactic: string;
    technique: string;
    attck_id?: string;
    attck_id_wiki?: string;
    parent?: {
      technique: string;
      attck_id?: string;
      attck_id_wiki?: string;
    };
    malicious_identifiers_count?: number;
    malicious_identifiers?: string[];
    suspicious_identifiers_count?: number;
    suspicious_identifiers?: string[];
    informative_identifiers_count?: number;
    informative_identifiers?: string[];
  }>;
  network_mode?: string;
  signatures?: Array<{
    threat_level?: number;
    threat_level_human?: string;
    category?: string;
    identifier?: string;
    type?: number;
    relevance?: number;
    name?: string;
    description?: string;
    origin?: string;
    attck_id?: string;
    capec_id?: string;
    attck_id_wiki?: string;
  }>;
  classification_tags?: string[];
  tags?: string[];
  submissions?: Array<{
    submission_id?: string;
    filename?: string;
    url?: string;
    created_at?: string;
  }>;
  machine_learning_models?: Array<{
    name: string;
    version: string;
    status: string;
    data: Array<{
      id: string;
      value: string;
    }>;
    created_at: string;
  }>;
  crowdstrike_ai?: {
    executable_process_memory_analysis?: Array<{
      filename: string;
      address: string;
      flags: string;
      file_process?: string;
      file_process_pid?: number;
      file_process_sha256?: string;
      file_process_disc_pathway?: string;
      verdict: string;
    }>;
    analysis_related_urls?: Array<{
      url: string;
      verdict: string;
      type: string;
    }>;
  };
  warnings?: string[];
}

type ActiveTab = 'overview' | 'behavioral' | 'network' | 'static' | 'threat';
type MitreTactic = string;

export default function DetailedReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [mitreTacticFilter, setMitreTacticFilter] = useState<MitreTactic | 'all'>('all');
  const [showAllSignatures, setShowAllSignatures] = useState(false);
  const [showAllMitre, setShowAllMitre] = useState(false);
  const [showAllWarnings, setShowAllWarnings] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching report for ID:', id);
      
      // Try to fetch report summary using the report ID
      const data = await hybridAnalysisApi.getReportSummary(id);
      console.log('Report data received:', data);
      setReport(data);
      
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // Memoized computed values
  const mitreTactics = useMemo(() => {
    if (!report?.mitre_attcks) return [];
    const tactics = new Set<string>();
    report.mitre_attcks.forEach(attack => tactics.add(attack.tactic));
    return Array.from(tactics);
  }, [report?.mitre_attcks]);

  const filteredSignatures = useMemo(() => {
    if (!report?.signatures) return [];
    let filtered = [...report.signatures];
    
    if (filterLevel !== 'all') {
      filtered = filtered.filter(sig => sig.threat_level === filterLevel);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sig => 
        sig.name?.toLowerCase().includes(term) ||
        sig.description?.toLowerCase().includes(term) ||
        sig.category?.toLowerCase().includes(term) ||
        sig.identifier?.toLowerCase().includes(term)
      );
    }
    
    return filtered.sort((a, b) => (b.threat_level || 0) - (a.threat_level || 0));
  }, [report?.signatures, filterLevel, searchTerm]);

  const filteredMitreAttacks = useMemo(() => {
    if (!report?.mitre_attcks) return [];
    let filtered = [...report.mitre_attcks];
    
    if (mitreTacticFilter !== 'all') {
      filtered = filtered.filter(attack => attack.tactic === mitreTacticFilter);
    }
    
    if (searchTerm && activeTab === 'behavioral') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(attack => 
        attack.technique.toLowerCase().includes(term) ||
        attack.tactic.toLowerCase().includes(term) ||
        attack.attck_id?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [report?.mitre_attcks, mitreTacticFilter, searchTerm, activeTab]);

  const threatBreakdown = useMemo(() => {
    if (!report?.signatures) return { high: 0, medium: 0, low: 0, info: 0 };
    
    return report.signatures.reduce((acc, sig) => {
      const level = sig.threat_level || 0;
      if (level >= 3) acc.high++;
      else if (level === 2) acc.medium++;
      else if (level === 1) acc.low++;
      else acc.info++;
      return acc;
    }, { high: 0, medium: 0, low: 0, info: 0 });
  }, [report?.signatures]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderThreatMeter = () => {
    const threatScore = report?.threat_score || 0;
    const threatLevel = report?.threat_level || 0;
    
    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getThreatLevelColor(threatScore)}`}>
              {threatScore}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Threat Score</div>
          </div>
        </div>
        <svg className="w-32 h-32" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted"
            opacity="0.2"
          />
          {/* Threat level arc */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getThreatLevelColor(threatScore)}
            strokeDasharray={`${(threatScore / 100) * 339} 339`}
            transform="rotate(-90 60 60)"
          />
        </svg>
      </div>
    );
  };

  const renderHashSection = () => (
    <div className="space-y-4">
      {report?.sha256 && (
        <HashDisplay label="SHA256" value={report.sha256} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {report?.md5 && <HashDisplay label="MD5" value={report.md5} />}
        {report?.sha1 && <HashDisplay label="SHA1" value={report.sha1} />}
        {report?.sha512 && <HashDisplay label="SHA512" value={report.sha512} />}
      </div>
      {(report?.ssdeep || report?.imphash) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.ssdeep && <HashDisplay label="SSDEEP" value={report.ssdeep} />}
          {report?.imphash && <HashDisplay label="Import Hash" value={report.imphash} />}
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="File Size"
          value={report?.size ? formatFileSize(report.size) : 'Unknown'}
          iconTone="text-sky-300"
        />
        <StatCard
          icon={<Code className="w-4 h-4" />}
          label="File Type"
          value={report?.type_short?.[0] || report?.type || 'Unknown'}
          iconTone="text-violet-300"
        />
        <StatCard
          icon={<Cpu className="w-4 h-4" />}
          label="Environment"
          value={report?.environment_description?.split(' ')[0] || 'Unknown'}
          iconTone="text-cyan-300"
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="Analyzed"
          value={report?.analysis_start_time ? formatDate(report.analysis_start_time).split(',')[0] : 'Unknown'}
          iconTone="text-amber-300"
        />
      </div>

      {/* Hashes */}
      <CollapsibleSection
        title="File Hashes"
        icon={<Hash className="w-5 h-5" />}
        expanded={expandedSections.hashes}
        onToggle={() => toggleSection('hashes')}
      >
        {renderHashSection()}
      </CollapsibleSection>

      {/* PE Information */}
      {(report?.entrypoint || report?.subsystem) && (
        <CollapsibleSection
          title="Portable Executable (PE) Information"
          icon={<Binary className="w-5 h-5" />}
          expanded={expandedSections.peInfo}
          onToggle={() => toggleSection('peInfo')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {report?.entrypoint && (
              <InfoField icon={<Binary className="w-4 h-4" />} label="Entry Point" value={report.entrypoint} />
            )}
            {report?.entrypoint_section && (
              <InfoField icon={<Layers className="w-4 h-4" />} label="Entry Section" value={report.entrypoint_section} />
            )}
            {report?.image_base && (
              <InfoField icon={<HardDrive className="w-4 h-4" />} label="Image Base" value={report.image_base} />
            )}
            {report?.subsystem && (
              <InfoField icon={<Terminal className="w-4 h-4" />} label="Subsystem" value={report.subsystem} />
            )}
          </div>
          
          {/* Characteristics */}
          {(report?.image_file_characteristics || report?.dll_characteristics) && (
            <div className="mt-6 space-y-4">
              {report?.image_file_characteristics && report.image_file_characteristics.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Image Characteristics</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.image_file_characteristics.map((char, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {char.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {report?.dll_characteristics && report.dll_characteristics.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">DLL Characteristics</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.dll_characteristics.map((char, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {char.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Tags */}
      {report?.tags && report.tags.length > 0 && (
        <Section title="Classification Tags" icon={<Tag className="w-5 h-5" />}>
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  );

  const renderBehavioral = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search signatures and techniques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">All Levels</option>
            <option value="3">High (3)</option>
            <option value="2">Medium (2)</option>
            <option value="1">Low (1)</option>
            <option value="0">Info (0)</option>
          </select>
          <select
            value={mitreTacticFilter}
            onChange={(e) => setMitreTacticFilter(e.target.value as MitreTactic | 'all')}
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="all">All Tactics</option>
            {mitreTactics.map(tactic => (
              <option key={tactic} value={tactic}>{tactic}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Threat Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ThreatLevelCard
          level="High"
          count={threatBreakdown.high}
          color="destructive"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <ThreatLevelCard
          level="Medium"
          count={threatBreakdown.medium}
          color="accent"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <ThreatLevelCard
          level="Low"
          count={threatBreakdown.low}
          color="yellow"
          icon={<Shield className="w-4 h-4" />}
        />
        <ThreatLevelCard
          level="Info"
          count={threatBreakdown.info}
          color="blue"
          icon={<Info className="w-4 h-4" />}
        />
      </div>

      {/* Signatures */}
      {report?.signatures && report.signatures.length > 0 && (
        <CollapsibleSection
          title={`Detection Signatures (${filteredSignatures.length})`}
          icon={<Flag className="w-5 h-5" />}
          expanded={expandedSections.signatures}
          onToggle={() => toggleSection('signatures')}
          badge={
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {report.signatures.length} total
            </span>
          }
        >
          <div className="space-y-3">
            {filteredSignatures.slice(0, showAllSignatures ? filteredSignatures.length : 20).map((sig, idx) => (
              <SignatureCard key={idx} signature={sig} />
            ))}
            {filteredSignatures.length > 20 && !showAllSignatures && (
              <div className="text-center pt-4">
                <button 
                  onClick={() => setShowAllSignatures(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Show {filteredSignatures.length - 20} more signatures...
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* MITRE ATT&CK */}
      {report?.mitre_attcks && report.mitre_attcks.length > 0 && (
        <CollapsibleSection
          title={`MITRE ATT&CK Techniques (${filteredMitreAttacks.length})`}
          icon={<Target className="w-5 h-5" />}
          expanded={expandedSections.mitre}
          onToggle={() => toggleSection('mitre')}
          badge={
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {report.mitre_attcks.length} total
            </span>
          }
        >
          <div className="space-y-2">
            {filteredMitreAttacks.slice(0, showAllMitre ? filteredMitreAttacks.length : 15).map((attack, idx) => (
              <MitreAttackCard key={idx} attack={attack} />
            ))}
            {filteredMitreAttacks.length > 15 && !showAllMitre && (
              <div className="text-center pt-4">
                <button 
                  onClick={() => setShowAllMitre(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Show {filteredMitreAttacks.length - 15} more techniques...
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Processes */}
      {report?.processes && report.processes.length > 0 && (
        <CollapsibleSection
          title={`Processes (${report.processes.length})`}
          icon={<Settings className="w-5 h-5" />}
          expanded={expandedSections.processes}
          onToggle={() => toggleSection('processes')}
        >
          <div className="space-y-3">
            {report.processes.slice(0, 10).map((process, idx) => (
              <ProcessCard key={idx} process={process} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Extracted Files */}
      {report?.extracted_files && report.extracted_files.length > 0 && (
        <CollapsibleSection
          title={`Extracted Files (${report.extracted_files.length})`}
          icon={<Package className="w-5 h-5" />}
          expanded={expandedSections.extractedFiles}
          onToggle={() => toggleSection('extractedFiles')}
        >
          <div className="space-y-3">
            {report.extracted_files.slice(0, 10).map((file, idx) => (
              <ExtractedFileCard key={idx} file={file} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );

  const renderNetwork = () => (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<NetworkIcon className="w-4 h-4" />}
          label="Connections"
          value={report?.total_network_connections || 0}
          iconTone="text-sky-300"
        />
        <StatCard
          icon={<Globe className="w-4 h-4" />}
          label="Domains"
          value={report?.domains?.length || 0}
          iconTone="text-emerald-300"
        />
        <StatCard
          icon={<Server className="w-4 h-4" />}
          label="Hosts"
          value={report?.hosts?.length || 0}
          iconTone="text-violet-300"
        />
        <StatCard
          icon={<Link className="w-4 h-4" />}
          label="Compromised"
          value={report?.compromised_hosts?.length || 0}
          iconTone="text-rose-300"
        />
      </div>

      {/* Domains */}
      {report?.domains && report.domains.length > 0 && (
        <CollapsibleSection
          title={`Contacted Domains (${report.domains.length})`}
          icon={<Globe className="w-5 h-5" />}
          expanded={expandedSections.domains}
          onToggle={() => toggleSection('domains')}
        >
          <div className="space-y-2">
            {report.domains.slice(0, 20).map((domain, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <code className="text-sm font-mono">{domain}</code>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(domain)}
                    className="p-1.5 hover:bg-black/10 rounded transition-colors"
                    title="Copy domain"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <a
                    href={`https://www.virustotal.com/gui/domain/${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-black/10 rounded transition-colors"
                    title="Check on VirusTotal"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Certificates */}
      {report?.certificates && report.certificates.length > 0 && (
        <CollapsibleSection
          title={`Certificates (${report.certificates.length})`}
          icon={<FileSignature className="w-5 h-5" />}
          expanded={expandedSections.certificates}
          onToggle={() => toggleSection('certificates')}
          badge={
            <Badge variant={report.is_certificates_valid ? "success" : "destructive"}>
              {report.is_certificates_valid ? 'Valid' : 'Invalid'}
            </Badge>
          }
        >
          <div className="space-y-4">
            {report.certificates.slice(0, 5).map((cert, idx) => (
              <CertificateCard key={idx} certificate={cert} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Hosts */}
      {report?.hosts && report.hosts.length > 0 && (
        <CollapsibleSection
          title={`Contacted Hosts (${report.hosts.length})`}
          icon={<Server className="w-5 h-5" />}
          expanded={expandedSections.hosts}
          onToggle={() => toggleSection('hosts')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.hosts.slice(0, 16).map((host, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  <code className="text-sm font-mono truncate">{host}</code>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );

  const renderStatic = () => (
    <div className="space-y-6">
      {/* File Metadata */}
      {report?.file_metadata && (
        <CollapsibleSection
          title="File Metadata Analysis"
          icon={<FileCode className="w-5 h-5" />}
          expanded={expandedSections.metadata}
          onToggle={() => toggleSection('metadata')}
        >
          <div className="space-y-6">
            {report.file_metadata.total_file_compositions_imports && (
              <div className="p-4 border border-border rounded-lg bg-muted/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Total Imports & Compositions</p>
                      <p className="text-2xl font-bold text-foreground">
                        {report.file_metadata.total_file_compositions_imports}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {report.file_metadata.file_compositions && report.file_metadata.file_compositions.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3">File Compositions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.file_metadata.file_compositions.slice(0, 12).map((comp, idx) => (
                    <div key={idx} className="p-3 border border-border rounded text-sm hover:bg-muted/5 transition-colors">
                      {comp}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {report.file_metadata.imported_objects && report.file_metadata.imported_objects.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3">Imported Objects</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.file_metadata.imported_objects.slice(0, 12).map((obj, idx) => (
                    <div key={idx} className="p-3 border border-border rounded text-sm hover:bg-muted/5 transition-colors">
                      {obj}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Submissions */}
      {report?.submissions && report.submissions.length > 0 && (
        <CollapsibleSection
          title="Recent Submissions"
          icon={<Users className="w-5 h-5" />}
          expanded={expandedSections.submissions}
          onToggle={() => toggleSection('submissions')}
        >
          <div className="space-y-3">
            {report.submissions.slice(0, 5).map((submission, idx) => (
              <SubmissionCard key={idx} submission={submission} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Warnings */}
      {report?.warnings && report.warnings.length > 0 && (
        <CollapsibleSection
          title="Analysis Warnings"
          icon={<AlertCircle className="w-5 h-5" />}
          expanded={expandedSections.warnings}
          onToggle={() => toggleSection('warnings')}
          badge={
            <Badge variant="warning">{report.warnings.length}</Badge>
          }
        >
          <div className="space-y-2">
            {report.warnings.slice(0, showAllWarnings ? report.warnings.length : 10).map((warning, idx) => (
              <WarningCard key={idx} warning={warning} />
            ))}
            {report.warnings.length > 10 && !showAllWarnings && (
              <div className="text-center pt-4">
                <button 
                  onClick={() => setShowAllWarnings(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Show {report.warnings.length - 10} more warnings...
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );

  const renderThreat = () => (
    <div className="space-y-6">
      {/* Threat Assessment Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Meter */}
        <div className="lg:col-span-1">
          <Section title="Threat Assessment" icon={<Shield className="w-5 h-5" />}>
            <div className="flex flex-col items-center justify-center p-6 border border-border rounded-xl">
              {renderThreatMeter()}
              <div className="mt-6 text-center">
                <div className="text-lg font-semibold">{getThreatLevelLabel(report?.threat_score)}</div>
                <div className="text-sm text-muted-foreground">Threat Level {report?.threat_level || 0}</div>
                <div className="mt-4 text-xs text-muted-foreground">
                  AV Detection: {report?.av_detect || 0}%
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Verdict & Details */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5" />
                <h3 className="font-semibold">Verdict</h3>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                  report?.verdict === 'malicious' ? 'bg-destructive/10 text-destructive' :
                  report?.verdict === 'suspicious' ? 'bg-accent/10 text-accent' :
                  report?.verdict === 'whitelisted' ? 'bg-green-500/10 text-green-500' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {getVerdictInfo(report?.verdict || '').icon}
                  {report?.verdict || 'Unknown'}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {report?.interesting ? 'Marked as interesting' : 'No special interest'}
                </p>
              </div>
            </div>

            <div className="p-6 border border-border rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <CpuIcon className="w-5 h-5" />
                <h3 className="font-semibold">Analysis Details</h3>
              </div>
              <div className="space-y-3">
                <InfoField icon={<Calendar className="w-4 h-4" />} label="Started" value={report?.analysis_start_time ? formatDate(report.analysis_start_time) : 'Unknown'} />
                <InfoField icon={<Cpu className="w-4 h-4" />} label="Environment" value={report?.environment_description} />
                <InfoField icon={<Flag className="w-4 h-4" />} label="State" value={report?.state} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CrowdStrike AI Analysis */}
      {report?.crowdstrike_ai && (
        <CollapsibleSection
          title="CrowdStrike AI Analysis"
          icon={<Target className="w-5 h-5" />}
          expanded={expandedSections.crowdstrike}
          onToggle={() => toggleSection('crowdstrike')}
        >
          {report.crowdstrike_ai.executable_process_memory_analysis && 
           report.crowdstrike_ai.executable_process_memory_analysis.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Memory Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.crowdstrike_ai.executable_process_memory_analysis.slice(0, 4).map((analysis, idx) => (
                  <MemoryAnalysisCard key={idx} analysis={analysis} />
                ))}
              </div>
            </div>
          )}
          
          {report.crowdstrike_ai.analysis_related_urls && 
           report.crowdstrike_ai.analysis_related_urls.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3">Related URLs</h4>
              <div className="space-y-2">
                {report.crowdstrike_ai.analysis_related_urls.slice(0, 5).map((url, idx) => (
                  <RelatedUrlCard key={idx} url={url} />
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Machine Learning Models */}
      {report?.machine_learning_models && report.machine_learning_models.length > 0 && (
        <CollapsibleSection
          title="Machine Learning Models"
          icon={<Cpu className="w-5 h-5" />}
          expanded={expandedSections.mlModels}
          onToggle={() => toggleSection('mlModels')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.machine_learning_models.map((model, idx) => (
              <MLModelCard key={idx} model={model} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="relative min-h-full bg-[#080808]">
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading detailed report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="relative min-h-full bg-[#080808]">
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">Failed to load report</p>
            <p className="text-muted-foreground mb-6">{error || 'Report not found'}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full bg-[#080808]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary mb-4"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Report Header - Enhanced */}
        <div className="relative p-6 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] mb-8 overflow-hidden">
          {/* Gradient background based on verdict */}
          <div className={`absolute inset-0 opacity-5 pointer-events-none ${
            report.threat_score && report.threat_score > 70 ? 'bg-gradient-to-r from-destructive via-transparent' :
            report.threat_score && report.threat_score > 40 ? 'bg-gradient-to-r from-accent via-transparent' :
            'bg-gradient-to-r from-primary via-transparent'
          }`}></div>

          <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Threat Grade Badge & Core Info */}
            <div className="flex items-start gap-6">
              {/* Threat Score Meter */}
              <div className="flex-shrink-0">
                {renderThreatMeter()}
              </div>

              {/* File Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-500">
                    Sandbox Report
                  </span>
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 break-all">
                  {report.submit_name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <VerdictBadge verdict={report.verdict || ''} />
                  {report.threat_score !== undefined && (
                    <ThreatScoreBadge score={report.threat_score} />
                  )}
                  {report.interesting && (
                    <Badge variant="warning">
                      <Eye className="w-3 h-3 mr-1" />
                      Interesting
                    </Badge>
                  )}
                </div>

                {/* Key Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">AV Detection</p>
                    <p className="font-bold text-foreground">{report.av_detect || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="font-bold text-foreground">{formatFileSize(report.size || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Analysis Time</p>
                    <p className="font-bold text-foreground text-sm">{formatDate(report.analysis_start_time || '').split(',')[0]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Environment</p>
                    <p className="font-bold text-foreground text-sm">{report.environment_description || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <a
                href={`https://www.hybrid-analysis.com/sample/${report.sha256}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View on HA
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(report.sha256 || '')}
                className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap font-medium text-sm"
                title="Copy SHA256"
              >
                <Copy className="w-4 h-4" />
                Copy Hash
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="glass border border-border rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {([
              { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
              { id: 'behavioral', label: 'Behavioral', icon: <Activity className="w-4 h-4" /> },
              { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
              { id: 'static', label: 'Static Analysis', icon: <Code className="w-4 h-4" /> },
              { id: 'threat', label: 'Threat Intel', icon: <Shield className="w-4 h-4" /> }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'behavioral' && report?.signatures && (
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                    {report.signatures.length}
                  </span>
                )}
                {tab.id === 'network' && report?.domains && (
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                    {report.domains.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'behavioral' && renderBehavioral()}
            {activeTab === 'network' && renderNetwork()}
            {activeTab === 'static' && renderStatic()}
            {activeTab === 'threat' && renderThreat()}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="MITRE ATT&CK"
            value={report.mitre_attcks?.length || 0}
            iconTone="text-emerald-300"
          />
          <StatCard
            icon={<Flag className="w-5 h-5" />}
            label="Signatures"
            value={report.total_signatures || 0}
            iconTone="text-violet-300"
          />
          <StatCard
            icon={<Network className="w-5 h-5" />}
            label="Network"
            value={report.total_network_connections || 0}
            iconTone="text-cyan-300"
          />
          <StatCard
            icon={<Settings className="w-5 h-5" />}
            label="Processes"
            value={report.total_processes || 0}
            iconTone="text-amber-300"
          />
        </div>
      </div>
    </div>
  );
}

// Utility Components

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  expanded, 
  onToggle,
  badge 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  expanded: boolean; 
  onToggle: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <div className="border border-[#1a1a1a] rounded-lg overflow-hidden bg-[#0d0d0d]">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
          {badge}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="px-6 py-4 border-t border-[#1a1a1a]">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoField({ icon, label, value, copyable = false }: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string; 
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!value) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="text-foreground font-medium text-sm break-all font-mono">
        {value}
        {copied && (
          <span className="ml-2 text-xs text-primary animate-pulse">✓ Copied</span>
        )}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, iconTone }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  iconTone: string;
}) {
  return (
    <div className="border border-[#1a1a1a] rounded-lg p-4 bg-[#0d0d0d]">
      <div className="flex items-center gap-3 text-muted-foreground mb-2 text-xs uppercase tracking-wider">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#1a1a1a] bg-[#101214] ${iconTone}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Badge({ 
  children, 
  variant = "default",
  className = ""
}: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border",
    success: "bg-green-500/10 text-green-500 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

function HashDisplay({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 border border-[#1a1a1a] rounded-lg bg-[#0d0d0d] hover:bg-white/5 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Copy hash"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <code className="text-sm font-mono break-all text-white">{value}</code>
      {copied && (
        <div className="text-xs text-primary mt-1 animate-pulse">Copied to clipboard</div>
      )}
    </div>
  );
}

function ThreatLevelCard({ level, count, color, icon }: { 
  level: string; 
  count: number; 
  color: string;
  icon: React.ReactNode;
}) {
  const colorClasses = {
    destructive: 'border-destructive/30 bg-destructive/5',
    accent: 'border-accent/30 bg-accent/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5'
  };

  return (
    <div className={`p-4 border rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="font-semibold text-foreground">{level}</p>
            <p className="text-sm text-muted-foreground">Threat Level</p>
          </div>
        </div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
    </div>
  );
}

function SignatureCard({ signature }: { signature: any }) {
  const threatLevel = signature.threat_level || 0;
  
  return (
    <div className={`p-4 rounded-lg border ${
      threatLevel >= 3 ? 'border-destructive/30 bg-destructive/5' :
      threatLevel === 2 ? 'border-accent/30 bg-accent/5' :
      threatLevel === 1 ? 'border-yellow-500/30 bg-yellow-500/5' :
      'border-border bg-muted/5'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground text-sm">{signature.name}</h4>
            <Badge variant={threatLevel >= 3 ? "destructive" : threatLevel === 2 ? "warning" : "outline"}>
              Level {threatLevel}
            </Badge>
            {signature.category && (
              <Badge variant="secondary" className="text-xs">
                {signature.category}
              </Badge>
            )}
          </div>
          {signature.description && (
            <p className="text-sm text-muted-foreground mb-3">{signature.description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {signature.relevance !== undefined && (
          <span className="px-2 py-1 bg-muted rounded">Relevance: {signature.relevance}</span>
        )}
        {signature.origin && (
          <span className="px-2 py-1 bg-muted rounded">{signature.origin}</span>
        )}
        {signature.attck_id && (
          <Badge variant="outline" className="text-xs">
            ATT&CK: {signature.attck_id}
          </Badge>
        )}
        {signature.capec_id && (
          <Badge variant="outline" className="text-xs">
            CAPEC: {signature.capec_id}
          </Badge>
        )}
      </div>
    </div>
  );
}

function MitreAttackCard({ attack }: { attack: any }) {
  const [expanded, setExpanded] = useState(false);

  // Clean data - remove zero values
  const hasMaliciousIdentifiers = attack.malicious_identifiers_count && attack.malicious_identifiers_count > 0;
  const hasSuspiciousIdentifiers = attack.suspicious_identifiers_count && attack.suspicious_identifiers_count > 0;
  const hasInformativeIdentifiers = attack.informative_identifiers_count && attack.informative_identifiers_count > 0;

  return (
    <div className="border border-[#1a1a1a] rounded-lg overflow-hidden bg-[#0d0d0d]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-sm text-white">{attack.technique}</h4>
            {attack.attck_id && (
              <Badge variant="outline" className="text-xs">
                {attack.attck_id}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{attack.tactic}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Only show badges if there are actual identifiers */}
          {(hasMaliciousIdentifiers || hasSuspiciousIdentifiers || hasInformativeIdentifiers) && (
            <div className="flex items-center gap-2">
              {hasMaliciousIdentifiers && (
                <Badge variant="destructive" className="text-xs">
                  {attack.malicious_identifiers_count} malicious
                </Badge>
              )}
              {hasSuspiciousIdentifiers && (
                <Badge variant="warning" className="text-xs">
                  {attack.suspicious_identifiers_count} suspicious
                </Badge>
              )}
              {hasInformativeIdentifiers && (
                <Badge variant="outline" className="text-xs">
                  {attack.informative_identifiers_count} info
                </Badge>
              )}
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="p-4 border-t border-[#1a1a1a] bg-black/20">
          {attack.parent && attack.parent.technique && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Parent Technique</p>
              <p className="text-sm font-medium text-white">{attack.parent.technique}</p>
            </div>
          )}
          {(attack.malicious_identifiers?.length || attack.suspicious_identifiers?.length || attack.informative_identifiers?.length) && (
            <div className="space-y-3">
              {attack.malicious_identifiers?.length > 0 && (
                <div>
                  <p className="text-xs text-destructive mb-1">Malicious Identifiers</p>
                  <div className="flex flex-wrap gap-1">
                    {attack.malicious_identifiers.slice(0, 3).map((id: string, i: number) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {attack.suspicious_identifiers?.length > 0 && (
                <div>
                  <p className="text-xs text-accent mb-1">Suspicious Identifiers</p>
                  <div className="flex flex-wrap gap-1">
                    {attack.suspicious_identifiers.slice(0, 3).map((id: string, i: number) => (
                      <Badge key={i} variant="warning" className="text-xs">
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {attack.informative_identifiers?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Informative Identifiers</p>
                  <div className="flex flex-wrap gap-1">
                    {attack.informative_identifiers.slice(0, 3).map((id: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProcessCard({ process }: { process: any }) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{process.name}</h4>
            {process.pid && (
              <p className="text-xs text-muted-foreground">PID: {process.pid}</p>
            )}
          </div>
        </div>
        {process.av_label && (
          <Badge variant={process.av_matched && process.av_total ? "destructive" : "outline"}>
            {process.av_label}
          </Badge>
        )}
      </div>
      {process.command_line && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Command Line</p>
          <code className="text-xs font-mono bg-muted p-2 rounded block overflow-x-auto">
            {process.command_line}
          </code>
        </div>
      )}
      {process.normalized_path && (
        <p className="text-xs text-muted-foreground mt-2 truncate">
          Path: {process.normalized_path}
        </p>
      )}
    </div>
  );
}

function ExtractedFileCard({ file }: { file: any }) {
  const threatLevel = file.threat_level || 0;
  
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-semibold text-foreground text-sm">{file.name}</h4>
          <p className="text-xs text-muted-foreground">{file.description}</p>
        </div>
        <Badge variant={threatLevel >= 3 ? "destructive" : threatLevel === 2 ? "warning" : "outline"}>
          Level {threatLevel}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground mt-3">
        <div>Size: {file.file_size ? formatFileSize(file.file_size) : 'Unknown'}</div>
        {file.runtime_process && <div>Process: {file.runtime_process}</div>}
        {file.av_label && <div>AV: {file.av_label}</div>}
      </div>
      {file.sha256 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">SHA256</p>
          <code className="text-xs font-mono truncate block">
            {file.sha256}
          </code>
        </div>
      )}
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: any }) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{certificate.owner || 'Unknown Owner'}</h4>
          <p className="text-sm text-muted-foreground">Issuer: {certificate.issuer || 'Unknown'}</p>
        </div>
        <Badge variant="success">
          Valid
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {certificate.serial_number && (
          <div>
            <p className="text-xs text-muted-foreground">Serial Number</p>
            <code className="font-mono text-xs">{certificate.serial_number.substring(0, 16)}...</code>
          </div>
        )}
        {certificate.valid_from && (
          <div>
            <p className="text-xs text-muted-foreground">Valid From</p>
            <p className="text-sm">{formatDate(certificate.valid_from)}</p>
          </div>
        )}
        {certificate.valid_until && (
          <div>
            <p className="text-xs text-muted-foreground">Valid Until</p>
            <p className="text-sm">{formatDate(certificate.valid_until)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: any }) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-foreground">{submission.filename}</h4>
        {submission.created_at && (
          <span className="text-xs text-muted-foreground">
            {formatDate(submission.created_at)}
          </span>
        )}
      </div>
      {submission.url && (
        <a
          href={submission.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          View submission
        </a>
      )}
    </div>
  );
}

function WarningCard({ warning }: { warning: string }) {
  return (
    <div className="p-3 border border-accent/30 bg-accent/5 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">{warning}</p>
      </div>
    </div>
  );
}

function MemoryAnalysisCard({ analysis }: { analysis: any }) {
  return (
    <div className="p-3 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm truncate">{analysis.filename}</span>
        <Badge variant={analysis.verdict === 'malicious' ? "destructive" : analysis.verdict === 'suspicious' ? "warning" : "outline"}>
          {analysis.verdict}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Address: {analysis.address}</div>
        {analysis.file_process && (
          <div className="truncate">Process: {analysis.file_process}</div>
        )}
      </div>
    </div>
  );
}

function RelatedUrlCard({ url }: { url: any }) {
  return (
    <div className="flex items-center justify-between p-2 border border-border rounded">
      <a
        href={url.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline truncate flex-1"
      >
        {url.url}
      </a>
      <Badge variant={url.verdict === 'malicious' ? "destructive" : url.verdict === 'suspicious' ? "warning" : "outline"} className="ml-2">
        {url.verdict}
      </Badge>
    </div>
  );
}

function MLModelCard({ model }: { model: any }) {
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{model.name}</h4>
          <p className="text-xs text-muted-foreground">v{model.version}</p>
        </div>
        <Badge variant={model.status === 'malicious' ? "destructive" : model.status === 'suspicious' ? "warning" : "success"}>
          {model.status}
        </Badge>
      </div>
      {model.data && model.data.length > 0 && (
        <div className="space-y-1">
          {model.data.slice(0, 3).map((item: any, dataIdx: number) => (
            <div key={dataIdx} className="text-xs text-muted-foreground">
              <span className="font-medium">{item.id}:</span> {item.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const verdictInfo = getVerdictInfo(verdict);
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${verdictInfo.bgColor} ${verdictInfo.color}`}>
      {verdictInfo.icon}
      {verdictInfo.label}
    </div>
  );
}

function ThreatScoreBadge({ score }: { score: number }) {
  const color = getThreatLevelColor(score);
  const label = getThreatLevelLabel(score);
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      score >= 80 ? 'bg-destructive/10 text-destructive' :
      score >= 60 ? 'bg-accent/10 text-accent' :
      score >= 40 ? 'bg-yellow-500/10 text-yellow-500' :
      score >= 20 ? 'bg-blue-500/10 text-blue-500' :
      'bg-green-500/10 text-green-500'
    }`}>
      <BarChart3 className="w-4 h-4" />
      Score: {score}/100 ({label})
    </div>
  );
}