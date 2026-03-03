import { CommunityMeta } from "./community-meta";

export function getCleanBio(bio: string | null | undefined): string {
  if (!bio) return '';
  
  const delimiters = [
    '|COMMUNITY_META|',
    '|FAIRSCORE_META|',
    '|||META|||',
    '|TAPESTRY_META|'
  ];
  
  let clean = bio;
  for (const delimiter of delimiters) {
    if (clean.includes(delimiter)) {
      clean = clean.split(delimiter)[0];
    }
  }
  
  return clean.trim();
}

export function getCommunityDescription(bio: string | null | undefined, meta: CommunityMeta | null): string {
  const cleanBio = getCleanBio(bio);
  if (cleanBio) return cleanBio;
  
  if (meta?.gateType === 'fairscore' && meta?.fairScoreGate && meta.fairScoreGate > 0) {
    return `An exclusive community gated by a FairScore of ${meta.fairScoreGate} or higher.`;
  }
  
  return "A public Tapestry community for open discussion and sharing.";
}
