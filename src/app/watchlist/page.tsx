'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWatchlist, removeFromWatchlist } from '@/lib/persistence';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';
import { slugify } from '@/lib/utils';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const items = getWatchlist();
    setWatchlist(items);
    setFilteredWatchlist(items);
    setIsLoading(false);
  }, []);

  // Filter watchlist based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWatchlist(watchlist);
    } else {
      const filtered = watchlist.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWatchlist(filtered);
    }
  }, [searchQuery, watchlist]);

  const handleRemove = (id: number, type: string) => {
    removeFromWatchlist(id, type);
    const updated = watchlist.filter((w) => !(w.id === id && w.type === type));
    setWatchlist(updated);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">My Watchlist</h1>
          <p className="text-muted-foreground">
            {filteredWatchlist.length === 0
              ? 'Your watchlist is empty. Start adding your favorite shows!'
              : `You have ${filteredWatchlist.length} item${filteredWatchlist.length === 1 ? '' : 's'} in your watchlist`}
          </p>
        </div>

        {/* Search */}
        {watchlist.length > 0 && (
          <div className="mb-6">
            <Input
              placeholder="Search watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        {/* Watchlist grid */}
        {filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredWatchlist.map((item) => {
              const mediaPath = `/media/${item.type}/${item.id}-${slugify(item.title)}`;
              
              return (
                <Card
                  key={`${item.id}-${item.type}`}
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
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                            asChild
                          >
                            <Link href={mediaPath}>Watch Now</Link>
                          </Button>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <Link href={mediaPath} className="flex-1">
                        <h3 className="line-clamp-2 text-xs font-semibold text-foreground hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id, item.type)}
                        className="h-6 w-6 p-0 shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted py-12">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-muted-foreground">Your watchlist is empty</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground max-w-sm">
              Start adding your favorite shows and movies to keep track of what you want to watch!
            </p>
            <Button asChild>
              <Link href="/">Browse Content</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
