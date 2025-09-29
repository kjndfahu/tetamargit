export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  cleanupInterval: number; // Interval for cleanup in milliseconds
  storage: 'memory' | 'localStorage' | 'sessionStorage';
  namespace: string;
}

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  memoryUsage: number;
  oldestItem: string | null;
  newestItem: string | null;
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private config: CacheConfig;
  private stats = {
    hitCount: 0,
    missCount: 0
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      storage: 'memory',
      namespace: 'cache',
      ...config
    };

    this.initStorage();
    this.startCleanup();
  }

  private initStorage(): void {
    if (this.config.storage === 'localStorage' || this.config.storage === 'sessionStorage') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      const key = `${this.config.namespace}_cache`;
      const stored = storage.getItem(key);
      
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.cleanup(); // Удаляем просроченные элементы
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (this.config.storage === 'memory') {
      return;
    }

    try {
      const storage = this.config.storage === 'localStorage' ? localStorage : sessionStorage;
      const key = `${this.config.namespace}_cache`;
      const data = Array.from(this.cache.entries());
      storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  // Основные методы кэша
  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Если кэш полон, удаляем самый старый элемент
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, item);
    this.saveToStorage();
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.missCount++;
      return null;
    }

    // Проверяем TTL
    if (this.isExpired(item)) {
      this.delete(key);
      this.stats.missCount++;
      return null;
    }

    // Обновляем статистику доступа
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.cache.set(key, item);
    this.saveToStorage();

    this.stats.hitCount++;
    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.hitCount = 0;
    this.stats.missCount = 0;
    this.saveToStorage();
  }

  // Методы для работы с несколькими ключами
  setMultiple(items: Array<{ key: string; value: T; ttl?: number }>): void {
    items.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  getMultiple(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    keys.forEach(key => {
      result.set(key, this.get(key));
    });
    return result;
  }

  deleteMultiple(keys: string[]): number {
    let deletedCount = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }

  // Методы для работы с паттернами ключей
  keys(pattern?: RegExp): string[] {
    const keys = Array.from(this.cache.keys());
    
    if (!pattern) {
      return keys;
    }

    return keys.filter(key => pattern.test(key));
  }

  values(pattern?: RegExp): T[] {
    const keys = this.keys(pattern);
    return keys.map(key => this.get(key)).filter(value => value !== null) as T[];
  }

  entries(pattern?: RegExp): Array<[string, T]> {
    const keys = this.keys(pattern);
    return keys
      .map(key => [key, this.get(key)])
      .filter(([_, value]) => value !== null) as Array<[string, T]>;
  }

  // Методы для работы с TTL
  touch(key: string, ttl?: number): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }

    item.timestamp = Date.now();
    if (ttl !== undefined) {
      item.ttl = ttl;
    }
    
    this.cache.set(key, item);
    this.saveToStorage();
    return true;
  }

  getTTL(key: string): number | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (this.isExpired(item)) {
      this.delete(key);
      return null;
    }

    const elapsed = Date.now() - item.timestamp;
    return Math.max(0, item.ttl - elapsed);
  }

  // Методы для работы с размерами
  size(): number {
    return this.cache.size;
  }

  maxSize(): number {
    return this.config.maxSize;
  }

  isFull(): boolean {
    return this.cache.size >= this.config.maxSize;
  }

  // Методы для получения статистики
  getStats(): CacheStats {
    const size = this.cache.size;
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    const hitRate = totalRequests > 0 ? this.stats.hitCount / totalRequests : 0;

    let oldestItem: string | null = null;
    let newestItem: string | null = null;
    let oldestTime = Infinity;
    let newestTime = 0;

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestItem = key;
      }
      if (item.timestamp > newestTime) {
        newestTime = item.timestamp;
        newestItem = key;
      }
    });

    return {
      size,
      maxSize: this.config.maxSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate,
      memoryUsage: this.estimateMemoryUsage(),
      oldestItem,
      newestItem
    };
  }

  // Методы для очистки
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  // Методы для экспорта/импорта
  export(): string {
    const data = {
      config: this.config,
      cache: Array.from(this.cache.entries()),
      stats: this.stats
    };
    return JSON.stringify(data);
  }

  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.config && parsed.cache && parsed.stats) {
        this.config = { ...this.config, ...parsed.config };
        this.cache = new Map(parsed.cache);
        this.stats = { ...this.stats, ...parsed.stats };
        this.saveToStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import cache data:', error);
      return false;
    }
  }

  // Приватные методы
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((item, key) => {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    this.cache.forEach((item) => {
      // Примерная оценка размера в байтах
      totalSize += JSON.stringify(item).length;
    });
    
    return totalSize;
  }

  // Методы для работы с LRU (Least Recently Used)
  getLRUKeys(count: number = 10): string[] {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    return entries.slice(0, count).map(([key]) => key);
  }

  getMRUKeys(count: number = 10): string[] {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => b[1].lastAccessed - a[1].lastAccessed);
    return entries.slice(0, count).map(([key]) => key);
  }

  // Методы для работы с частотой доступа
  getMostAccessedKeys(count: number = 10): string[] {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => b[1].accessCount - a[1].accessCount);
    return entries.slice(0, count).map(([key]) => key);
  }

  // Методы для работы с группами
  createGroup(name: string): CacheGroup<T> {
    return new CacheGroup<T>(name, this);
  }

  // Методы для работы с событиями
  on(event: 'set' | 'get' | 'delete' | 'clear', callback: (key?: string, value?: T) => void): () => void {
    // Простая реализация событий
    return () => {}; // Placeholder
  }
}

// Группа кэша для организации связанных данных
export class CacheGroup<T = any> {
  private prefix: string;
  private cache: CacheManager<T>;

  constructor(name: string, cache: CacheManager<T>) {
    this.prefix = `${name}:`;
    this.cache = cache;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set(key: string, value: T, ttl?: number): void {
    this.cache.set(this.getFullKey(key), value, ttl);
  }

  get(key: string): T | null {
    return this.cache.get(this.getFullKey(key));
  }

  has(key: string): boolean {
    return this.cache.has(this.getFullKey(key));
  }

  delete(key: string): boolean {
    return this.cache.delete(this.getFullKey(key));
  }

  clear(): void {
    const keys = this.cache.keys(new RegExp(`^${this.prefix}`));
    this.cache.deleteMultiple(keys);
  }

  keys(): string[] {
    const fullKeys = this.cache.keys(new RegExp(`^${this.prefix}`));
    return fullKeys.map(key => key.replace(this.prefix, ''));
  }

  values(): T[] {
    return this.cache.values(new RegExp(`^${this.prefix}`));
  }

  entries(): Array<[string, T]> {
    const fullEntries = this.cache.entries(new RegExp(`^${this.prefix}`));
    return fullEntries.map(([key, value]) => [key.replace(this.prefix, ''), value]);
  }
}

// Утилиты для работы с кэшем
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.map(part => String(part)).join(':');
};

export const createCachePattern = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped.replace(/\\\*/g, '.*').replace(/\\\?/g, '.'));
};

export const estimateObjectSize = (obj: any): number => {
  const str = JSON.stringify(obj);
  return new Blob([str]).size;
};

export const createCacheConfig = (overrides: Partial<CacheConfig> = {}): CacheConfig => {
  return {
    maxSize: 100,
    ttl: 5 * 60 * 1000,
    cleanupInterval: 60 * 1000,
    storage: 'memory',
    namespace: 'cache',
    ...overrides
  };
};

// Предопределенные конфигурации кэша
export const CACHE_CONFIGS = {
  MEMORY: createCacheConfig({ storage: 'memory', maxSize: 1000 }),
  LOCAL: createCacheConfig({ storage: 'localStorage', maxSize: 100, ttl: 24 * 60 * 60 * 1000 }),
  SESSION: createCacheConfig({ storage: 'sessionStorage', maxSize: 50, ttl: 60 * 60 * 1000 }),
  SHORT: createCacheConfig({ ttl: 60 * 1000, cleanupInterval: 30 * 1000 }),
  LONG: createCacheConfig({ ttl: 24 * 60 * 60 * 1000, cleanupInterval: 5 * 60 * 1000 })
} as const;

// Создание экземпляра по умолчанию
export const defaultCache = new CacheManager();

