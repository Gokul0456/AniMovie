'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomPlayerProps {
  src: string;
  title: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onAutoPlayReady?: () => void;
  autoPlay?: boolean;
  className?: string;
}

export default function CustomPlayer({
  src,
  title,
  onProgress,
  onAutoPlayReady,
  autoPlay = false,
  className,
}: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  // Handle video loading
  const handleLoadedMetadata = () => {
    setIsLoading(false);
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onProgress?.(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  // Handle duration change
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle seeking
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Handle fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen request failed:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Exit fullscreen failed:', error);
      }
    }
  };

  // Handle playback rate
  const handlePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackMenu(false);
    }
  };

  // Forward/backward skip
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      handleSeek(newTime);
    }
  };

  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        skip(-10);
      } else if (e.code === 'ArrowRight') {
        skip(10);
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, duration]);

  // Initialize video
  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play();
    }
  }, [autoPlay]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full bg-black', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        className="h-full w-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black via-transparent to-transparent transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
        onMouseMove={handleMouseMove}
      >
        {/* Top info bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-white md:text-base">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime || 0}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none bg-gray-600 rounded-full"
            style={{
              background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${
                duration > 0 ? (currentTime / duration) * 100 : 0
              }%, rgb(75, 85, 99) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgb(75, 85, 99) 100%)`,
            }}
          />
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="rounded p-2 hover:bg-white hover:bg-opacity-20 transition"
              title="Play/Pause (Space)"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Skip backward */}
            <button
              onClick={() => skip(-10)}
              className="rounded p-2 hover:bg-white hover:bg-opacity-20 transition"
              title="Skip backward 10s (Left Arrow)"
            >
              <SkipBack className="h-5 w-5 text-white" />
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(10)}
              className="rounded p-2 hover:bg-white hover:bg-opacity-20 transition"
              title="Skip forward 10s (Right Arrow)"
            >
              <SkipForward className="h-5 w-5 text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="rounded p-2 hover:bg-white hover:bg-opacity-20 transition"
                title="Mute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none bg-gray-600 rounded-full"
              />
            </div>

            {/* Time display */}
            <div className="ml-2 text-xs text-gray-300 whitespace-nowrap hidden sm:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Playback rate */}
            <div className="relative">
              <button
                onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
                className="rounded px-2 py-2 hover:bg-white hover:bg-opacity-20 transition text-sm font-semibold text-white"
                title="Playback speed"
              >
                {playbackRate}x
              </button>
              {showPlaybackMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded overflow-hidden shadow-lg">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRate(rate)}
                      className={cn(
                        'block w-full px-4 py-2 text-sm text-left hover:bg-gray-700',
                        playbackRate === rate && 'bg-blue-600'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="rounded p-2 hover:bg-white hover:bg-opacity-20 transition"
              title="Fullscreen (F)"
            >
              <Maximize className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Center play button */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="rounded-full bg-white bg-opacity-20 p-4 hover:bg-opacity-40 transition"
          >
            <Play className="h-12 w-12 text-white" fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}
