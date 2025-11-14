/**
 * Image caching system for generated scenes
 */

import { SceneDescriptor, ViewState, Entity } from '../map/types';
import crypto from 'crypto';

export interface CacheEntry {
  hash: string;
  imageData: string; // Base64 encoded image or file path
  timestamp: number;
  descriptor: SceneDescriptor;
}

export class SceneCache {
  private cache: Map<string, CacheEntry>;
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 500) {
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Generate a unique hash for a scene descriptor
   */
  generateHash(descriptor: SceneDescriptor): string {
    const {
      viewState,
      visibleEntities,
      lighting,
      timeOfDay,
    } = descriptor;

    // Sort entities by ID for consistent hashing
    const sortedEntities = [...visibleEntities]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((e) => ({ id: e.id, type: e.type, x: e.position.x, y: e.position.y }));

    const hashInput = JSON.stringify({
      x: viewState.position.x,
      y: viewState.position.y,
      facing: viewState.facing,
      entities: sortedEntities,
      lighting,
      timeOfDay,
    });

    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Check if a scene is cached
   */
  has(hash: string): boolean {
    return this.cache.has(hash);
  }

  /**
   * Get a cached scene
   */
  get(hash: string): CacheEntry | undefined {
    const entry = this.cache.get(hash);
    if (entry) {
      // Update access time (for LRU)
      entry.timestamp = Date.now();
    }
    return entry;
  }

  /**
   * Store a scene in cache
   */
  set(hash: string, imageData: string, descriptor: SceneDescriptor): void {
    // Check cache size and evict oldest entries if needed
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(hash, {
      hash,
      imageData,
      timestamp: Date.now(),
      descriptor,
    });
  }

  /**
   * Evict the oldest cache entry (LRU)
   */
  private evictOldest(): void {
    let oldestHash: string | null = null;
    let oldestTime = Infinity;

    for (const [hash, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestHash = hash;
      }
    }

    if (oldestHash) {
      this.cache.delete(oldestHash);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      utilization: (this.cache.size / this.maxCacheSize) * 100,
    };
  }

  /**
   * Export cache to JSON (for saving)
   */
  toJSON(): Record<string, CacheEntry> {
    const obj: Record<string, CacheEntry> = {};
    for (const [hash, entry] of this.cache.entries()) {
      obj[hash] = entry;
    }
    return obj;
  }

  /**
   * Load cache from JSON
   */
  fromJSON(data: Record<string, CacheEntry>): void {
    this.cache.clear();
    for (const [hash, entry] of Object.entries(data)) {
      this.cache.set(hash, entry);
    }
  }
}
