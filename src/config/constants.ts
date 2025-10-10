// Application configuration constants
export const CONFIG = {
  // API Configuration
  API: {
    MAX_TRANSACTION_COUNT: 200,
    CACHE_DURATION_MS: 2 * 60 * 1000, // 2 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    TIMEOUT_MS: 30000,
  },

  // UI Configuration
  UI: {
    DEMO_LOADING_DELAY_MS: 800,
    DEMO_REFRESH_DELAY_MS: 600,
    LOGO_CACHE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
    PROGRESS_BAR_HEIGHT: 6,
    PROGRESS_BAR_HEIGHT_LARGE: 8,
  },

  // Storage Keys
  STORAGE: {
    API_KEY: 'up-api-key',
    MERCHANT_OVERRIDES: 'merchantLogoOverrides',
    DEBUG_LOGOS: 'txnDebugLogos',
    CONSOLE_LOG: 'txnConsoleLog',
    CONSOLE_ACCOUNTS: 'txnConsoleAccounts',
    SAVER_GOAL_PREFIX: 'saver-goal-',
  },

  // Validation
  VALIDATION: {
    MIN_PIN_LENGTH: 4,
    MIN_API_KEY_LENGTH: 15,
  },

  // Logo Sources
  LOGO_SOURCES: {
    CLEARBIT: 'https://logo.clearbit.com',
    ICON_HORSE: 'https://icon.horse/icon',
    GOOGLE_FAVICON: 'https://www.google.com/s2/favicons',
    GITHUB_FAVICON: 'https://favicons.githubusercontent.com',
    STATVOO: 'https://api.statvoo.com/logo',
  },

  // Default Values
  DEFAULTS: {
    TRANSACTION_COUNT: 200,
    DEMO_API_KEY: '__DEMO__',
    LOGO_SIZE: 256,
    FAVICON_SIZE: 64,
  },
} as const;

// Type for configuration access
export type Config = typeof CONFIG;
