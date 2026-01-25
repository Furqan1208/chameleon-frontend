// lib/storage/urlhaus-storage.ts
'use client';

export interface URLhausHistoryItem {
  id: string;
  indicator: string;
  timestamp: string;
  result: any;
  threat_level: string;
  tags: string[];
}

export class URLhausStorage {
  private static readonly HISTORY_KEY = 'urlhaus_history';
  private static readonly HISTORY_LIMIT = 50;

  static getHistory(): URLhausHistoryItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const historyStr = localStorage.getItem(this.HISTORY_KEY);
      if (!historyStr) return [];
      
      const history = JSON.parse(historyStr);
      return history.sort((a: URLhausHistoryItem, b: URLhausHistoryItem) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to load URLhaus history:', error);
      return [];
    }
  }

  static addToHistory(result: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const history = this.getHistory();
      
      const historyItem: URLhausHistoryItem = {
        id: `${result.id || result.url || result.hash}_${Date.now()}`,
        indicator: result.url || result.hash || result.host || 'unknown',
        timestamp: new Date().toISOString(),
        result: result,
        threat_level: result.threat || 'unknown',
        tags: result.tags || []
      };
      
      // Remove duplicates
      const filteredHistory = history.filter(item => 
        item.indicator !== historyItem.indicator
      );
      
      const newHistory = [historyItem, ...filteredHistory].slice(0, this.HISTORY_LIMIT);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save URLhaus history:', error);
    }
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.HISTORY_KEY);
  }
}