export function getCleanBio(bio: string | null | undefined): string {
  if (!bio) return '';
  
  const delimiters = [
    '|COMMUNITY_META|',
    '|FAIRSCORE_META|',
    '|||META|||',
    '|TAPESTRY_META|',
    '|FAIRSCORE_META|'
  ];
  
  let clean = bio;
  for (const delimiter of delimiters) {
    if (clean.includes(delimiter)) {
      clean = clean.split(delimiter)[0];
    }
  }
  
  return clean.trim();
}
