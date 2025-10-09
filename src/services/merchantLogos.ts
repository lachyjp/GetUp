// Merchant logo resolver: maps description/raw text to a logo URL.
// Strategy:
// 1) Normalize input, try exact known mappings
// 2) Fuzzy includes against curated keywords -> domain
// 3) Local overrides from localStorage
// 4) Fallback to Clearbit logo CDN by domain

const EXACT_MAP: Record<string, string> = {
  'apple': 'apple.com',
  'spotify': 'spotify.com',
  'uber': 'uber.com',
  'paypal': 'paypal.com',
  'amazon': 'amazon.com',
  'mcdonalds': 'mcdonalds.com',
  'woolworths': 'woolworths.com.au',
  'coles': 'coles.com.au',
  'oporto': 'oporto.com.au',
  'blue bottle': 'bluebottlecoffee.com',
  'whole foods': 'wholefoodsmarket.com',
  'playstation': 'playstation.com',
  'apple.com/bill': 'apple.com',
  'dan murphy': 'danmurphys.com.au',
  'event cinemas': 'eventcinemas.com.au',
  'hawkers': 'hawkers.com.au',
  'jb hi fi': 'jbhifi.com.au',
  'jbhifi': 'jbhifi.com.au',
};

const KEYWORD_DOMAINS: Array<{ keyword: RegExp; domain: string }> = [
  { keyword: /apple(\.com)?/i, domain: 'apple.com' },
  { keyword: /spotify/i, domain: 'spotify.com' },
  { keyword: /uber/i, domain: 'uber.com' },
  { keyword: /paypal|paypal\*/i, domain: 'paypal.com' },
  { keyword: /amazon/i, domain: 'amazon.com' },
  { keyword: /mcdonald/i, domain: 'mcdonalds.com' },
  { keyword: /woolworth/i, domain: 'woolworths.com.au' },
  { keyword: /coles/i, domain: 'coles.com.au' },
  { keyword: /oporto/i, domain: 'oporto.com.au' },
  { keyword: /blue\s*bottle/i, domain: 'bluebottlecoffee.com' },
  { keyword: /whole\s*foods/i, domain: 'wholefoodsmarket.com' },
  { keyword: /playstation|ps\s*plus|ps\s*store/i, domain: 'playstation.com' },
  { keyword: /dan\s*murphy/i, domain: 'danmurphys.com.au' },
  { keyword: /event\s*cinemas|event\s*george/i, domain: 'eventcinemas.com.au' },
  { keyword: /hawkers/i, domain: 'hawkers.com.au' },
  { keyword: /jb\s*hi\s*-?\s*fi|jbhifi/i, domain: 'jbhifi.com.au' },
  { keyword: /coles\s*express|coles/i, domain: 'coles.com.au' },
  { keyword: /apple\.com\/bill|itunes\.com\/bill|apple\s*care/i, domain: 'apple.com' },
];

export function normalize(input: string | undefined): string {
  return (input || '')
    .toLowerCase()
    .replace(/[_*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLocalOverride(normalized: string): string | undefined {
  try {
    const raw = localStorage.getItem('merchantLogoOverrides');
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[normalized];
  } catch {
    return undefined;
  }
}

export function setLocalOverride(label: string, logoUrl: string) {
  try {
    const normalized = normalize(label);
    const raw = localStorage.getItem('merchantLogoOverrides');
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[normalized] = logoUrl;
    localStorage.setItem('merchantLogoOverrides', JSON.stringify(map));
  } catch {}
}

export function clearLocalOverride(label: string) {
  try {
    const normalized = normalize(label);
    const raw = localStorage.getItem('merchantLogoOverrides');
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, string>;
    delete map[normalized];
    localStorage.setItem('merchantLogoOverrides', JSON.stringify(map));
  } catch {}
}

function toClearbit(domain: string): string {
  return `https://logo.clearbit.com/${domain}?size=256`;
}

function toGoogleFavicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function resolveMerchantLogo(description?: string, rawText?: string): string | undefined {
  const domain = resolveMerchantDomain(description, rawText);
  if (domain) return toClearbit(domain);
  return undefined;
}

export function resolveMerchantDomain(description?: string, rawText?: string): string | undefined {
  const nDesc = normalize(description);
  const nRaw = normalize(rawText);
  const combined = `${nDesc} ${nRaw}`.trim();

  // 1) Local override
  const override = getLocalOverride(combined) || getLocalOverride(nRaw) || getLocalOverride(nDesc);
  if (override) {
    try {
      const url = new URL(override);
      return url.hostname;
    } catch {
      // if override is a domain string, return as is
      return override;
    }
  }

  // 2) Exact map by label
  for (const [label, domain] of Object.entries(EXACT_MAP)) {
    if (combined.includes(label)) return domain;
  }

  // 3) Keyword match
  for (const { keyword, domain } of KEYWORD_DOMAINS) {
    if (keyword.test(combined)) return domain;
  }

  // 4) Extract explicit domain patterns from raw text if present
  const domainMatch = combined.match(/([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/i);
  if (domainMatch && domainMatch[1]) return domainMatch[1];

  return undefined;
}


