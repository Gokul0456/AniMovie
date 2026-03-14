// Persistence utility for localStorage-based data storage

export interface WatchHistoryItem {
  id: number;
  type: 'anime' | 'manga' | 'movie' | 'tv';
  title: string;
  posterPath: string;
  timestamp: number; // when it was watched
  currentTime: number; // current playback position in seconds
  duration: number; // total duration in seconds (for progress percentage)
  season?: number; // for TV shows
  episode?: number; // for episodes/chapters
}

export interface WatchlistItem {
  id: number;
  type: 'anime' | 'manga' | 'movie' | 'tv';
  title: string;
  posterPath: string;
  addedAt: number;
}

const STORAGE_KEYS = {
  WATCH_HISTORY: 'animovie_watch_history',
  WATCHLIST: 'animovie_watchlist',
} as const;

// Watch History
export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading watch history:', error);
    return [];
  }
}

export function addToWatchHistory(item: WatchHistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getWatchHistory();
    const existingIndex = history.findIndex((h) => h.id === item.id && h.type === item.type);
    
    if (existingIndex > -1) {
      history[existingIndex] = { ...item, timestamp: Date.now() };
    } else {
      history.unshift(item);
    }
    
    // Keep only last 100 items
    const trimmed = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error adding to watch history:', error);
  }
}

export function removeFromWatchHistory(id: number, type: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getWatchHistory();
    const filtered = history.filter((h) => !(h.id === id && h.type === type));
    localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from watch history:', error);
  }
}

export function getWatchHistoryItem(id: number, type: string): WatchHistoryItem | null {
  const history = getWatchHistory();
  return history.find((h) => h.id === id && h.type === type) || null;
}

// Watchlist
export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading watchlist:', error);
    return [];
  }
}

export function addToWatchlist(item: WatchlistItem): void {
  if (typeof window === 'undefined') return;
  try {
    const watchlist = getWatchlist();
    const exists = watchlist.some((w) => w.id === item.id && w.type === item.type);
    
    if (!exists) {
      watchlist.unshift({ ...item, addedAt: Date.now() });
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
  }
}

export function removeFromWatchlist(id: number, type: string): void {
  if (typeof window === 'undefined') return;
  try {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter((w) => !(w.id === id && w.type === type));
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
}

export function isInWatchlist(id: number, type: string): boolean {
  const watchlist = getWatchlist();
  return watchlist.some((w) => w.id === id && w.type === type);
}
