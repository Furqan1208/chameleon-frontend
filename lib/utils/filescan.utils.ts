// lib/utils/filescan.utils.ts

import type { FileScanVerdict, FileScanThreatLevel } from '@/lib/types/filescan.types';

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get verdict color and label
 */
export function getVerdictInfo(verdict: FileScanVerdict): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (verdict) {
    case 'MALICIOUS':
      return {
        label: 'Malicious',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
      };
    case 'LIKELY_MALICIOUS':
      return {
        label: 'Likely Malicious',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      };
    case 'SUSPICIOUS':
      return {
        label: 'Suspicious',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      };
    case 'NO_THREAT':
      return {
        label: 'No Threat',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
      };
    case 'BENIGN':
      return {
        label: 'Benign',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
      };
    case 'INFORMATIONAL':
      return {
        label: 'Informational',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
      };
  }
}

/**
 * Get threat level info
 */
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

/**
 * Get file type icon name
 */
export function getFileTypeIcon(type: string): string {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('pe') || lowerType.includes('exe') || lowerType.includes('dll')) {
    return 'cpu';
  } else if (lowerType.includes('pdf')) {
    return 'file-text';
  } else if (lowerType.includes('doc') || lowerType.includes('word')) {
    return 'file-text';
  } else if (lowerType.includes('html') || lowerType.includes('htm')) {
    return 'globe';
  } else if (lowerType.includes('zip') || lowerType.includes('rar') || lowerType.includes('7z')) {
    return 'archive';
  } else if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) {
    return 'image';
  } else if (lowerType.includes('script') || lowerType.includes('js') || lowerType.includes('py')) {
    return 'code';
  }
  
  return 'file';
}

/**
 * Get file type color
 */
export function getFileTypeColor(type: string): string {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('pe') || lowerType.includes('exe') || lowerType.includes('dll')) {
    return 'purple';
  } else if (lowerType.includes('pdf')) {
    return 'red';
  } else if (lowerType.includes('doc') || lowerType.includes('word')) {
    return 'blue';
  } else if (lowerType.includes('html') || lowerType.includes('htm')) {
    return 'green';
  } else if (lowerType.includes('zip') || lowerType.includes('rar')) {
    return 'yellow';
  } else if (lowerType.includes('image')) {
    return 'pink';
  } else if (lowerType.includes('script')) {
    return 'orange';
  }
  
  return 'gray';
}

/**
 * Truncate hash for display
 */
export function truncateHash(hash: string, maxLength: number = 16): string {
  if (hash.length <= maxLength) return hash;
  const half = Math.floor(maxLength / 2);
  return `${hash.substring(0, half)}...${hash.substring(hash.length - half)}`;
}

/**
 * Get hash type from length
 */
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

/**
 * Calculate progress percentage
 */
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

/**
 * Get confidence level color
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.6) return 'text-blue-600';
  if (confidence >= 0.4) return 'text-yellow-600';
  if (confidence >= 0.2) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'Very High';
  if (confidence >= 0.6) return 'High';
  if (confidence >= 0.4) return 'Medium';
  if (confidence >= 0.2) return 'Low';
  return 'Very Low';
}

/**
 * Get similarity score color
 */
export function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.9) return 'text-red-600';
  if (similarity >= 0.7) return 'text-orange-600';
  if (similarity >= 0.5) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Format similarity score as percentage
 */
export function formatSimilarity(similarity: number): string {
  return `${(similarity * 100).toFixed(1)}%`;
}
