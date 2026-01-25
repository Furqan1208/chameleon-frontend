// lib/storage/abuseipdb-storage.ts
'use client';

export interface AbuseIPDBHistoryItem {
  id: string;
  ip: string;
  timestamp: string;
  result: any; // Full result object
  confidence_score: number;
  threat_level: string;
  country: string;
}

export class AbuseIPDBStorage {
  private static readonly HISTORY_KEY = 'abuseipdb_history';
  private static readonly HISTORY_LIMIT = 50; // Keep last 50 searches
  private static readonly CACHE_KEY = 'abuseipdb_cache';
  private static readonly BLACKLIST_KEY = 'abuseipdb_blacklist';

  static getHistory(): AbuseIPDBHistoryItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const historyStr = localStorage.getItem(this.HISTORY_KEY);
      if (!historyStr) return [];
      
      const history = JSON.parse(historyStr);
      // Sort by timestamp descending (newest first)
      return history.sort((a: AbuseIPDBHistoryItem, b: AbuseIPDBHistoryItem) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  static addToHistory(result: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getHistory();
      
      // Create history item
      const historyItem: AbuseIPDBHistoryItem = {
        id: `${result.ip}_${Date.now()}`,
        ip: result.ip,
        timestamp: new Date().toISOString(),
        result: result,
        confidence_score: result.confidence_score,
        threat_level: result.threat_level,
        country: result.country
      };
      
      // Remove duplicates of the same IP (keep only the latest)
      const filteredHistory = history.filter(item => item.ip !== result.ip);
      
      // Add new item and keep within limit
      const newHistory = [historyItem, ...filteredHistory].slice(0, this.HISTORY_LIMIT);
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.HISTORY_KEY);
  }

  static getCache(): Map<string, any> {
    if (typeof window === 'undefined') return new Map();
    
    try {
      const cacheStr = localStorage.getItem(this.CACHE_KEY);
      if (!cacheStr) return new Map();
      
      const cacheData = JSON.parse(cacheStr);
      const cache = new Map();
      
      // Check for expired cache entries
      const now = Date.now();
      Object.entries(cacheData).forEach(([key, value]: [string, any]) => {
        if (now - value.timestamp < 3600000) { // 1 hour TTL
          cache.set(key, value.data);
        }
      });
      
      return cache;
    } catch (error) {
      console.error('Failed to load cache:', error);
      return new Map();
    }
  }

  static setCache(key: string, data: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cache = this.getCache();
      const cacheData: Record<string, { data: any; timestamp: number }> = {};
      
      // Convert Map to object
      cache.forEach((value, cacheKey) => {
        cacheData[cacheKey] = { data: value, timestamp: Date.now() };
      });
      
      // Add/update the new entry
      cacheData[key] = { data, timestamp: Date.now() };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  static clearCache(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.CACHE_KEY);
  }

  static saveBlacklist(blacklist: any[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.BLACKLIST_KEY, JSON.stringify({
        data: blacklist,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save blacklist:', error);
    }
  }

  static getBlacklist(): any[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const blacklistStr = localStorage.getItem(this.BLACKLIST_KEY);
      if (!blacklistStr) return [];
      
      const blacklistData = JSON.parse(blacklistStr);
      
      // Check if blacklist is less than 24 hours old
      if (Date.now() - blacklistData.timestamp < 86400000) {
        return blacklistData.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to load blacklist:', error);
      return [];
    }
  }

  static clearBlacklist(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.BLACKLIST_KEY);
  }

  static clearAll(): void {
    this.clearHistory();
    this.clearCache();
    this.clearBlacklist();
  }
}