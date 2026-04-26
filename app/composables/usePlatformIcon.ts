const platformSlugs: Record<string, string> = {
  telegram: 'telegram',
  instagram: 'instagram',
  facebook: 'facebook',
  snapchat: 'snapchat',
  tinder: 'tinder',
  twitter: 'twitter',
  x: 'x',
  whatsapp: 'whatsapp',
  tiktok: 'tiktok',
  linkedin: 'linkedin',
  discord: 'discord',
  reddit: 'reddit',
  youtube: 'youtube',
  onlyfans: 'onlyfans',
}

const platformAbbreviations: Record<string, string> = {
  fetlife: 'FL',
  kik: 'Kik',
  feeld: 'Fe',
  signal: 'Si',
  skype: 'Sk',
}

export function usePlatformIcon(platform: string) {
  const key = platform.toLowerCase()
  const slug = platformSlugs[key]
  if (slug) {
    return { type: 'icon', url: `https://cdn.simpleicons.org/${slug}/white` }
  }
  const abbr = platformAbbreviations[key] ?? platform.slice(0, 2).toUpperCase()
  return { type: 'text', abbr }
}