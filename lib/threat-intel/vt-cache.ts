// lib/threat-intel/vt-cache.ts
import type { VTScanHistory } from './vt-types';

class VTMemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }
}

export class VTDatabase {
  private dbName = 'vt-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('scans')) {
          const store = db.createObjectStore('scans', { keyPath: 'id' });
          store.createIndex('indicator', 'indicator', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('favorite', 'favorite', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveScan(scan: VTScanHistory): Promise<void> {
    try {
      const db = await this.initialize();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readwrite');
        const store = tx.objectStore('scans');
        
        const request = store.put(scan);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('Failed to save scan to IndexedDB:', error);
      throw error;
    }
  }

  async getScans(limit = 50): Promise<VTScanHistory[]> {
    try {
      const db = await this.initialize();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readonly');
        const store = tx.objectStore('scans');
        const index = store.index('timestamp');
        
        const request = index.openCursor(null, 'prev');
        const scans: VTScanHistory[] = [];
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
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to get scans from IndexedDB:', error);
      return [];
    }
  }

  async deleteScan(id: string): Promise<void> {
    try {
      const db = await this.initialize();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readwrite');
        const store = tx.objectStore('scans');
        
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('Failed to delete scan from IndexedDB:', error);
      throw error;
    }
  }

  async clearScans(): Promise<void> {
    try {
      const db = await this.initialize();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('scans', 'readwrite');
        const store = tx.objectStore('scans');
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('Failed to clear scans from IndexedDB:', error);
      throw error;
    }
  }
}

export const vtCache = new VTMemoryCache();
export const vtDatabase = new VTDatabase();