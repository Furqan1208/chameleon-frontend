import React from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  Globe,
  Code,
  Archive,
  Image as ImageIcon,
  Cpu,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  File,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  Tag,
  Clock,
  Hash,
  X,
  Settings,
  Info,
  Database,
  Terminal,
  Layers,
  Target,
  Zap
} from 'lucide-react';
import type { FileScanVerdict, FileScanThreatLevel, AnalysisResult } from './filescan-types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    // Try parsing different date formats
    let date: Date;
    
    // Try parsing as ISO string
    date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // Try parsing custom format like "09/16/2024, 11:42:55"
    const parts = dateString.split(', ');
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const [month, day, year] = datePart.split('/');
      const [hour, minute, second] = timePart.split(':');
      date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
    
    return dateString;
  } catch {
    return dateString;
  }
}

export function getVerdictInfo(verdict: FileScanVerdict): {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
} {
  switch (verdict) {
    case 'MALICIOUS':
      return {
        label: 'Malicious',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: React.createElement(AlertTriangle, { className: 'w-4 h-4' })
      };
    case 'LIKELY_MALICIOUS':
      return {
        label: 'Likely Malicious',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        icon: React.createElement(AlertCircle, { className: 'w-4 h-4' })
      };
    case 'SUSPICIOUS':
      return {
        label: 'Suspicious',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: React.createElement(ShieldAlert, { className: 'w-4 h-4' })
      };
    case 'NO_THREAT':
      return {
        label: 'No Threat',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        icon: React.createElement(CheckCircle, { className: 'w-4 h-4' })
      };
    case 'BENIGN':
      return {
        label: 'Benign',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        icon: React.createElement(ShieldCheck, { className: 'w-4 h-4' })
      };
    case 'INFORMATIONAL':
      return {
        label: 'Informational',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        icon: React.createElement(FileText, { className: 'w-4 h-4' })
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        icon: React.createElement(HelpCircle, { className: 'w-4 h-4' })
      };
  }
}

export function getThreatLevelInfo(threatLevel: FileScanThreatLevel): {
  label: string;
  color: string;
  description: string;
} {
  switch (threatLevel) {
    case 0:
      return {
        label: 'None',
        color: 'text-green-600',
        description: 'No threat detected'
      };
    case 1:
      return {
        label: 'Low',
        color: 'text-green-500',
        description: 'Minimal threat'
      };
    case 2:
      return {
        label: 'Medium',
        color: 'text-yellow-600',
        description: 'Moderate threat'
      };
    case 3:
      return {
        label: 'High',
        color: 'text-orange-600',
        description: 'Significant threat'
      };
    case 4:
      return {
        label: 'Critical',
        color: 'text-red-600',
        description: 'Critical threat'
      };
    case 5:
      return {
        label: 'Severe',
        color: 'text-red-700',
        description: 'Severe threat requiring immediate action'
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        description: 'Unknown threat level'
      };
  }
}

export function getFileTypeIcon(type: string): React.ReactNode {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('pe') || lowerType.includes('exe') || lowerType.includes('dll')) {
    return React.createElement(Cpu, { className: 'w-4 h-4' });
  } else if (lowerType.includes('pdf')) {
    return React.createElement(FileText, { className: 'w-4 h-4' });
  } else if (lowerType.includes('doc') || lowerType.includes('word')) {
    return React.createElement(FileText, { className: 'w-4 h-4' });
  } else if (lowerType.includes('html') || lowerType.includes('htm')) {
    return React.createElement(Globe, { className: 'w-4 h-4' });
  } else if (lowerType.includes('zip') || lowerType.includes('rar') || lowerType.includes('7z') || lowerType.includes('tar')) {
    return React.createElement(Archive, { className: 'w-4 h-4' });
  } else if (lowerType.includes('jpg') || lowerType.includes('png') || lowerType.includes('gif') || lowerType.includes('image')) {
    return React.createElement(ImageIcon, { className: 'w-4 h-4' });
  } else if (lowerType.includes('js') || lowerType.includes('py') || lowerType.includes('ps1') || lowerType.includes('bat')) {
    return React.createElement(Code, { className: 'w-4 h-4' });
  }
  
  return React.createElement(File, { className: 'w-4 h-4' });
}

export function getFileTypeColor(type: string): string {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('pe') || lowerType.includes('exe') || lowerType.includes('dll')) {
    return 'text-purple-600';
  } else if (lowerType.includes('pdf')) {
    return 'text-red-600';
  } else if (lowerType.includes('doc') || lowerType.includes('word')) {
    return 'text-blue-600';
  } else if (lowerType.includes('html') || lowerType.includes('htm')) {
    return 'text-green-600';
  } else if (lowerType.includes('zip') || lowerType.includes('rar') || lowerType.includes('7z')) {
    return 'text-yellow-600';
  } else if (lowerType.includes('jpg') || lowerType.includes('png') || lowerType.includes('gif')) {
    return 'text-pink-600';
  } else if (lowerType.includes('js') || lowerType.includes('py') || lowerType.includes('ps1')) {
    return 'text-orange-600';
  }
  
  return 'text-gray-600';
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-green-500';
  if (confidence >= 0.5) return 'text-yellow-500';
  if (confidence >= 0.3) return 'text-orange-500';
  return 'text-red-500';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
}

export function truncateHash(hash: string, maxLength: number = 16): string {
  if (hash.length <= maxLength) return hash;
  const half = Math.floor(maxLength / 2);
  return `${hash.substring(0, half)}...${hash.substring(hash.length - half)}`;
}

export function getHashType(hash: string): string {
  const length = hash.length;
  switch (length) {
    case 32: return 'MD5';
    case 40: return 'SHA1';
    case 64: return 'SHA256';
    case 128: return 'SHA512';
    default: return 'Unknown';
  }
}

export function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.9) return 'text-green-600';
  if (similarity >= 0.7) return 'text-green-500';
  if (similarity >= 0.5) return 'text-yellow-500';
  if (similarity >= 0.3) return 'text-orange-500';
  return 'text-red-500';
}

export function formatSimilarity(similarity: number): string {
  return `${(similarity * 100).toFixed(1)}%`;
}

export function calculateProgress(estimatedTime?: string, progress?: number): number {
  if (progress !== undefined) {
    return progress;
  }
  
  if (estimatedTime) {
    const seconds = parseInt(estimatedTime);
    if (!isNaN(seconds) && seconds > 0) {
      const maxTime = 300; // 5 minutes max
      return Math.min(95, (seconds / maxTime) * 100);
    }
  }
  
  return 0;
}