'use client';

import { useState } from 'react';
import {
	AlertTriangle,
	CheckCircle,
	Shield,
	ChevronDown,
	ChevronUp,
	Copy,
	ExternalLink,
	Globe,
	Flag,
	Network,
	Building,
	Tag,
	MessageSquare,
	Eye,
	EyeOff,
	Radar,
	Clock,
} from 'lucide-react';

interface AbuseIPDBResultsProps {
	results: any[];
}

export function AbuseIPDBResults({ results }: AbuseIPDBResultsProps) {
	const [expandedResult, setExpandedResult] = useState<string | null>(null);
	const [copied, setCopied] = useState<string | null>(null);

	const handleCopy = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopied(id);
		setTimeout(() => setCopied(null), 2000);
	};

	const toggleExpand = (ip: string) => {
		setExpandedResult(expandedResult === ip ? null : ip);
	};

	const getThreatTone = (threatLevel: string) => {
		switch (threatLevel) {
			case 'high':
				return {
					badge: 'bg-destructive/20 text-destructive border-destructive/30',
					border: 'border-destructive/30',
					icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
					label: 'High Risk',
				};
			case 'medium':
				return {
					badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
					border: 'border-amber-500/30',
					icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
					label: 'Medium Risk',
				};
			case 'low':
				return {
					badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
					border: 'border-yellow-500/30',
					icon: <Shield className="w-5 h-5 text-yellow-400" />,
					label: 'Low Risk',
				};
			case 'clean':
				return {
					badge: 'bg-primary/20 text-primary border-primary/30',
					border: 'border-primary/30',
					icon: <CheckCircle className="w-5 h-5 text-primary" />,
					label: 'Clean',
				};
			default:
				return {
					badge: 'bg-muted/20 text-muted-foreground border-[#1a1a1a]',
					border: 'border-[#1a1a1a]',
					icon: <Shield className="w-5 h-5 text-muted-foreground" />,
					label: 'Unknown',
				};
		}
	};

	const formatDate = (dateString: string): string => {
		if (!dateString || dateString === 'N/A') return 'N/A';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return dateString;
		}
	};

	if (results.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-white">Result Intelligence</h3>
				<div className="text-sm text-muted-foreground">
					{results.filter((r) => r.found).length} found • {results.filter((r) => r.threat_level === 'high').length} high risk
				</div>
			</div>

			{results.map((result, index) => {
				const isExpanded = expandedResult === result.ioc;
				const tone = getThreatTone(result.threat_level);

				return (
					<div key={`${result.ioc}-${index}`} className={`border rounded-xl overflow-hidden bg-[#0d0d0d] ${tone.border}`}>
						<div className="p-4 cursor-pointer" onClick={() => toggleExpand(result.ioc)}>
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3 flex-1 min-w-0">
									<div className="p-2 rounded-lg bg-black/20 border border-[#1a1a1a]">{tone.icon}</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<span className="text-xs uppercase tracking-wider text-muted-foreground">IP Address</span>
											<span className={`px-2 py-0.5 rounded text-xs font-medium border ${tone.badge}`}>{tone.label}</span>
										</div>

										<p className="font-mono text-sm break-all text-white mb-1">{result.ioc}</p>

										<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
											<div className="rounded-lg border border-[#1a1a1a] bg-black/20 px-2 py-1.5">
												<p className="text-muted-foreground">Confidence</p>
												<p className="text-white font-medium">{result.confidence_score}%</p>
											</div>
											<div className="rounded-lg border border-[#1a1a1a] bg-black/20 px-2 py-1.5">
												<p className="text-muted-foreground">Reports</p>
												<p className="text-white font-medium">{result.total_reports || 0}</p>
											</div>
											<div className="rounded-lg border border-[#1a1a1a] bg-black/20 px-2 py-1.5">
												<p className="text-muted-foreground">Distinct Users</p>
												<p className="text-white font-medium">{result.num_distinct_users || 0}</p>
											</div>
											<div className="rounded-lg border border-[#1a1a1a] bg-black/20 px-2 py-1.5">
												<p className="text-muted-foreground">Country</p>
												<p className="text-white font-medium truncate">{result.country_name || result.country_code || 'N/A'}</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 ml-3">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleCopy(result.ioc, `copy-ip-${index}`);
										}}
										className="p-1.5 rounded hover:bg-black/30 transition-colors"
										title="Copy IP"
									>
										<Copy className="w-4 h-4" />
									</button>
									<a
										href={`https://www.abuseipdb.com/check/${result.ioc}`}
										target="_blank"
										rel="noopener noreferrer"
										onClick={(e) => e.stopPropagation()}
										className="p-1.5 rounded hover:bg-black/30 transition-colors"
										title="View on AbuseIPDB"
									>
										<ExternalLink className="w-4 h-4" />
									</a>
									<button
										className="p-1.5 rounded hover:bg-black/30 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											toggleExpand(result.ioc);
										}}
									>
										{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
									</button>
								</div>
							</div>

							{copied === `copy-ip-${index}` && <div className="mt-2 text-xs text-primary animate-pulse">Copied to clipboard</div>}
						</div>

						{isExpanded && (
							<div className="border-t border-[#1a1a1a] bg-black/20 p-4 space-y-6">
								<div>
									<h4 className="font-semibold text-white mb-3 flex items-center gap-2">
										<Globe className="w-4 h-4 text-primary" />
										IP Context
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
										<InfoItem label="ISP" value={result.isp || 'N/A'} icon={<Building className="w-3.5 h-3.5" />} />
										<InfoItem label="Domain" value={result.domain || 'N/A'} icon={<Network className="w-3.5 h-3.5" />} />
										<InfoItem label="Usage Type" value={result.usage_type || 'N/A'} icon={<Tag className="w-3.5 h-3.5" />} />
										<InfoItem label="Country" value={result.country_name || result.country_code || 'N/A'} icon={<Flag className="w-3.5 h-3.5" />} />
										<InfoItem label="Tor Exit" value={result.is_tor ? 'Yes' : 'No'} icon={<EyeOff className="w-3.5 h-3.5" />} />
										<InfoItem label="Public IP" value={result.is_public ? 'Yes' : 'No'} icon={<Shield className="w-3.5 h-3.5" />} />
									</div>
								</div>

								<div>
									<h4 className="font-semibold text-white mb-3 flex items-center gap-2">
										<Radar className="w-4 h-4 text-primary" />
										Report Stats
									</h4>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
										<StatPill label="Confidence" value={`${result.confidence_score}%`} tone={result.confidence_score >= 90 ? 'danger' : result.confidence_score >= 70 ? 'warn' : 'ok'} />
										<StatPill label="Total Reports" value={(result.total_reports || 0).toString()} tone="info" />
										<StatPill label="Distinct Users" value={(result.num_distinct_users || 0).toString()} tone="ok" />
										<StatPill label="Last Report" value={formatDate(result.last_reported_at)} tone="neutral" />
									</div>
								</div>

								{result.categories && result.categories.length > 0 && (
									<div>
										<h4 className="font-semibold text-white mb-3 flex items-center gap-2">
											<Tag className="w-4 h-4 text-primary" />
											Abuse Categories ({result.categories.length})
										</h4>
										<div className="flex flex-wrap gap-2">
											{result.categories.map((category: any, idx: number) => (
												<div key={`${category.name || 'cat'}-${idx}`} className="px-3 py-1.5 rounded-lg border border-[#1a1a1a] bg-black/20 text-xs">
													<span className="text-white font-medium">{category.name}</span>
													<span className="ml-2 text-muted-foreground">x{category.count}</span>
												</div>
											))}
										</div>
									</div>
								)}

								{result.reports && result.reports.length > 0 && (
									<div>
										<h4 className="font-semibold text-white mb-3 flex items-center gap-2">
											<MessageSquare className="w-4 h-4 text-primary" />
											Recent Reports ({result.reports.length})
										</h4>
										<div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
											{result.reports.map((report: any, idx: number) => (
												<div key={`${result.ioc}-report-${idx}`} className="p-3 rounded-lg border border-[#1a1a1a] bg-black/20">
													<div className="flex items-start justify-between gap-2 mb-2">
														<div className="flex items-center gap-2 text-xs text-muted-foreground">
															<Flag className="w-3 h-3" />
															<span>{report.reporter_country || 'Unknown country'}</span>
														</div>
														<span className="text-xs text-muted-foreground flex items-center gap-1">
															<Clock className="w-3 h-3" />
															{formatDate(report.date)}
														</span>
													</div>

													{report.comment && <p className="text-sm text-foreground/90 mb-2">{report.comment}</p>}

													{Array.isArray(report.categories) && report.categories.length > 0 && (
														<div className="flex flex-wrap gap-1">
															{report.categories.map((category: string, catIdx: number) => (
																<span key={`${result.ioc}-report-${idx}-cat-${catIdx}`} className="px-2 py-0.5 text-xs rounded bg-muted/20 text-muted-foreground">
																	{category}
																</span>
															))}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{result.hostnames && result.hostnames.length > 0 && (
									<div>
										<h4 className="font-semibold text-white mb-3 flex items-center gap-2">
											<Network className="w-4 h-4 text-primary" />
											Associated Hostnames ({result.hostnames.length})
										</h4>
										<div className="flex flex-wrap gap-2">
											{result.hostnames.slice(0, 12).map((hostname: string, idx: number) => (
												<code key={`${result.ioc}-host-${idx}`} className="px-2 py-1 text-xs border border-[#1a1a1a] bg-black/20 rounded font-mono text-foreground/90">
													{hostname}
												</code>
											))}
											{result.hostnames.length > 12 && <span className="text-xs text-muted-foreground italic self-center">+{result.hostnames.length - 12} more</span>}
										</div>
									</div>
								)}

								{result.raw_data && (
									<details className="group rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
										<summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
											<Eye className="w-4 h-4" />
											View Raw Data
											<span className="ml-auto group-open:rotate-90 transition-transform">→</span>
										</summary>
										<div className="mt-3 p-3 bg-black/30 rounded-lg overflow-x-auto border border-[#1a1a1a]">
											<pre className="text-xs font-mono text-foreground/80">{JSON.stringify(result.raw_data, null, 2)}</pre>
										</div>
									</details>
								)}

								<div className="flex items-center gap-2">
									<a
										href={`https://www.abuseipdb.com/check/${result.ioc}`}
										target="_blank"
										rel="noopener noreferrer"
										className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium inline-flex items-center gap-2"
									>
										<ExternalLink className="w-4 h-4" />
										Open in AbuseIPDB
									</a>
									<button
										onClick={() => handleCopy(result.ioc, `copy-footer-${index}`)}
										className="px-4 py-2 border border-[#1a1a1a] rounded-lg hover:bg-black/20 transition-colors text-sm inline-flex items-center gap-2"
									>
										<Copy className="w-4 h-4" />
										Copy IP
									</button>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
	return (
		<div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
			<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
				{icon}
				<span>{label}</span>
			</div>
			<p className="text-sm text-white font-medium break-words">{value || 'N/A'}</p>
		</div>
	);
}

function StatPill({ label, value, tone }: { label: string; value: string; tone: 'danger' | 'warn' | 'ok' | 'info' | 'neutral' }) {
	const toneClass =
		tone === 'danger'
			? 'border-destructive/30 bg-destructive/10 text-destructive'
			: tone === 'warn'
			? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
			: tone === 'ok'
			? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
			: tone === 'info'
			? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
			: 'border-[#1a1a1a] bg-black/20 text-muted-foreground';

	return (
		<div className={`rounded-lg border p-3 ${toneClass}`}>
			<p className="text-[11px] uppercase tracking-wider mb-1">{label}</p>
			<p className="text-sm font-semibold break-words">{value}</p>
		</div>
	);
}
