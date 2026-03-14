'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  type WatchlistItem,
} from '@/lib/persistence';

/**
 * Hook to manage watchlist (favorites)
 */
export function useWatchlist(
  mediaId: number,
  type: 'anime' | 'manga' | 'movie' | 'tv',
  title: string,
  posterPath: string
) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  // Load watchlist on mount
  useEffect(() => {
    const items = getWatchlist();
    setWatchlist(items);
    setIsAdded(isInWatchlist(mediaId, type));
  }, [mediaId, type]);

  // Add to watchlist
  const add = useCallback(() => {
    if (!isAdded) {
      addToWatchlist({
        id: mediaId,
        type,
        title,
        posterPath,
        addedAt: Date.now(),
      });
      setIsAdded(true);
      setWatchlist(getWatchlist());
    }
  }, [mediaId, type, title, posterPath, isAdded]);

  // Remove from watchlist
  const remove = useCallback(() => {
    if (isAdded) {
      removeFromWatchlist(mediaId, type);
      setIsAdded(false);
      setWatchlist(getWatchlist());
    }
  }, [mediaId, type, isAdded]);

  // Toggle watchlist
  const toggle = useCallback(() => {
    if (isAdded) {
      remove();
    } else {
      add();
    }
  }, [isAdded, add, remove]);

  return {
    watchlist,
    isAdded,
    add,
    remove,
    toggle,
  };
}
