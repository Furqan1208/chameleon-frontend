// lib/threat-intel/ha-utils.ts
import React from 'react';
import { AlertTriangle, Shield, HelpCircle, CheckCircle } from 'lucide-react';
import type { HAAnalysisResult, HAExtractedFile, HAMitreAttack, HASignature } from './ha-types';

export async function calculateFileHash(file: File, algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256'): Promise<string | null> {
  try {
    // Check if crypto.subtle is available
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Calculate hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest(
      algorithm.toUpperCase(),
      arrayBuffer
    );
    
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log(`Calculated ${algorithm.toUpperCase()} for ${file.name}: ${hashHex}`);
    return hashHex;
  } catch (error) {
    console.error('Error calculating hash:', error);
    
    // For development/testing, you could return a mock hash
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock hash for development testing');
      // Return a consistent mock hash for testing
      return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // Empty file SHA256
    }
    
    return null;
  }
}

export function validateHash(hash: string): { isValid: boolean; type: string | null } {
  const cleanHash = hash.trim().toLowerCase();
  
  // Remove any spaces or dashes
  const normalizedHash = cleanHash.replace(/[\s\-]/g, '');
  
  // Check if it's a valid hex string
  if (!/^[0-9a-f]+$/i.test(normalizedHash)) {
    return { isValid: false, type: null };
  }
  
  switch (normalizedHash.length) {
    case 32:
      return { isValid: true, type: 'MD5' };
    case 40:
      return { isValid: true, type: 'SHA1' };
    case 64:
      return { isValid: true, type: 'SHA256' };
    case 128:
      return { isValid: true, type: 'SHA512' };
    default:
      return { isValid: false, type: null };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getVerdictInfo(verdict: string | number): {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
} {
  if (typeof verdict === 'number') {
    if (verdict === 60) {
      return {
        label: 'Malicious',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        icon: React.createElement(AlertTriangle, { className: 'w-4 h-4' })
      };
    }
    if (verdict === 50) {
      return {
        label: 'Suspicious',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        icon: React.createElement(AlertTriangle, { className: 'w-4 h-4' })
      };
    }
    if (verdict === 40) {
      return {
        label: 'No Specific Threat',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10',
        icon: React.createElement(Shield, { className: 'w-4 h-4' })
      };
    }
    if (verdict === 30) {
      return {
        label: 'No Verdict',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        icon: React.createElement(HelpCircle, { className: 'w-4 h-4' })
      };
    }
    if (verdict === 20) {
      return {
        label: 'Whitelisted',
        color: 'text-green-600',
        bgColor: 'bg-green-500/10',
        icon: React.createElement(CheckCircle, { className: 'w-4 h-4' })
      };
    }
  }
  
  const verdictStr = String(verdict).toLowerCase();
  if (verdictStr === 'malicious') {
    return {
      label: 'Malicious',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      icon: React.createElement(AlertTriangle, { className: 'w-4 h-4' })
    };
  }
  if (verdictStr === 'suspicious') {
    return {
      label: 'Suspicious',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      icon: React.createElement(AlertTriangle, { className: 'w-4 h-4' })
    };
  }
  if (verdictStr === 'no_specific_threat' || verdictStr === 'no specific threat') {
    return {
      label: 'No Specific Threat',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
      icon: React.createElement(Shield, { className: 'w-4 h-4' })
    };
  }
  if (verdictStr === 'whitelisted') {
    return {
      label: 'Whitelisted',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      icon: React.createElement(CheckCircle, { className: 'w-4 h-4' })
    };
  }
  
  return {
    label: 'Unknown',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    icon: React.createElement(HelpCircle, { className: 'w-4 h-4' })
  };
}

export function getThreatLevelColor(threatScore?: number): string {
  if (threatScore === undefined || threatScore === null) return 'text-muted-foreground';
  
  if (threatScore >= 80) return 'text-destructive';
  if (threatScore >= 60) return 'text-accent';
  if (threatScore >= 40) return 'text-yellow-500';
  if (threatScore >= 20) return 'text-blue-500';
  return 'text-green-500';
}

export function getThreatLevelLabel(threatScore?: number): string {
  if (threatScore === undefined || threatScore === null) return 'Unknown';
  
  if (threatScore >= 80) return 'Very High';
  if (threatScore >= 60) return 'High';
  if (threatScore >= 40) return 'Medium';
  if (threatScore >= 20) return 'Low';
  return 'Very Low';
}

export function extractBehavioralIndicators(summaryLike: {
  mitre_attcks?: HAMitreAttack[];
  signatures?: HASignature[];
  total_network_connections?: number;
  total_processes?: number;
  extracted_files?: HAExtractedFile[];
}): string[] {
  const indicators: string[] = [];

  const mitre = summaryLike.mitre_attcks || [];
  if (mitre.length) {
    mitre.slice(0, 3).forEach(attack => {
      indicators.push(`MITRE: ${attack.technique} (${attack.tactic})`);
    });
  }

  const sigs = summaryLike.signatures || [];
  if (sigs.length) {
    const highRiskSignatures = sigs
      .filter(sig => sig.threat_level >= 3)
      .slice(0, 3);
    highRiskSignatures.forEach(sig => {
      indicators.push(`Signature: ${sig.name}`);
    });
  }

  if (summaryLike.total_network_connections) {
    indicators.push(`Network connections: ${summaryLike.total_network_connections}`);
  }

  if (summaryLike.total_processes) {
    indicators.push(`Processes created: ${summaryLike.total_processes}`);
  }

  if (summaryLike.extracted_files?.length) {
    indicators.push(`Files extracted: ${summaryLike.extracted_files.length}`);
  }

  return indicators;
}

export function getMimeType(overview: any): string {
  if (overview?.scanners_v2?.metadefender?.anti_virus_results?.[0]?.mime) {
    return overview.scanners_v2.metadefender.anti_virus_results[0].mime;
  }
  return 'Unknown';
}