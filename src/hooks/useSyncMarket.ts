'use client';

import { useEffect, useRef, useCallback } from 'react';

// Sync interval in milliseconds (5 minutes for free CoinGecko tier)
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

// Minimum time between manual triggers (30 seconds)
const MANUAL_COOLDOWN_MS = 30_000;

interface UseSyncMarketOptions {
  /** Auto-sync on mount and every SYNC_INTERVAL_MS. Default: true */
  autoSync?: boolean;
  /** Called after a successful sync */
  onSuccess?: (result: SyncResult) => void;
  /** Called when sync is skipped (rate-limited or too soon) */
  onSkipped?: (reason: string) => void;
}

export interface SyncResult {
  status: 'success' | 'skipped' | 'rate_limited' | 'fallback' | 'error';
  message: string;
  coinsCount?: number;
  syncedAt?: string;
}

/**
 * useSyncMarket
 *
 * Triggers the /api/sync-market route to fetch live CoinGecko data and
 * persist it into Supabase market_snapshots. Handles:
 * - Auto-sync on mount + periodic interval
 * - Rate-limit / fallback detection
 * - Manual trigger with cooldown
 */
export function useSyncMarket(options: UseSyncMarketOptions = {}) {
  const { autoSync = true, onSuccess, onSkipped } = options;
  const lastManualTriggerRef = useRef<number>(0);
  const isSyncingRef = useRef(false);

  const sync = useCallback(async (): Promise<SyncResult | null> => {
    if (isSyncingRef.current) return null;
    isSyncingRef.current = true;

    try {
      const res = await fetch('/api/sync-market', { method: 'GET' });
      const data: SyncResult = await res.json();

      if (data.status === 'success') {
        onSuccess?.(data);
      } else if (data.status === 'skipped' || data.status === 'rate_limited') {
        onSkipped?.(data.message);
      }

      return data;
    } catch (err: any) {
      console.warn('[useSyncMarket] fetch error:', err.message);
      return { status: 'error', message: err.message };
    } finally {
      isSyncingRef.current = false;
    }
  }, [onSuccess, onSkipped]);

  // Manual trigger with cooldown
  const triggerSync = useCallback(async (): Promise<SyncResult | null> => {
    const now = Date.now();
    if (now - lastManualTriggerRef.current < MANUAL_COOLDOWN_MS) {
      return { status: 'skipped', message: 'Manual sync cooldown active.' };
    }
    lastManualTriggerRef.current = now;
    return sync();
  }, [sync]);

  // Auto-sync on mount + interval
  useEffect(() => {
    if (!autoSync) return;

    // Sync immediately on mount
    sync();

    const interval = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoSync, sync]);

  return { triggerSync };
}
