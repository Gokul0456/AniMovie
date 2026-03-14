'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWatchHistory } from '@/lib/persistence';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2 } from 'lucide-react';
import { removeFromWatchHistory } from '@/lib/persistence';

export default function ContinueWatching() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const items = getWatchHistory().slice(0, 6); // Get first 6 items
    setHistory(items);
    setIsLoading(false);
  }, []);

  const handleRemove = (id: number, type: string) => {
    removeFromWatchHistory(id, type);
    setHistory(history.filter((h) => !(h.id === id && h.type === type)));
  };

  if (isLoading) return null;

  if (history.length === 0) {
    return null; // Don't show section if no history
  }

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Continue Watching</h2>
        <Link href="/continue-watching">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {history.map((item) => {
          const progress = (item.currentTime / item.duration) * 100;
          const mediaPath = `/media/${item.type}/${item.id}-${item.title}`;
          
          return (
            <Card key={`${item.id}-${item.type}`} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-transparent hover:border-primary/50">
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

                    {/* Play and delete buttons on hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Button
                        size="sm"
                        className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                        asChild
                      >
                        <Link href={`${mediaPath}?resume=true`}>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Link>
                <div className="space-y-2 p-3">
                  <h3 className="line-clamp-2 text-xs font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{Math.round(progress)}% watched</span>
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
    </section>
  );
}
