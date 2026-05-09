/**
 * User UI Preferences Types
 * Manages user-customizable settings for tabs, sidebar, theme, etc.
 */

export interface TabPreferences {
  overview: boolean; // Always true (locked)
  cape: boolean;
  ai: boolean;
  parsed: boolean;
  threat_intel: boolean;
}

export interface SidebarPreferences {
  dashboard: boolean;
  upload: boolean;
  reports: boolean;
  threat_intel: boolean;
  integrations: boolean;
  frameworks: boolean;
  ml_dashboard: boolean;
  collapsed?: boolean;
}

export interface UiPreferences {
  tabs?: Partial<TabPreferences>;
  sidebar?: Partial<SidebarPreferences>;
  sidebarCollapsed?: boolean;
  [key: string]: any;
}

/**
 * Default UI Preferences - Used as fallback for all new users
 */
export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  tabs: {
    overview: true,
    cape: true,
    ai: true,
    parsed: false,
    threat_intel: true,
  },
  sidebar: {
    dashboard: true,
    upload: true,
    reports: true,
    threat_intel: true,
    integrations: false,
    frameworks: false,
    ml_dashboard: true,
  },
  sidebarCollapsed: false,
};

/**
 * Ensure preferences have all required fields with defaults
 */
export function normalizePreferences(prefs?: Partial<UiPreferences>): UiPreferences {
  const normalized: UiPreferences = {
    ...DEFAULT_UI_PREFERENCES,
    ...prefs,
  };

  // Merge tabs with defaults
  if (prefs?.tabs) {
    normalized.tabs = {
      ...DEFAULT_UI_PREFERENCES.tabs,
      ...prefs.tabs,
    };
    // Overview is always locked
    (normalized.tabs as TabPreferences).overview = true;
  }

  // Merge sidebar with defaults
  if (prefs?.sidebar) {
    normalized.sidebar = {
      ...DEFAULT_UI_PREFERENCES.sidebar,
      ...prefs.sidebar,
    };
  }

  return normalized;
}

/**
 * Validate tab key is valid
 */
export function isValidTabKey(key: string): key is keyof TabPreferences {
  return ["overview", "cape", "ai", "parsed", "threat_intel"].includes(key);
}

/**
 * Validate sidebar key is valid
 */
export function isValidSidebarKey(key: string): key is keyof SidebarPreferences {
  return [
    "dashboard",
    "upload",
    "reports",
    "threat_intel",
    "integrations",
    "frameworks",
    "ml_dashboard",
    "collapsed",
  ].includes(key);
}
