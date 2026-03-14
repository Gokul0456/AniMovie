'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getWatchHistory,
  addToWatchHistory,
  getWatchHistoryItem,
  removeFromWatchHistory,
  type WatchHistoryItem,
} from '@/lib/persistence';

/**
 * Hook to manage watch history
 * Automatically saves progress every 10 seconds
 */
export function useWatchHistory(
  mediaId: number,
  type: 'anime' | 'manga' | 'movie' | 'tv',
  title: string,
  posterPath: string
) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Update progress percentage
  useEffect(() => {
    if (duration > 0) {
      setProgressPercent((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  // Save progress to history
  const saveProgress = useCallback(
    (time: number, dur: number) => {
      if (dur === 0) return;

      addToWatchHistory({
        id: mediaId,
        type,
        title,
        posterPath,
        currentTime: time,
        duration: dur,
        timestamp: Date.now(),
      });
    },
    [mediaId, type, title, posterPath]
  );

  // Auto-save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (duration > 0 && currentTime > 0) {
        saveProgress(currentTime, duration);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentTime, duration, saveProgress]);

  // Get resume position
  const getResumePosition = useCallback((): number => {
    const item = getWatchHistoryItem(mediaId, type);
    return item?.currentTime || 0;
  }, [mediaId, type]);

  // Clear history
  const clearHistory = useCallback(() => {
    removeFromWatchHistory(mediaId, type);
    setCurrentTime(0);
  }, [mediaId, type]);

  return {
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    progressPercent,
    saveProgress,
    getResumePosition,
    clearHistory,
  };
}
