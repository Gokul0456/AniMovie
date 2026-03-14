'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWatchHistoryItem } from '@/lib/persistence';

export interface ResumeData {
  currentTime: number;
  duration: number;
  progressPercent: number;
  hasProgress: boolean;
}

/**
 * Hook to handle resume functionality
 * Gets last watched position for a media item
 */
export function useResume(mediaId: number, type: string): ResumeData {
  const [resumeData, setResumeData] = useState<ResumeData>({
    currentTime: 0,
    duration: 0,
    progressPercent: 0,
    hasProgress: false,
  });

  useEffect(() => {
    const item = getWatchHistoryItem(mediaId, type);
    
    if (item && item.duration > 0) {
      const progressPercent = (item.currentTime / item.duration) * 100;
      
      // Only show resume if less than 95% watched
      const hasProgress = progressPercent < 95 && item.currentTime > 30; // At least 30 seconds watched
      
      setResumeData({
        currentTime: item.currentTime,
        duration: item.duration,
        progressPercent,
        hasProgress,
      });
    }
  }, [mediaId, type]);

  return resumeData;
}
