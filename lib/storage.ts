const STORAGE_KEYS = {
  lang: 'chemquest-lang',
  highScore: 'chemquest-high-score',
  splashSeen: 'chemquest-splash-seen',
  /** Legacy key from the original game */
  legacyHighScore: 'pip182',
} as const;

export type GameStorageState = {
  highScore: number;
  splashSeen: boolean;
  lang: 'sv' | 'en';
};

const readNumber = (key: string, fallback = 0): number => {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null || raw === '') return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Ensure defaults exist, migrate legacy high score, return current values. */
export function initGameStorage(): GameStorageState {
  if (typeof window === 'undefined') {
    return { highScore: 0, splashSeen: false, lang: 'sv' };
  }

  const legacy = localStorage.getItem(STORAGE_KEYS.legacyHighScore);
  if (
    legacy !== null &&
    localStorage.getItem(STORAGE_KEYS.highScore) === null
  ) {
    localStorage.setItem(STORAGE_KEYS.highScore, legacy);
  }

  if (localStorage.getItem(STORAGE_KEYS.highScore) === null) {
    localStorage.setItem(STORAGE_KEYS.highScore, '0');
  }

  if (localStorage.getItem(STORAGE_KEYS.lang) === null) {
    localStorage.setItem(STORAGE_KEYS.lang, 'sv');
  }

  if (localStorage.getItem(STORAGE_KEYS.splashSeen) === null) {
    localStorage.setItem(STORAGE_KEYS.splashSeen, 'false');
  }

  const langRaw = localStorage.getItem(STORAGE_KEYS.lang);
  const lang = langRaw === 'en' ? 'en' : 'sv';

  return {
    highScore: readNumber(STORAGE_KEYS.highScore, 0),
    splashSeen: localStorage.getItem(STORAGE_KEYS.splashSeen) === 'true',
    lang,
  };
}

export function getHighScore(): number {
  return readNumber(STORAGE_KEYS.highScore, 0);
}

export function setHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  const safe = Math.max(0, Math.round(score));
  localStorage.setItem(STORAGE_KEYS.highScore, String(safe));
  // Keep legacy key in sync for older code paths
  localStorage.setItem(STORAGE_KEYS.legacyHighScore, String(safe));
}

export function markSplashSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.splashSeen, 'true');
}

export function hasSeenSplash(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.splashSeen) === 'true';
}

export { STORAGE_KEYS };
