// D:\FYP\Chameleon Frontend\lib\threat-intel\otx-cache.ts

import type { OTXScanHistory } from './otx-types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

class OTXMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttlMinutes = 30) {
    this.ttl = ttlMinutes * 60 * 1000;
    this.startCleanup();
  }

  private startCleanup() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;

      if (Date.now() > entry.expires) {
        this.cache.delete(key);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.warn('[OTXMemoryCache] Error getting cache entry:', error);
      return null;
    }
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    try {
      const ttl = customTTL ? customTTL * 60 * 1000 : this.ttl;
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        expires: Date.now() + ttl
      });
    } catch (error) {
      console.warn('[OTXMemoryCache] Error setting cache entry:', error);
    }
  }

  delete(key: string): boolean {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.warn('[OTXMemoryCache] Error deleting cache entry:', error);
      return false;
    }
  }

  clear(): void {
    try {
      this.cache.clear();
    } catch (error) {
      console.warn('[OTXMemoryCache] Error clearing cache:', error);
    }
  }

  keys(): string[] {
    try {
      return Array.from(this.cache.keys());
    } catch (error) {
      console.warn('[OTXMemoryCache] Error getting cache keys:', error);
      return [];
    }
  }

  size(): number {
    try {
      return this.cache.size;
    } catch (error) {
      console.warn('[OTXMemoryCache] Error getting cache size:', error);
      return 0;
    }
  }

  private cleanup(): void {
    try {
      const now = Date.now();
      let deletedCount = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        console.log(`[OTXMemoryCache] Cleaned up ${deletedCount} expired entries`);
      }
    } catch (error) {
      console.warn('[OTXMemoryCache] Error during cleanup:', error);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

export class OTXDatabase {
  private dbName = 'otx-threat-intel';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSupported: boolean;
  private useFallback: boolean = false;
  private fallbackStorage = new Map<string, any>();

  constructor() {
    // Check if we're in a browser environment with IndexedDB support
    this.isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
    
    if (!this.isSupported) {
      console.warn('[OTXDatabase] IndexedDB not supported in this environment');
      this.useFallback = true;
    }
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    if (!this.dbPromise) {
      this.dbPromise = this.openDatabase();
    }
    
    return this.dbPromise;
  }

  private async openDatabase(): Promise<IDBDatabase> {
    if (!this.isSupported || this.useFallback) {
      console.warn('[OTXDatabase] Using fallback in-memory storage');
      return this.createMockDatabase();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('[OTXDatabase] IndexedDB open error:', request.error);
        console.warn('[OTXDatabase] Using fallback in-memory storage due to error');
        this.useFallback = true;
        resolve(this.createMockDatabase());
      };

      request.onsuccess = () => {
        this.db = request.result;
        
        // Handle database version changes
        this.db.onversionchange = () => {
          console.log('[OTXDatabase] Database version changed, closing connection');
          this.db?.close();
          this.db = null;
          this.dbPromise = null;
        };
        
        // Handle database errors
        this.db.onerror = (event) => {
          console.error('[OTXDatabase] Database error:', event);
        };
        
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log('[OTXDatabase] Upgrading database to version', event.newVersion);
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };

      request.onblocked = () => {
        console.warn('[OTXDatabase] Database upgrade blocked by other connections');
        // You could show a notification to the user here
      };
    });
  }

  private createMockDatabase(): IDBDatabase {
    const mockDB = {
      objectStoreNames: ['scans', 'settings', 'statistics'],
      close: () => {
        this.db = null;
        this.dbPromise = null;
      },
      onversionchange: null,
      onerror: null,
      transaction: (storeNames: string | string[], mode?: IDBTransactionMode) => {
        return {
          objectStore: (name: string) => this.createMockObjectStore(name),
          onerror: null,
          oncomplete: null,
          abort: () => {},
          commit: () => {},
          error: null,
          mode: mode || 'readonly',
          objectStoreNames: typeof storeNames === 'string' ? [storeNames] : storeNames,
          db: {} as IDBDatabase
        } as any;
      }
    } as any;

    return mockDB;
  }

  private createMockObjectStore(name: string) {
    return {
      get: (key: any) => {
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: this.fallbackStorage.get(JSON.stringify({ store: name, key })),
          error: null,
          readyState: 'done' as IDBRequestReadyState,
          source: null,
          transaction: null
        } as any;

        if (request.onsuccess) {
          setTimeout(() => request.onsuccess({ target: request }), 0);
        }

        return request;
      },
      put: (value: any) => {
        const key = value.id || value.key;
        this.fallbackStorage.set(JSON.stringify({ store: name, key }), value);
        
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: key,
          error: null,
          readyState: 'done' as IDBRequestReadyState,
          source: null,
          transaction: null
        } as any;

        if (request.onsuccess) {
          setTimeout(() => request.onsuccess({ target: request }), 0);
        }

        return request;
      },
      delete: (key: any) => {
        this.fallbackStorage.delete(JSON.stringify({ store: name, key }));
        
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: undefined,
          error: null,
          readyState: 'done' as IDBRequestReadyState,
          source: null,
          transaction: null
        } as any;

        if (request.onsuccess) {
          setTimeout(() => request.onsuccess({ target: request }), 0);
        }

        return request;
      },
      clear: () => {
        // Clear only entries for this store
        const prefix = JSON.stringify({ store: name });
        for (const key of this.fallbackStorage.keys()) {
          if (key.startsWith(prefix)) {
            this.fallbackStorage.delete(key);
          }
        }
        
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: undefined,
          error: null,
          readyState: 'done' as IDBRequestReadyState,
          source: null,
          transaction: null
        } as any;

        if (request.onsuccess) {
          setTimeout(() => request.onsuccess({ target: request }), 0);
        }

        return request;
      },
      count: () => {
        let count = 0;
        const prefix = JSON.stringify({ store: name });
        for (const key of this.fallbackStorage.keys()) {
          if (key.startsWith(prefix)) {
            count++;
          }
        }
        
        const request = {
          onsuccess: null as any,
          onerror: null as any,
          result: count,
          error: null,
          readyState: 'done' as IDBRequestReadyState,
          source: null,
          transaction: null
        } as any;

        if (request.onsuccess) {
          setTimeout(() => request.onsuccess({ target: request }), 0);
        }

        return request;
      },
      index: (name: string) => {
        return {
          openCursor: (range?: IDBKeyRange, direction?: IDBCursorDirection) => {
            const entries: any[] = [];
            const prefix = JSON.stringify({ store: name });
            
            for (const [key, value] of this.fallbackStorage.entries()) {
              if (key.startsWith(prefix)) {
                entries.push(value);
              }
            }
            
            // Sort by timestamp for 'timestamp' index
            if (name === 'timestamp') {
              entries.sort((a, b) => {
                const dateA = new Date(a.timestamp || 0).getTime();
                const dateB = new Date(b.timestamp || 0).getTime();
                return direction === 'prev' ? dateB - dateA : dateA - dateB;
              });
            }
            
            let currentIndex = 0;
            const cursor = {
              continue: () => {
                currentIndex++;
              },
              value: entries[currentIndex],
              key: entries[currentIndex]?.id || entries[currentIndex]?.key,
              primaryKey: entries[currentIndex]?.id || entries[currentIndex]?.key
            } as any;

            const request = {
              onsuccess: null as any,
              onerror: null as any,
              result: currentIndex < entries.length ? cursor : null,
              error: null,
              readyState: 'done' as IDBRequestReadyState,
              source: null,
              transaction: null
            } as any;

            if (request.onsuccess) {
              setTimeout(() => request.onsuccess({ target: request }), 0);
            }

            return request;
          },
          getAll: (range?: IDBKeyRange) => {
            const entries: any[] = [];
            const prefix = JSON.stringify({ store: name });
            
            for (const [key, value] of this.fallbackStorage.entries()) {
              if (key.startsWith(prefix)) {
                // Simple range filtering for common cases
                if (range) {
                  // Check if it's a single key range (like IDBKeyRange.only())
                  if ((range as any).lower === (range as any).upper && 
                      value.result?.threat_level !== (range as any).lower) {
                    continue;
                  }
                  if (range.lower && value.timestamp < range.lower) {
                    continue;
                  }
                  if (range.upper && value.timestamp > range.upper) {
                    continue;
                  }
                }
                entries.push(value);
              }
            }
            
            // Sort by timestamp for better user experience
            entries.sort((a, b) => {
              const dateA = new Date(a.timestamp || 0).getTime();
              const dateB = new Date(b.timestamp || 0).getTime();
              return dateB - dateA; // Newest first
            });
            
            const request = {
              onsuccess: null as any,
              onerror: null as any,
              result: entries,
              error: null,
              readyState: 'done' as IDBRequestReadyState,
              source: null,
              transaction: null
            } as any;

            if (request.onsuccess) {
              setTimeout(() => request.onsuccess({ target: request }), 0);
            }

            return request;
          },
          get: (key: any) => {
            // Simple implementation for get by index
            const entries: any[] = [];
            const prefix = JSON.stringify({ store: name });
            
            for (const [storageKey, value] of this.fallbackStorage.entries()) {
              if (storageKey.startsWith(prefix)) {
                // Check if value matches the key for common indices
                if (name === 'ioc' && value.result?.ioc === key) {
                  entries.push(value);
                } else if (name === 'favorite' && value.favorite === key) {
                  entries.push(value);
                } else if (name === 'threat_level' && value.result?.threat_level === key) {
                  entries.push(value);
                }
              }
            }
            
            const request = {
              onsuccess: null as any,
              onerror: null as any,
              result: entries[0] || null,
              error: null,
              readyState: 'done' as IDBRequestReadyState,
              source: null,
              transaction: null
            } as any;

            if (request.onsuccess) {
              setTimeout(() => request.onsuccess({ target: request }), 0);
            }

            return request;
          }
        };
      }
    };
  }

  private createObjectStores(db: IDBDatabase): void {
    // Create scans object store if it doesn't exist
    if (!db.objectStoreNames.contains('scans')) {
      const store = db.createObjectStore('scans', { keyPath: 'id' });
      store.createIndex('indicator', 'indicator', { unique: false });
      store.createIndex('type', 'type', { unique: false });
      store.createIndex('timestamp', 'timestamp', { unique: false });
      store.createIndex('favorite', 'favorite', { unique: false });
      store.createIndex('threat_level', 'result.threat_level', { unique: false });
      store.createIndex('ioc', 'result.ioc', { unique: false });
      console.log('[OTXDatabase] Created scans object store');
    }

    // Create settings object store for app preferences
    if (!db.objectStoreNames.contains('settings')) {
      const store = db.createObjectStore('settings', { keyPath: 'key' });
      console.log('[OTXDatabase] Created settings object store');
    }

    // Create statistics object store
    if (!db.objectStoreNames.contains('statistics')) {
      const store = db.createObjectStore('statistics', { keyPath: 'id' });
      store.createIndex('date', 'date', { unique: false });
      console.log('[OTXDatabase] Created statistics object store');
    }
  }

  async saveScan(scan: OTXScanHistory & { threat_level?: string }): Promise<void> {
    if (this.useFallback) {
      // Use fallback storage
      this.fallbackStorage.set(JSON.stringify({ store: 'scans', key: scan.id }), scan);
      console.log(`[OTXDatabase] Saved scan to fallback storage: ${scan.indicator}`);
      return;
    }

    try {
      const db = await this.ensureDB();
      
      // Ensure scan has required properties
      if (!scan.id) scan.id = crypto.randomUUID();
      if (!scan.timestamp) scan.timestamp = new Date().toISOString();
      if (!scan.threat_level && scan.result) {
        scan.threat_level = scan.result.threat_level;
      }
      if (scan.favorite === undefined) scan.favorite = false;

      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readwrite');
        const store = tx.objectStore('scans');
        
        const request = store.put(scan);
        
        request.onerror = () => {
          console.error('[OTXDatabase] Save scan error:', request.error);
          // Fallback to memory storage
          this.fallbackStorage.set(JSON.stringify({ store: 'scans', key: scan.id }), scan);
          console.log(`[OTXDatabase] Saved scan to fallback storage after error: ${scan.indicator}`);
          resolve();
        };
        
        request.onsuccess = () => {
          resolve();
        };
        
        tx.onerror = () => {
          console.error('[OTXDatabase] Transaction error:', tx.error);
          // Fallback to memory storage
          this.fallbackStorage.set(JSON.stringify({ store: 'scans', key: scan.id }), scan);
          console.log(`[OTXDatabase] Saved scan to fallback storage after transaction error: ${scan.indicator}`);
          resolve();
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to save scan, using fallback:', error);
      // Use fallback storage
      this.fallbackStorage.set(JSON.stringify({ store: 'scans', key: scan.id }), scan);
    }
  }

  async getScans(limit = 50, offset = 0): Promise<OTXScanHistory[]> {
    if (this.useFallback) {
      // Get from fallback storage
      const scans: OTXScanHistory[] = [];
      const prefix = JSON.stringify({ store: 'scans' });
      
      for (const [key, value] of this.fallbackStorage.entries()) {
        if (key.startsWith(prefix)) {
          scans.push(value);
        }
      }
      
      // Sort by timestamp (newest first) and apply limit/offset
      return scans
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(offset, offset + limit);
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const index = store.index('timestamp');
        
        const request = index.openCursor(null, 'prev');
        const scans: OTXScanHistory[] = [];
        let count = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && count < limit + offset) {
            if (count >= offset) {
              scans.push(cursor.value);
            }
            count++;
            cursor.continue();
          } else {
            resolve(scans);
          }
        };
        
        request.onerror = () => {
          console.error('[OTXDatabase] Get scans error:', request.error);
          // Return empty array instead of rejecting
          resolve([]);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get scans:', error);
      return [];
    }
  }

  async getScansByThreatLevel(level: string, limit = 20): Promise<OTXScanHistory[]> {
    if (this.useFallback) {
      // Get from fallback storage
      const scans: OTXScanHistory[] = [];
      const prefix = JSON.stringify({ store: 'scans' });
      
      for (const [key, value] of this.fallbackStorage.entries()) {
        if (key.startsWith(prefix) && value.result?.threat_level === level) {
          scans.push(value);
        }
      }
      
      // Sort by timestamp (newest first) and apply limit
      return scans
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const index = store.index('threat_level');
        
        const keyRange = IDBKeyRange.only(level);
        const request = index.getAll(keyRange);
        
        request.onsuccess = () => {
          const scans = request.result
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
          resolve(scans);
        };
        
        request.onerror = () => {
          console.error('[OTXDatabase] Get scans by threat level error:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get scans by threat level:', error);
      return [];
    }
  }

  async deleteScan(id: string): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.delete(JSON.stringify({ store: 'scans', key: id }));
      return;
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readwrite');
        const store = tx.objectStore('scans');
        
        const request = store.delete(id);
        
        request.onerror = () => {
          console.error('[OTXDatabase] Delete scan error:', request.error);
          // Try fallback
          this.fallbackStorage.delete(JSON.stringify({ store: 'scans', key: id }));
          resolve();
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to delete scan:', error);
      // Try fallback
      this.fallbackStorage.delete(JSON.stringify({ store: 'scans', key: id }));
    }
  }

  async clearScans(): Promise<void> {
    if (this.useFallback) {
      // Clear only scans from fallback storage
      const prefix = JSON.stringify({ store: 'scans' });
      for (const key of this.fallbackStorage.keys()) {
        if (key.startsWith(prefix)) {
          this.fallbackStorage.delete(key);
        }
      }
      return;
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readwrite');
        const store = tx.objectStore('scans');
        
        const request = store.clear();
        
        request.onerror = () => {
          console.error('[OTXDatabase] Clear scans error:', request.error);
          resolve();
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to clear scans:', error);
    }
  }

  async getScanCount(): Promise<number> {
    if (this.useFallback) {
      let count = 0;
      const prefix = JSON.stringify({ store: 'scans' });
      for (const key of this.fallbackStorage.keys()) {
        if (key.startsWith(prefix)) {
          count++;
        }
      }
      return count;
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error('[OTXDatabase] Get scan count error:', request.error);
          resolve(0);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get scan count:', error);
      return 0;
    }
  }

  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const scan = await this.getScanById(id);
      if (!scan) return false;
      
      scan.favorite = !scan.favorite;
      scan.updatedAt = new Date().toISOString();
      
      await this.saveScan(scan);
      return scan.favorite;
    } catch (error) {
      console.warn('[OTXDatabase] Failed to toggle favorite:', error);
      return false;
    }
  }

  private async getScanById(id: string): Promise<OTXScanHistory | null> {
    if (this.useFallback) {
      return this.fallbackStorage.get(JSON.stringify({ store: 'scans', key: id })) || null;
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          console.error('[OTXDatabase] Get scan by id error:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get scan by id:', error);
      return null;
    }
  }

  async getFavorites(limit = 20): Promise<OTXScanHistory[]> {
    if (this.useFallback) {
      // Get from fallback storage
      const favorites: OTXScanHistory[] = [];
      const prefix = JSON.stringify({ store: 'scans' });
      
      for (const [key, value] of this.fallbackStorage.entries()) {
        if (key.startsWith(prefix) && value.favorite) {
          favorites.push(value);
        }
      }
      
      // Sort by timestamp (newest first) and apply limit
      return favorites
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const index = store.index('favorite');
        
        const keyRange = IDBKeyRange.only(true);
        const request = index.getAll(keyRange);
        
        request.onsuccess = () => {
          const favorites = request.result
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
          resolve(favorites);
        };
        
        request.onerror = () => {
          console.error('[OTXDatabase] Get favorites error:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get favorites:', error);
      return [];
    }
  }

  async getRecentScans(days = 7, limit = 50): Promise<OTXScanHistory[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    if (this.useFallback) {
      // Get from fallback storage
      const recentScans: OTXScanHistory[] = [];
      const prefix = JSON.stringify({ store: 'scans' });
      
      for (const [key, value] of this.fallbackStorage.entries()) {
        if (key.startsWith(prefix)) {
          const scanDate = new Date(value.timestamp);
          if (scanDate > cutoffDate) {
            recentScans.push(value);
          }
        }
      }
      
      // Sort by timestamp (newest first) and apply limit
      return recentScans
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const index = store.index('timestamp');
        
        const keyRange = IDBKeyRange.lowerBound(cutoffDate.toISOString());
        const request = index.openCursor(keyRange, 'prev');
        const scans: OTXScanHistory[] = [];
        let count = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && count < limit) {
            scans.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(scans);
          }
        };
        
        request.onerror = () => {
          console.error('[OTXDatabase] Get recent scans error:', request.error);
          resolve([]);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get recent scans:', error);
      return [];
    }
  }

  async getScanByIOC(ioc: string): Promise<OTXScanHistory | null> {
    if (this.useFallback) {
      // Get from fallback storage
      const prefix = JSON.stringify({ store: 'scans' });
      
      for (const [key, value] of this.fallbackStorage.entries()) {
        if (key.startsWith(prefix) && value.result?.ioc === ioc) {
          return value;
        }
      }
      return null;
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const index = store.index('ioc');
        
        const request = index.get(ioc);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          console.error('[OTXDatabase] Get scan by IOC error:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get scan by IOC:', error);
      return null;
    }
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (this.useFallback) {
      this.fallbackStorage.set(JSON.stringify({ store: 'settings', key }), { key, value, updatedAt: new Date().toISOString() });
      return;
    }

    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        
        const request = store.put({ key, value, updatedAt: new Date().toISOString() });
        
        request.onerror = () => {
          console.error('[OTXDatabase] Save setting error:', request.error);
          resolve();
        };
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to save setting:', error);
    }
  }

  async getSetting<T>(key: string): Promise<T | null> {
    if (this.useFallback) {
      const setting = this.fallbackStorage.get(JSON.stringify({ store: 'settings', key }));
      return setting?.value || null;
    }
    
    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => {
          console.error('[OTXDatabase] Get setting error:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('[OTXDatabase] Failed to get setting:', error);
      return null;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }

  async destroy(): Promise<void> {
    await this.close();
    
    if (this.isSupported && !this.useFallback) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(this.dbName);
        
        request.onsuccess = () => {
          console.log('[OTXDatabase] Database deleted successfully');
          resolve();
        };
        
        request.onerror = () => {
          console.error('[OTXDatabase] Failed to delete database:', request.error);
          resolve(); // Don't reject, just resolve
        };
        
        request.onblocked = () => {
          console.warn('[OTXDatabase] Database deletion blocked by open connections');
          resolve(); // Don't reject, just resolve
        };
      });
    }
  }
}

// Singleton instances
export const otxCache = new OTXMemoryCache();
export const otxDatabase = new OTXDatabase();