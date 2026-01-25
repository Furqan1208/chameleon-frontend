// lib/storage/abusech-storage.ts
'use client';

import type { AbuseChCombinedResult } from '@/hooks/useAbuseCh';

export class AbuseChStorage {
  private static readonly HISTORY_KEY = 'abusech_history';
  private static readonly HISTORY_LIMIT = 50;
  private static readonly BLACKLIST_KEY = 'abusech_blacklist';
  private static readonly CACHE_KEY = 'abusech_cache';

  static getHistory(): AbuseChCombinedResult[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const historyStr = localStorage.getItem(this.HISTORY_KEY);
      if (!historyStr) return [];
      
      const history = JSON.parse(historyStr);
      return history.sort((a: AbuseChCombinedResult, b: AbuseChCombinedResult) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to load Abuse.ch history:', error);
      return [];
    }
  }

  static addToHistory(result: AbuseChCombinedResult): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getHistory();
      
      // Remove duplicates (same indicator)
      const filteredHistory = history.filter(item => 
        item.indicator !== result.indicator
      );
      
      const newHistory = [result, ...filteredHistory].slice(0, this.HISTORY_LIMIT);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save Abuse.ch history:', error);
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
      
      // Check for expired cache entries (1 hour TTL)
      const now = Date.now();
      Object.entries(cacheData).forEach(([key, value]: [string, any]) => {
        if (now - value.timestamp < 3600000) {
          cache.set(key, value.data);
        }
      });
      
      return cache;
    } catch (error) {
      console.error('Failed to load Abuse.ch cache:', error);
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
      console.error('Failed to save Abuse.ch cache:', error);
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
      console.error('Failed to save Abuse.ch blacklist:', error);
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
      console.error('Failed to load Abuse.ch blacklist:', error);
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