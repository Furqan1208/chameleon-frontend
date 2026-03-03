// D:\FYP\Chameleon Frontend\hooks\useAlienVaultOTX.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OTXScanRequest, OTXResult } from '@/lib/threat-intel/otx-types';
import { alienvaultOTXService } from '@/lib/threat-intel/alienvault-service';

interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  minutesUntilReset: number;
  used: number;
  limit: number;
  isLimited: boolean;
}

export function useAlienVaultOTX() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OTXResult[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>({
    remaining: 10,
    resetTime: new Date(),
    minutesUntilReset: 0,
    used: 0,
    limit: 10,
    isLimited: false
  });
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // simple initialization: validate API key if configured
  useEffect(() => {
    const init = async () => {
      if (!alienvaultOTXService.isConfigured()) {
        setApiKeyValid(false);
        return;
      }
      try {
        const valid = await alienvaultOTXService.validateApiKey();
        setApiKeyValid(valid);
      } catch {
        setApiKeyValid(false);
      }
    };
    init();
  }, []);

  const scanIndicator = useCallback(async (request: OTXScanRequest) => {
    if (!alienvaultOTXService.isConfigured()) {
      const msg = 'AlienVault OTX API key is not configured.\nPlease set NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY in your environment.';
      setError(msg);
      throw new Error(msg);
    }

    setError(null);
    setScanning(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await alienvaultOTXService.scanIndicator(request);
      setResults(prev => [result, ...prev.filter(r => r.ioc !== request.indicator)].slice(0, 20));

      const rl = alienvaultOTXService.getRateLimitInfo();
      setRateLimit(prev => ({
        ...prev,
        remaining: rl.remaining,
        resetTime: rl.resetTime,
        minutesUntilReset: rl.minutesUntilReset
      }));

      setScanning(false);
      return result;
    } catch (err) {
      setScanning(false);
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await alienvaultOTXService.clearCache();
      const rl = alienvaultOTXService.getRateLimitInfo();
      setRateLimit(prev => ({
        ...prev,
        remaining: rl.remaining,
        resetTime: rl.resetTime,
        minutesUntilReset: rl.minutesUntilReset
      }));
    } catch (err) {
      console.error('[useAlienVaultOTX] clearCache failed', err);
    }
  }, []);

  const validateApiKey = useCallback(async () => {
    try {
      const valid = await alienvaultOTXService.validateApiKey();
      setApiKeyValid(valid);
      return valid;
    } catch (err) {
      setApiKeyValid(false);
      return false;
    }
  }, []);

  return {
    scanning,
    error,
    results,
    rateLimit,
    apiKeyValid,
    scanIndicator,
    clearResults,
    clearCache,
    validateApiKey
  };
}
