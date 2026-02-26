import { useState, useEffect } from 'react';
import { extractFairScore, isScoreFresh, packFairScore } from '@/utils/fairscore-cache';
import { IProfileList } from '@/models/profile.models';

interface UseFairScoreReturn {
  fairScore: number | null;
  isLoading: boolean;
  error: string | null;
}

export function useFairScore(profileData?: IProfileList | null): UseFairScoreReturn {
  const [fairScore, setFairScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAndCacheScore = async () => {
      if (!profileData?.wallet?.address || !profileData?.profile?.username) {
        if (isMounted) setFairScore(null);
        return;
      }

      const wallet = profileData.wallet.address;
      const username = profileData.profile.username;
      const currentBio = profileData.profile.bio;

      // 1. Check Cache
      const { cachedScore, cleanBio } = extractFairScore(currentBio);
      
      if (isScoreFresh(cachedScore)) {
        if (isMounted) setFairScore(cachedScore!.score);
        return;
      }

      // 2. Cache is stale or missing, fetch real score
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/fairscore?wallet=${wallet}`);
        if (!res.ok) throw new Error('Failed to fetch from FairScore API');
        
        const data = await res.json();
        const apiScore = data.fair_score !== undefined ? data.fair_score : 0;
        
        if (isMounted) setFairScore(apiScore);

        // 3. Update Tapestry profile silently to cache the new score
        const newBio = packFairScore(cleanBio, apiScore);
        
        // We do a fire-and-forget PUT request to info endpoint
        fetch(`/api/profiles/info?username=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio: newBio }),
        }).catch(err => console.error('Silent bio update failed:', err));

      } catch (err: any) {
        console.error('FairScore Hook Error:', err);
        if (isMounted) {
          setError(err.message);
          setFairScore(0); // fallback
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAndCacheScore();

    return () => {
      isMounted = false;
    };
  }, [profileData?.wallet?.address, profileData?.profile?.username, profileData?.profile?.bio]);

  return { fairScore, isLoading, error };
}
