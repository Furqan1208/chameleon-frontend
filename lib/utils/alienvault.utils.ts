// lib/utils/alienvault.utils.ts

import type { OTXResult } from '@/lib/types/alienvault.types';

/**
 * Get threat level color
 */
export function getThreatLevelColor(level: OTXResult['threat_level']): string {
  const colorMap: Record<OTXResult['threat_level'], string> = {
    'high': 'red',
    'medium': 'orange',
    'low': 'yellow',
    'clean': 'green',
    'unknown': 'gray'
  };
  return colorMap[level] || 'gray';
}

/**
 * Get threat level description
 */
export function getThreatLevelDescription(level: OTXResult['threat_level']): string {
  const descMap: Record<OTXResult['threat_level'], string> = {
    'high': 'High threat - Immediate action recommended',
    'medium': 'Medium threat - Further investigation needed',
    'low': 'Low threat - Monitor activity',
    'clean': 'No threat detected',
    'unknown': 'Threat level unknown'
  };
  return descMap[level] || 'Unknown';
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Get indicator type icon name
 */
export function getIndicatorTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'ip': 'Network',
    'IPv4': 'Network',
    'IPv6': 'Globe',
    'domain': 'Globe',
    'hostname': 'Globe',
    'url': 'Link',
    'file': 'FileText',
    'hash': 'Hash',
    'cve': 'Shield',
    'email': 'Mail',
    'mutex': 'Lock'
  };
  return iconMap[type] || 'Search';
}

/**
 * Get indicator type color
 */
export function getIndicatorTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'ip': 'blue',
    'IPv4': 'blue',
    'IPv6': 'blue',
    'domain': 'green',
    'hostname': 'green',
    'url': 'orange',
    'file': 'purple',
    'hash': 'purple',
    'cve': 'red',
    'email': 'pink',
    'mutex': 'indigo'
  };
  return colorMap[type] || 'gray';
}

/**
 * Truncate long strings
 */
export function truncate(str: string, maxLength: number = 50): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Calculate time ago
 */
export function timeAgo(dateString: string): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'Just now';
  } catch {
    return dateString;
  }
}
