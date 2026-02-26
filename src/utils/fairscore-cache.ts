export interface CachedFairScore {
  score: number;
  ts: number;
}

const META_DIVIDER = '|FAIRSCORE_META|';

export function extractFairScore(bio: string | null | undefined): { cleanBio: string, cachedScore: CachedFairScore | null } {
  if (!bio) {
    return { cleanBio: '', cachedScore: null };
  }

  if (bio.includes(META_DIVIDER)) {
    const parts = bio.split(META_DIVIDER);
    const cleanBio = parts[0].trim();
    const metaString = parts[1];
    
    try {
      if (metaString) {
        const parsed = JSON.parse(metaString);
        if (typeof parsed.score === 'number' && typeof parsed.ts === 'number') {
          return { cleanBio, cachedScore: parsed as CachedFairScore };
        }
      }
    } catch (e) {
      console.warn('Failed to parse FairScore metadata from bio', e);
    }
    
    return { cleanBio, cachedScore: null };
  }

  return { cleanBio: bio, cachedScore: null };
}

export function packFairScore(cleanBio: string, score: number): string {
  const meta: CachedFairScore = {
    score,
    ts: Date.now()
  };
  const trimmedBio = cleanBio ? cleanBio.trim() : '';
  return `${trimmedBio} ${META_DIVIDER}${JSON.stringify(meta)}`;
}

// Ensure the cache is younger than 24 hours
export function isScoreFresh(cachedMeta: CachedFairScore | null): boolean {
  if (!cachedMeta) return false;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  return Date.now() - cachedMeta.ts < ONE_DAY_MS;
}
