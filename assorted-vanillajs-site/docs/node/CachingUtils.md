# Caching Utils

```ts
/**
 * A generic class that allows for object caching single database records.
 */

import path from 'node:path'
import { FileManager } from './CLI'

export const ttlMap = {
  n_seconds: (n: number) => 1000 * n,
  n_minutes: (n: number) => 1000 * 60 * n,
  n_hours: (n: number) => 1000 * 60 * 60 * n,
  n_days: (n: number) => 1000 * 60 * 60 * 24 * n,
  n_weeks: (n: number) => 1000 * 60 * 60 * 24 * 7 * n,
  n_months: (n: number) => 1000 * 60 * 60 * 24 * 30 * n,
  n_years: (n: number) => 1000 * 60 * 60 * 24 * 365 * n,
}

class Cacher<T> {
  protected cache: Map<string, T> = new Map()
  protected cacheWithTTL: Map<string, { value: T, expiresAt: Date }> = new Map()

  constructor(protected ttl: number = ttlMap.n_days(1)) {
  }

  setTTL(ttl: number): void {
    this.ttl = ttl
  }

  getWithTTL(key: string): T | undefined {
    const cached = this.cacheWithTTL.get(key)
    if (cached) {
      if (cached.expiresAt > new Date()) {
        return cached.value
      }
      else {
        this.cacheWithTTL.delete(key)
        return cached.value
      }
    }
    return undefined
  }

  setWithTTL(key: string, value: T, ttl: number): void {
    this.cacheWithTTL.set(key, { value, expiresAt: new Date(Date.now() + ttl) })
  }

  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: T): void {
    this.cache.set(key, value)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.cacheWithTTL.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  values(): T[] {
    return Array.from(this.cache.values())
  }

  valuesWithTTL(): { value: T, expiresAt: Date }[] {
    return Array.from(this.cacheWithTTL.values())
  }
}

/**
 * Map should be some arbitrary key to filepath.
 */
export class Base64FileCacher extends Cacher<string> {
  private cacheDirCreated = false
  private withTTL: boolean = false
  constructor(private cacheDir: string, ttl: number | undefined) {
    super(ttl)
    if (ttl) {
      this.withTTL = true
    }
  }

  private getCachePath(value: string): string {
    return path.join(this.cacheDir, value)
  }

  private async upsertCacheDirectory() {
    if (!this.cacheDirCreated) {
      await FileManager.createDirectory(this.cacheDir, { overwrite: false })
      this.cacheDirCreated = true
    }
  }

  private async getCacheFile(key: string, options?: { withTTL: boolean }): Promise<string | null> {
    await this.upsertCacheDirectory()
    const value = options?.withTTL ? this.getWithTTL(key) : this.get(key)
    if (!value) {
      return null
    }
    const cachePath = this.getCachePath(value)
    try {
      const content = await FileManager.readFileAsBase64(cachePath)
      if (!content) {
        return null
      }
      else {
        console.log(`Cache hit for ${key}`)
        return content
      }
    }
    catch (error) {
      console.error(`Error reading cache file ${cachePath}:`, error)
      return null
    }
  }

  private async writeCacheFile(key: string, base64String: string, options?: { withTTL: boolean }) {
    await this.upsertCacheDirectory()
    const filename = options?.withTTL ? this.getWithTTL(key) : this.get(key)
    if (!filename) {
      return
    }
    const cachePath = this.getCachePath(filename)
    await FileManager.createFileFromBase64(cachePath, base64String, { overwrite: true })
  }

  async getCacheFirst(key: string, options?: {
    getBase64Revalidate: () => Promise<{
      filename: string
      base64String: string
    } | null>
  }): Promise<string | null> {
    const cachedBase64 = await this.getCacheFile(key, { withTTL: this.withTTL })
    if (cachedBase64) {
      return cachedBase64
    }
    const data = await options?.getBase64Revalidate()
    if (!data) {
      return null
    }
    else {
      this.addFilenameToCache(key, data.filename)
      await this.writeCacheFile(key, data.base64String, { withTTL: this.withTTL })
      return data.base64String
    }
  }

  addFilenameToCache(key: string, filename: string) {
    if (this.withTTL) {
      this.setWithTTL(key, filename, this.ttl)
    }
    else {
      this.set(key, filename)
    }
  }
}

export class ObjectCacher<T> extends Cacher<T> {
  async getCacheFirst(key: string, revalidate: () => Promise<T | null>): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = await revalidate()
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }

  async getWithRevalidate(key: string, revalidate: () => Promise<T | null>): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      const value = await revalidate()
      if (value) {
        this.set(key, value)
        return value
      }
      else {
        return cached
      }
    }
    const value = await revalidate()
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }
}

export class QueryCacher<T> extends Cacher<T> {
  constructor(private exec: (query: string) => Promise<T | null>) {
    super()
  }

  async getCacheFirst(key: string): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = await this.exec(key)
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }

  async getWithRevalidate(key: string): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      const value = await this.exec(key)
      if (value) {
        this.set(key, value)
        return value
      }
      else {
        return cached
      }
    }
    const value = await this.exec(key)
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }
}
```