"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "@/services/api/api.service";
import {
  UiPreferences,
  DEFAULT_UI_PREFERENCES,
  normalizePreferences,
} from "@/lib/types/preferences";

interface UseUiPreferencesReturn {
  preferences: UiPreferences;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UiPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

/**
 * Hook to manage user UI preferences
 * - Loads from localStorage for instant availability
 * - Syncs with server asynchronously
 * - Falls back to defaults if missing
 * - Handles errors gracefully
 */
export function useUiPreferences(): UseUiPreferencesReturn {
  const [preferences, setPreferences] = useState<UiPreferences>(() => {
    // Load from localStorage on initial render (client-only)
    if (typeof window === "undefined") return DEFAULT_UI_PREFERENCES;
    try {
      const stored = localStorage.getItem("chameleon.ui_preferences");
      if (stored) {
        return normalizePreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse stored preferences:", e);
    }
    return DEFAULT_UI_PREFERENCES;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch preferences from server on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getPreferences();
        const normalized = normalizePreferences(data);
        setPreferences(normalized);
        // Sync to localStorage
        localStorage.setItem(
          "chameleon.ui_preferences",
          JSON.stringify(normalized),
        );
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
        // Don't show error to user - just use localStorage/defaults
        const stored = localStorage.getItem("chameleon.ui_preferences");
        if (stored) {
          try {
            const normalized = normalizePreferences(JSON.parse(stored));
            setPreferences(normalized);
          } catch {
            setPreferences(DEFAULT_UI_PREFERENCES);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Update preferences locally and sync to server
  const updatePreferences = useCallback(
    async (updates: Partial<UiPreferences>) => {
      try {
        const merged = normalizePreferences({ ...preferences, ...updates });

        // Update state immediately for instant UI feedback
        setPreferences(merged);

        // Save to localStorage for persistence
        localStorage.setItem(
          "chameleon.ui_preferences",
          JSON.stringify(merged),
        );

        // Sync to server (non-blocking)
        await apiService.updatePreferences(updates);
      } catch (err) {
        console.error("Failed to update preferences:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update preferences",
        );
        // Preferences still updated locally, so UI reflects changes
      }
    },
    [preferences],
  );

  // Reset to defaults
  const resetPreferences = useCallback(async () => {
    try {
      setPreferences(DEFAULT_UI_PREFERENCES);
      localStorage.setItem(
        "chameleon.ui_preferences",
        JSON.stringify(DEFAULT_UI_PREFERENCES),
      );

      // Sync reset to server
      await apiService.updatePreferences(DEFAULT_UI_PREFERENCES);
    } catch (err) {
      console.error("Failed to reset preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to reset preferences",
      );
    }
  }, []);

  return useMemo(
    () => ({
      preferences,
      loading,
      error,
      updatePreferences,
      resetPreferences,
    }),
    [preferences, loading, error, updatePreferences, resetPreferences],
  );
}
