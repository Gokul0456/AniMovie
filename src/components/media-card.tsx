'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type Media } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';
import { PlayCircle, Play, RotateCcw, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { useResume } from '@/hooks/use-resume';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useState } from 'react';

interface MediaCardProps {
  item: Media;
}

export default function MediaCard({ item }: MediaCardProps) {
  const title = item.title.english || item.title.romaji;
  const isAnime = item.type === 'ANIME';
  const mediaUrl = `/media/${item.type.toLowerCase()}/${item.id}-${slugify(title)}`;
  
  const resumeData = useResume(item.id, item.type.toLowerCase());
  const watchlist = useWatchlist(item.id, item.type.toLowerCase(), title, item.coverImage.large);
  const [showTooltip, setShowTooltip] = useState(false);

  const formatProgress = (percent: number) => {
    return Math.round(percent);
  };

  return (
    <Card className="group w-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-transparent hover:border-primary/50 backdrop-blur">
      <CardContent className="relative p-0">
        <Link href={mediaUrl} className="block aspect-[2/3] w-full">
          <div className="relative h-full w-full overflow-hidden rounded-t-lg">
            {item.coverImage.large && (
              <Image
                src={item.coverImage.large}
                alt={`Cover for ${title}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                unoptimized
                priority={false}
              />
            )}
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Badge */}
            <Badge
              className="absolute right-2 top-2 transition-all duration-300 group-hover:right-3 group-hover:top-3 z-10"
              variant={isAnime ? 'default' : 'secondary'}
            >
              {item.type}
            </Badge>

            {/* Resume button */}
            {resumeData.hasProgress && (
              <div className="absolute bottom-2 left-2 right-2 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                  size="sm"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                  asChild
                >
                  <Link href={`${mediaUrl}?resume=true`}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resume ({formatProgress(resumeData.progressPercent)}%)
                  </Link>
                </Button>
              </div>
            )}

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button
                size="lg"
                className="rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 border border-white/50 p-3 text-white hover:text-white backdrop-blur"
                asChild
              >
                <Link href={mediaUrl}>
                  <Play className="h-6 w-6 fill-white" />
                </Link>
              </Button>
            </div>

            {/* Progress bar (if watching) */}
            {resumeData.hasProgress && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${resumeData.progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </Link>

        {/* Card content */}
        <div className="space-y-3 p-4">
          <Link href={mediaUrl}>
            <h3 className="line-clamp-2 text-sm font-bold text-foreground hover:text-primary transition-colors duration-200">
              {title}
            </h3>
          </Link>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {item.format && (
              <Badge variant="outline" className="text-xs">
                {item.format}
              </Badge>
            )}
            {item.startDate?.year && (
              <span className="text-xs text-muted-foreground">{item.startDate.year}</span>
            )}
            {isAnime && item.episodes ? (
              <span className="text-xs text-muted-foreground">{item.episodes} eps</span>
            ) : !isAnime && item.chapters ? (
              <span className="text-xs text-muted-foreground">{item.chapters} ch</span>
            ) : null}
          </div>

          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {item.genres.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.genres.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={mediaUrl}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {isAnime ? 'Watch' : 'Read'}
              </Link>
            </Button>
            <Button
              size="sm"
              variant={watchlist.isAdded ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                watchlist.toggle();
              }}
              title={watchlist.isAdded ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Bookmark className={`h-4 w-4 ${watchlist.isAdded ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
