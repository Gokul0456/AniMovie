
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Bookmark, BookmarkX, Play } from 'lucide-react';
import Link from 'next/link';

import { type Media } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn, slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useWatchHistory } from '@/hooks/use-watch-history';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useResume } from '@/hooks/use-resume';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface ViewerProps {
  media: Media;
  initialItemNumber: number;
  initialSeasonNumber?: number;
  type: 'anime' | 'manga' | 'movie' | 'tv';
}

const getStreamingUrl = (type: 'anime' | 'manga' | 'movie' | 'tv', mediaId: number | string, itemNumber: number, seasonNumber: number, isDub: boolean) => {
  if (type === 'anime') {
    return `https://vidsrc.icu/embed/anime/${mediaId}/${itemNumber}/${isDub ? '1' : '0'}`;
  }
  if (type === 'manga') {
    return `https://vidsrc.icu/embed/manga/${mediaId}/${itemNumber}`;
  }
  if (type === 'movie') {
    return `https://vidsrc.icu/embed/movie/${mediaId}`;
  }
  if (type === 'tv') {
    return `https://vidsrc.icu/embed/tv/${mediaId}/${seasonNumber}/${itemNumber}`;
  }
  return '';
};


export default function Viewer({
  media,
  initialItemNumber,
  initialSeasonNumber = 1,
  type,
}: ViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [itemNumber, setItemNumber] = useState(initialItemNumber);
  const [seasonNumber, setSeasonNumber] = useState(initialSeasonNumber);
  const [isDub, setIsDub] = useState(searchParams.get('dub') === '1');
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(true);

  const mediaId = media.imdb_id || media.id;
  const [streamingUrl, setStreamingUrl] = useState(() => getStreamingUrl(type, mediaId, initialItemNumber, initialSeasonNumber, isDub));

  const title = media.title.english || media.title.romaji;
  const isAnime = type === 'anime';
  const isManga = type === 'manga';
  const isMovie = type === 'movie';
  const isTv = type === 'tv';
  
  const totalItems = isAnime ? media.episodes : (isTv ? (media.seasons?.find(s => s.season_number === seasonNumber)?.episode_count) : media.chapters);

  // Persistence hooks
  const watchHistory = useWatchHistory(media.id, type, title, media.coverImage.extraLarge);
  const watchlist = useWatchlist(media.id, type, title, media.coverImage.extraLarge);
  const resumeData = useResume(media.id, type);

  // Update streaming URL when params change
  useEffect(() => {
    const newUrl = getStreamingUrl(type, mediaId, itemNumber, seasonNumber, isDub);
    setStreamingUrl(newUrl);

    const slug = slugify(title);
    let urlPath = `/view/${type}/${media.id}-${slug}`;
    const params = new URLSearchParams();
    
    if (isTv) {
      params.set('season', seasonNumber.toString());
      params.set('episode', itemNumber.toString());
    } else if (isAnime) {
      params.set('item', itemNumber.toString());
    } else if (isManga) {
      params.set('item', itemNumber.toString());
    }

    if (isAnime && isDub) {
      params.set('dub', '1');
    }
    
    const paramsString = params.toString();
    if (paramsString) {
      urlPath += `?${paramsString}`;
    }

    window.history.pushState(null, '', urlPath);
  }, [itemNumber, seasonNumber, isDub, media.id, mediaId, type, title, isAnime, isManga, isTv]);

  // Handle auto-play countdown
  useEffect(() => {
    if (autoPlayCountdown <= 0) {
      clearTimeout(countdownRef.current);
      return;
    }

    countdownRef.current = setTimeout(() => {
      setAutoPlayCountdown(autoPlayCountdown - 1);
    }, 1000);

    return () => clearTimeout(countdownRef.current);
  }, [autoPlayCountdown]);

  const handleNavigation = (newItemNumber: number) => {
    if (newItemNumber < 1) {
      toast({
        title: "You're at the beginning!",
        description: "This is the first item.",
      });
      return;
    }
    if (totalItems && newItemNumber > totalItems) {
      toast({
        title: "You've reached the end!",
        description: "This is the last available item.",
      });
      return;
    }
    setAutoPlayCountdown(0);
    setItemNumber(newItemNumber);
  };

  const handleSeasonChange = (season: number) => {
    setSeasonNumber(season);
    setItemNumber(1);
    setAutoPlayCountdown(0);
  };

  // Resume from last position on mount
  useEffect(() => {
    if (resumeData.hasProgress && resumeData.currentTime > 0) {
      toast({
        title: "Resume Watching",
        description: `Resume from ${Math.round((resumeData.currentTime / resumeData.duration) * 100)}% watched`,
        action: {
          label: "Resume",
          onClick: () => {
            // Custom player will handle resume
          },
        },
      });
    }
  }, [resumeData, toast]);

  const backLink = isMovie 
    ? `/media/movie/${media.id}-${slugify(title)}` 
    : isTv 
    ? `/media/tv/${media.id}-${slugify(title)}` 
    : `/media/${type}/${media.id}-${slugify(title)}`;
  
  const itemLabel = isAnime || isTv ? 'Episode' : 'Chapter';

  return (
    <div className={cn("flex h-screen flex-col text-foreground", isManga ? 'bg-stone-100 dark:bg-stone-900' : 'bg-background')}>
      <header className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 overflow-hidden">
          <Link href={backLink} passHref>
            <Button 
              variant="outline" 
              size="icon" 
              aria-label="Go back to details"
            >
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex flex-col overflow-hidden">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {!isMovie && (
              <span className="text-sm text-muted-foreground">
                {isTv && `Season ${seasonNumber} • `}{itemLabel} {itemNumber}{totalItems ? ` / ${totalItems}` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isTv && media.seasons && media.seasons.length > 1) && (
            <Select onValueChange={(value) => handleSeasonChange(parseInt(value))} defaultValue={seasonNumber.toString()}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {media.seasons.filter(s => s.season_number > 0).map((season) => (
                  <SelectItem key={season.id} value={season.season_number.toString()}>
                    Season {season.season_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isAnime && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="dub-toggle">Dub</Label>
              <Switch
                id="dub-toggle"
                checked={isDub}
                onCheckedChange={setIsDub}
              />
            </div>
          )}
          <Button
            onClick={watchlist.toggle}
            variant={watchlist.isAdded ? "default" : "outline"}
            size="icon"
            title={watchlist.isAdded ? "Remove from watchlist" : "Add to watchlist"}
          >
            {watchlist.isAdded ? (
              <Bookmark className="h-5 w-5" />
            ) : (
              <BookmarkX className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className={cn('flex flex-1 items-center justify-center overflow-hidden bg-black relative')}>
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {streamingUrl && (
          <iframe
            key={streamingUrl}
            src={streamingUrl}
            onLoad={() => setIsLoading(false)}
            allowFullScreen
            className={cn(
              'h-full w-full border-0',
              isLoading ? 'hidden' : 'block'
            )}
            title={`Viewer for ${title}`}
          />
        )}
        
        {/* Auto-play countdown overlay */}
        {autoPlayCountdown > 0 && !isMovie && (
          <div className="absolute bottom-20 right-6 flex items-center gap-3 rounded-lg bg-black bg-opacity-70 px-4 py-3 z-10">
            <div className="flex flex-col items-center">
              <span className="text-sm text-white">Playing next in</span>
              <span className="text-2xl font-bold text-cyan-400">{autoPlayCountdown}s</span>
            </div>
            <Button
              onClick={() => setAutoPlayCountdown(0)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </main>

      {(!isMovie) && (
        <footer className="container mx-auto flex items-center justify-between gap-4 p-4">
          <Button
            onClick={() => handleNavigation(itemNumber - 1)}
            disabled={itemNumber <= 1}
            variant="secondary"
          >
            <ChevronLeft className="mr-2" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-play-toggle" className="cursor-pointer">
              Auto-play Next
            </Label>
            <Switch
              id="auto-play-toggle"
              checked={autoPlayNext}
              onCheckedChange={setAutoPlayNext}
            />
          </div>
          <Button
            onClick={() => handleNavigation(itemNumber + 1)}
            disabled={!!(totalItems && itemNumber >= totalItems)}
            variant="secondary"
          >
            Next
            <ChevronRight className="ml-2" />
          </Button>
        </footer>
      )}
    </div>
  );
}
