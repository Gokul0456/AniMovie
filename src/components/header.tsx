'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AniMovieLogo } from '@/components/icons';
import { SearchBar } from '@/components/search-bar';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Menu, Bookmark, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

const navItems = [
  { name: 'Anime', tab: 'anime' },
  { name: 'Manga', tab: 'manga' },
  { name: 'Movies', tab: 'movies' },
  { name: 'TV Shows', tab: 'tv' },
];

function HeaderNavigation({ isMobile, onLinkClick }: { isMobile?: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('query');

  const getActiveTab = () => {
    if (currentQuery) {
      return searchParams.get('tab') || 'anime';
    }
    if (pathname.startsWith('/media/anime') || pathname.startsWith('/view/anime')) {
      return 'anime';
    }
    if (pathname.startsWith('/media/manga') || pathname.startsWith('/view/manga')) {
      return 'manga';
    }
    if (pathname.startsWith('/media/movie') || pathname.startsWith('/view/movie')) {
      return 'movies';
    }
    if (pathname.startsWith('/media/tv') || pathname.startsWith('/view/tv')) {
      return 'tv';
    }
    return searchParams.get('tab') || 'anime';
  };

  const currentTab = getActiveTab();
  const isHomePage = pathname === '/' && !currentQuery;

  if (isMobile) {
    return (
      <nav className="flex flex-col gap-2 pt-4">
        {navItems.map((item) => (
          <Link href={`/?tab=${item.tab}`} passHref key={item.tab} onClick={onLinkClick}>
            <Button
              variant={isHomePage && currentTab === item.tab ? 'secondary' : 'ghost'}
              className='w-full justify-start'
            >
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-full">
      {navItems.map((item) => (
        <Link href={`/?tab=${item.tab}`} passHref key={item.tab}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'transition-colors rounded-full',
              isHomePage && currentTab === item.tab
                ? 'bg-background/70 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.name}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
           <SheetHeader className="mb-4">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                <AniMovieLogo className="h-6 w-6 text-primary" />
                <span className="font-bold sm:inline-block">AniMovie</span>
              </Link>
           </SheetHeader>
          <Suspense fallback={<div className="w-full h-10" />}>
            <HeaderNavigation isMobile onLinkClick={() => setOpen(false)} />
          </Suspense>
          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
            <Link href="/continue-watching" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Continue Watching
              </Button>
            </Link>
            <Link href="/watchlist" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Bookmark className="mr-2 h-4 w-4" />
                Watchlist
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-2 flex items-center space-x-2 md:mr-6">
            <AniMovieLogo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">AniMovie</span>
          </Link>
          <Suspense fallback={<div className="w-48 h-10" />}>
            <HeaderNavigation />
          </Suspense>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBar />
          </div>
          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/continue-watching">
              <Button variant="ghost" size="icon" title="Continue Watching">
                <Clock className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/watchlist">
              <Button variant="ghost" size="icon" title="Watchlist">
                <Bookmark className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
