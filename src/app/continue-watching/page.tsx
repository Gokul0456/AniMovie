'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWatchHistory, removeFromWatchHistory } from '@/lib/persistence';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, RotateCcw } from 'lucide-react';
import Header from '@/components/header';
import { slugify } from '@/lib/utils';

export default function ContinueWatchingPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'progress'>('recent');

  useEffect(() => {
    setIsLoading(true);
    let items = getWatchHistory();
    
    if (sortBy === 'progress') {
      items.sort((a, b) => (b.currentTime / b.duration) - (a.currentTime / a.duration));
    }
    
    setHistory(items);
    setIsLoading(false);
  }, [sortBy]);

  const handleRemove = (id: number, type: string) => {
    removeFromWatchHistory(id, type);
    setHistory(history.filter((h) => !(h.id === id && h.type === type)));
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Continue Watching</h1>
            <p className="text-muted-foreground">
              {history.length === 0
                ? 'No watching history yet. Start watching something!'
                : `${history.length} ${history.length === 1 ? 'item' : 'items'} in progress`}
            </p>
          </div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                Recent
              </Button>
              <Button
                variant={sortBy === 'progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('progress')}
              >
                Progress
              </Button>
            </div>
          )}
        </div>

        {/* History grid */}
        {history.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {history.map((item) => {
              const progress = (item.currentTime / item.duration) * 100;
              const mediaPath = `/media/${item.type}/${item.id}-${slugify(item.title)}`;
              
              return (
                <Card
                  key={`${item.id}-${item.type}-${item.timestamp}`}
                  className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-transparent hover:border-primary/50"
                >
                  <CardContent className="relative p-0">
                    <Link href={mediaPath} className="block aspect-[2/3] w-full">
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          src={item.posterPath}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Resume button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                            asChild
                          >
                            <Link href={`${mediaPath}?resume=true`}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Resume
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Link>
                    <div className="space-y-2 p-3">
                      <h3 className="line-clamp-2 text-xs font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}% watched</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id, item.type)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted py-12">
            <PlayCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">No history yet</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground max-w-sm">
              Start watching your favorite shows and movies to see them here!
            </p>
            <Button asChild>
              <Link href="/">Start Watching</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
