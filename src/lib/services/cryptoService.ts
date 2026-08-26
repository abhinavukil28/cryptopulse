'use client';

import { createClient } from '@/lib/supabase/client';
import type { CryptoCoin, Alert } from '@/lib/mockData';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MarketSnapshot {
  id: string;
  totalMarketCap: number;
  marketCapChange24h: number;
  btcDominance: number;
  btcDominanceChange: number;
  totalVolume24h: number;
  volumeChange24h: number;
  gainersCount: number;
  losersCount: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  activeCoins: number;
  coinsData: CryptoCoin[];
  btcDominanceHistory: { time: string; value: number }[];
  volumeHistory: { time: string; volume: number }[];
  capturedAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  logoColor: string;
  customThreshold: number;
  notificationsEnabled: boolean;
  addedAt: string;
}

export interface AlertRecord {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  severity: 'INFO' | 'IMPORTANT' | 'CRITICAL';
  alertType: string;
  title: string;
  description: string;
  priceChange: number;
  volumeChange: number;
  momentumScore: number;
  rank: number;
  reason: string;
  timeframeMinutes: number;
  isRead: boolean;
  createdAt: string;
}

// ─── Helper: snake_case → camelCase ──────────────────────────────────────────

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const cls = error.code.substring(0, 2);
    if (cls === '42' || cls === '08') return true;
    if (cls === '23') return false;
  }
  if (error.message) {
    return /relation.*does not exist|column.*does not exist|function.*does not exist|syntax error/i.test(error.message);
  }
  return false;
}

function rowToSnapshot(row: any): MarketSnapshot {
  return {
    id: row.id,
    totalMarketCap: Number(row.total_market_cap),
    marketCapChange24h: Number(row.market_cap_change_24h),
    btcDominance: Number(row.btc_dominance),
    btcDominanceChange: Number(row.btc_dominance_change),
    totalVolume24h: Number(row.total_volume_24h),
    volumeChange24h: Number(row.volume_change_24h),
    gainersCount: row.gainers_count,
    losersCount: row.losers_count,
    fearGreedIndex: row.fear_greed_index,
    fearGreedLabel: row.fear_greed_label,
    activeCoins: row.active_coins,
    coinsData: row.coins_data || [],
    btcDominanceHistory: row.btc_dominance_history || [],
    volumeHistory: row.volume_history || [],
    capturedAt: row.captured_at,
  };
}

function rowToAlert(row: any): AlertRecord {
  return {
    id: row.id,
    coinId: row.coin_id,
    coinName: row.coin_name,
    coinSymbol: row.coin_symbol,
    severity: row.severity,
    alertType: row.alert_type,
    title: row.title,
    description: row.description,
    priceChange: Number(row.price_change),
    volumeChange: Number(row.volume_change),
    momentumScore: row.momentum_score,
    rank: row.rank,
    reason: row.reason,
    timeframeMinutes: row.timeframe_minutes,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

function rowToWatchlistItem(row: any): WatchlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinName: row.coin_name,
    coinSymbol: row.coin_symbol,
    logoColor: row.logo_color,
    customThreshold: Number(row.custom_threshold),
    notificationsEnabled: row.notifications_enabled,
    addedAt: row.added_at,
  };
}

// ─── Market Snapshot Service ──────────────────────────────────────────────────

export const marketService = {
  async getLatestSnapshot(): Promise<MarketSnapshot | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('market_snapshots')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? rowToSnapshot(data) : null;
    } catch (err: any) {
      console.error('marketService.getLatestSnapshot error:', err.message);
      return null;
    }
  },
};

// ─── Alert Service ────────────────────────────────────────────────────────────

export const alertService = {
  async getAlerts(limit = 20): Promise<AlertRecord[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data || []).map(rowToAlert);
    } catch (err: any) {
      console.error('alertService.getAlerts error:', err.message);
      return [];
    }
  },

  async markRead(id: string): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('alert_history')
        .update({ is_read: true })
        .eq('id', id);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('alertService.markRead error:', err.message);
    }
  },

  async markAllRead(): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('alert_history')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('alertService.markAllRead error:', err.message);
    }
  },
};

// ─── Watchlist Service ────────────────────────────────────────────────────────

export const watchlistService = {
  async getItems(userId: string): Promise<WatchlistItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: true });

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data || []).map(rowToWatchlistItem);
    } catch (err: any) {
      console.error('watchlistService.getItems error:', err.message);
      return [];
    }
  },

  async addItem(userId: string, coin: {
    coinId: string;
    coinName: string;
    coinSymbol: string;
    logoColor: string;
    customThreshold?: number;
    notificationsEnabled?: boolean;
  }): Promise<WatchlistItem | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('watchlist_items')
        .insert({
          user_id: userId,
          coin_id: coin.coinId,
          coin_name: coin.coinName,
          coin_symbol: coin.coinSymbol,
          logo_color: coin.logoColor,
          custom_threshold: coin.customThreshold ?? 3.0,
          notifications_enabled: coin.notificationsEnabled ?? true,
        })
        .select()
        .single();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? rowToWatchlistItem(data) : null;
    } catch (err: any) {
      console.error('watchlistService.addItem error:', err.message);
      return null;
    }
  },

  async removeItem(userId: string, coinId: string): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('watchlistService.removeItem error:', err.message);
    }
  },

  async updateThreshold(userId: string, coinId: string, threshold: number): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .update({ custom_threshold: threshold })
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('watchlistService.updateThreshold error:', err.message);
    }
  },

  async toggleNotifications(userId: string, coinId: string, enabled: boolean): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('watchlist_items')
        .update({ notifications_enabled: enabled })
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('watchlistService.toggleNotifications error:', err.message);
    }
  },
};
