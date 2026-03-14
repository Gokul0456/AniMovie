// Streaming source manager with fallback support

export type StreamingSource = 'vidsrc' | 'consumet' | 'jikan';

export interface StreamingSourceConfig {
  name: string;
  key: StreamingSource;
  getUrl: (type: string, mediaId: string | number, episode?: number, season?: number) => string;
  timeout: number; // in milliseconds
}

// Source configurations
const STREAMING_SOURCES: StreamingSourceConfig[] = [
  {
    name: 'VidSrc.icu',
    key: 'vidsrc',
    getUrl: (type, mediaId, episode = 1, season = 1) => {
      if (type === 'anime') {
        return `https://vidsrc.icu/embed/anime/${mediaId}/${episode}/0`;
      }
      if (type === 'manga') {
        return `https://vidsrc.icu/embed/manga/${mediaId}/${episode}`;
      }
      if (type === 'movie') {
        return `https://vidsrc.icu/embed/movie/${mediaId}`;
      }
      if (type === 'tv') {
        return `https://vidsrc.icu/embed/tv/${mediaId}/${season}/${episode}`;
      }
      return '';
    },
    timeout: 5000,
  },
  {
    name: 'Consumet API',
    key: 'consumet',
    getUrl: (type, mediaId, episode = 1, season = 1) => {
      // Consumet returns provider URLs for streaming
      if (type === 'anime') {
        return `https://api.consumet.org/anime/gogoanime/${mediaId}`;
      }
      if (type === 'tv') {
        return `https://api.consumet.org/movies/flixhq/${mediaId}`;
      }
      return '';
    },
    timeout: 8000,
  },
  {
    name: 'Jikan API',
    key: 'jikan',
    getUrl: (type, mediaId) => {
      // Jikan primarily provides metadata but can point to streaming
      if (type === 'anime') {
        return `https://api.jikan.moe/v4/anime/${mediaId}`;
      }
      return '';
    },
    timeout: 6000,
  },
];

// Get source configuration
export function getSourceConfig(source: StreamingSource): StreamingSourceConfig | undefined {
  return STREAMING_SOURCES.find((s) => s.key === source);
}

// Test if source is available (simple connectivity check)
export async function testSourceAvailability(
  source: StreamingSourceConfig
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), source.timeout);

    const response = await fetch(source.getUrl('anime', '1'), {
      signal: controller.signal,
      method: 'HEAD',
    }).catch(() => {
      // HEAD request might fail, try GET instead
      return fetch(source.getUrl('anime', '1'), {
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);
    return response.ok || response.status === 301 || response.status === 302;
  } catch (error) {
    return false;
  }
}

// Get working source with fallback
export async function getWorkingSource(
  sources: StreamingSource[] = ['vidsrc', 'consumet', 'jikan']
): Promise<StreamingSourceConfig | null> {
  for (const sourceKey of sources) {
    const config = getSourceConfig(sourceKey);
    if (!config) continue;

    const isAvailable = await testSourceAvailability(config);
    if (isAvailable) {
      return config;
    }
  }
  
  return STREAMING_SOURCES[0]; // Fallback to first source
}

// Get streaming URL with source selection
export async function getStreamingUrl(
  type: string,
  mediaId: string | number,
  preferredSource?: StreamingSource,
  episode?: number,
  season?: number
): Promise<string> {
  let sources: StreamingSource[] = ['vidsrc', 'consumet', 'jikan'];
  
  // If a preferred source is specified, prioritize it
  if (preferredSource) {
    sources = [preferredSource, ...sources.filter((s) => s !== preferredSource)];
  }

  const source = await getWorkingSource(sources);
  if (!source) {
    return STREAMING_SOURCES[0].getUrl(type, mediaId, episode, season);
  }

  return source.getUrl(type, mediaId, episode, season);
}

// Get available streaming sources
export function getAvailableSources(): StreamingSourceConfig[] {
  return STREAMING_SOURCES;
}

// Store user's preferred source
export function setPreferredSource(source: StreamingSource): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred_streaming_source', source);
  }
}

export function getPreferredSource(): StreamingSource {
  if (typeof window === 'undefined') return 'vidsrc';
  return (localStorage.getItem('preferred_streaming_source') as StreamingSource) || 'vidsrc';
}
