// lib/threat-intel/cache-service.ts
interface CacheEntry<T> {
  data: T
  timestamp: number
  hash: string
}

class ThreatCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly TTL = 30 * 60 * 1000 // 30 minutes in milliseconds

  private getKey(service: string, hash: string): string {
    return `${service}:${hash}`
  }

  set<T>(service: string, hash: string, data: T): void {
    const key = this.getKey(service, hash)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash
    })

    // Also store in localStorage for persistence across page reloads
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        hash
      }))
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  get<T>(service: string, hash: string): T | null {
    const key = this.getKey(service, hash)
    
    // Try memory cache first
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < this.TTL) {
      return cached.data as T
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored)
        if ((Date.now() - parsed.timestamp) < this.TTL) {
          // Restore to memory cache
          this.cache.set(key, parsed)
          return parsed.data
        } else {
          // Expired, remove from localStorage
          localStorage.removeItem(key)
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    return null
  }

  clear(): void {
    this.cache.clear()
    // Clear only our cache keys from localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes(':') && (key.startsWith('virustotal:') || 
          key.startsWith('malwarebazaar:') || 
          key.startsWith('hybridanalysis:') || 
          key.startsWith('alienvault:'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  remove(service: string, hash: string): void {
    const key = this.getKey(service, hash)
    this.cache.delete(key)
    localStorage.removeItem(key)
  }

  has(service: string, hash: string): boolean {
    return this.get(service, hash) !== null
  }

  getStats(): {
    size: number
    services: Record<string, number>
  } {
    const services: Record<string, number> = {
      virustotal: 0,
      malwarebazaar: 0,
      hybridanalysis: 0,
      alienvault: 0
    }

    this.cache.forEach((entry, key) => {
      const [service] = key.split(':')
      if (service in services) {
        services[service]++
      }
    })

    return {
      size: this.cache.size,
      services
    }
  }
}

export const threatCache = new ThreatCache()