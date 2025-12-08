import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: { [key: string]: { data: any, timestamp: number } } = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  get(key: string): any {
    const item = this.cache[key];
    if (item && (Date.now() - item.timestamp < this.CACHE_DURATION)) {
      return item.data;
    }
    return null;
  }

  set(key: string, data: any): void {
    this.cache[key] = {
      data: data,
      timestamp: Date.now()
    };
  }

  clear(key: string): void {
    delete this.cache[key];
  }

  clearAll(): void {
    this.cache = {};
  }
}