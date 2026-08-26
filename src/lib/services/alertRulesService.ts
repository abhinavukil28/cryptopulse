'use client';

import { createClient } from '@/lib/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AlertRule {
  id: string;
  userId: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  logoColor: string;
  priceThreshold: number;
  volumeThreshold: number;
  minMomentumScore: number;
  weightPrice: number;
  weightVolume: number;
  weightMomentum: number;
  cooldownMinutes: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  inappEnabled: boolean;
  browserPushEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  discordEnabled: boolean;
  globalCooldownMinutes: number;
  globalMinScore: number;
  globalMinPricePct: number;
  globalMinVolumePct: number;
  notifyCritical: boolean;
  notifyImportant: boolean;
  notifyInfo: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function rowToAlertRule(row: any): AlertRule {
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinName: row.coin_name,
    coinSymbol: row.coin_symbol,
    logoColor: row.logo_color,
    priceThreshold: Number(row.price_threshold),
    volumeThreshold: Number(row.volume_threshold),
    minMomentumScore: row.min_momentum_score,
    weightPrice: Number(row.weight_price),
    weightVolume: Number(row.weight_volume),
    weightMomentum: Number(row.weight_momentum),
    cooldownMinutes: row.cooldown_minutes,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToNotifPrefs(row: any): NotificationPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    inappEnabled: row.inapp_enabled,
    browserPushEnabled: row.browser_push_enabled,
    emailEnabled: row.email_enabled,
    telegramEnabled: row.telegram_enabled,
    discordEnabled: row.discord_enabled,
    globalCooldownMinutes: row.global_cooldown_minutes,
    globalMinScore: row.global_min_score,
    globalMinPricePct: Number(row.global_min_price_pct),
    globalMinVolumePct: Number(row.global_min_volume_pct),
    notifyCritical: row.notify_critical,
    notifyImportant: row.notify_important,
    notifyInfo: row.notify_info,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Alert Rules Service ──────────────────────────────────────────────────────

export const alertRulesService = {
  async getRules(userId: string): Promise<AlertRule[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return (data || []).map(rowToAlertRule);
    } catch (err: any) {
      console.error('alertRulesService.getRules error:', err.message);
      return [];
    }
  },

  async upsertRule(userId: string, rule: {
    coinId: string;
    coinName: string;
    coinSymbol: string;
    logoColor: string;
    priceThreshold: number;
    volumeThreshold: number;
    minMomentumScore: number;
    weightPrice: number;
    weightVolume: number;
    weightMomentum: number;
    cooldownMinutes: number;
    isEnabled: boolean;
  }): Promise<AlertRule | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .upsert({
          user_id: userId,
          coin_id: rule.coinId,
          coin_name: rule.coinName,
          coin_symbol: rule.coinSymbol,
          logo_color: rule.logoColor,
          price_threshold: rule.priceThreshold,
          volume_threshold: rule.volumeThreshold,
          min_momentum_score: rule.minMomentumScore,
          weight_price: rule.weightPrice,
          weight_volume: rule.weightVolume,
          weight_momentum: rule.weightMomentum,
          cooldown_minutes: rule.cooldownMinutes,
          is_enabled: rule.isEnabled,
        }, { onConflict: 'user_id,coin_id' })
        .select()
        .single();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? rowToAlertRule(data) : null;
    } catch (err: any) {
      console.error('alertRulesService.upsertRule error:', err.message);
      return null;
    }
  },

  async deleteRule(userId: string, coinId: string): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('alert_rules')
        .delete()
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('alertRulesService.deleteRule error:', err.message);
    }
  },

  async toggleRule(userId: string, coinId: string, enabled: boolean): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ is_enabled: enabled })
        .eq('user_id', userId)
        .eq('coin_id', coinId);

      if (error && isSchemaError(error)) throw error;
    } catch (err: any) {
      console.error('alertRulesService.toggleRule error:', err.message);
    }
  },
};

// ─── Notification Preferences Service ────────────────────────────────────────

export const notificationPrefsService = {
  async getPrefs(userId: string): Promise<NotificationPreferences | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? rowToNotifPrefs(data) : null;
    } catch (err: any) {
      console.error('notificationPrefsService.getPrefs error:', err.message);
      return null;
    }
  },

  async upsertPrefs(userId: string, prefs: Partial<Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<NotificationPreferences | null> {
    const supabase = createClient();
    try {
      const payload: any = { user_id: userId };
      if (prefs.inappEnabled !== undefined) payload.inapp_enabled = prefs.inappEnabled;
      if (prefs.browserPushEnabled !== undefined) payload.browser_push_enabled = prefs.browserPushEnabled;
      if (prefs.emailEnabled !== undefined) payload.email_enabled = prefs.emailEnabled;
      if (prefs.telegramEnabled !== undefined) payload.telegram_enabled = prefs.telegramEnabled;
      if (prefs.discordEnabled !== undefined) payload.discord_enabled = prefs.discordEnabled;
      if (prefs.globalCooldownMinutes !== undefined) payload.global_cooldown_minutes = prefs.globalCooldownMinutes;
      if (prefs.globalMinScore !== undefined) payload.global_min_score = prefs.globalMinScore;
      if (prefs.globalMinPricePct !== undefined) payload.global_min_price_pct = prefs.globalMinPricePct;
      if (prefs.globalMinVolumePct !== undefined) payload.global_min_volume_pct = prefs.globalMinVolumePct;
      if (prefs.notifyCritical !== undefined) payload.notify_critical = prefs.notifyCritical;
      if (prefs.notifyImportant !== undefined) payload.notify_important = prefs.notifyImportant;
      if (prefs.notifyInfo !== undefined) payload.notify_info = prefs.notifyInfo;

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data ? rowToNotifPrefs(data) : null;
    } catch (err: any) {
      console.error('notificationPrefsService.upsertPrefs error:', err.message);
      return null;
    }
  },
};

// ─── Alert Dispatcher ─────────────────────────────────────────────────────────
// Checks if an alert should fire based on user's rules and prefs, then dispatches

export interface AlertTriggerPayload {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  priceChange: number;
  volumeChange: number;
  momentumScore: number;
  severity: 'INFO' | 'IMPORTANT' | 'CRITICAL';
}

export function shouldDispatchAlert(
  payload: AlertTriggerPayload,
  rule: AlertRule | null,
  prefs: NotificationPreferences | null
): { shouldFire: boolean; channels: string[] } {
  const effectivePriceThreshold = rule?.priceThreshold ?? prefs?.globalMinPricePct ?? 3.0;
  const effectiveVolumeThreshold = rule?.volumeThreshold ?? prefs?.globalMinVolumePct ?? 50.0;
  const effectiveMinScore = rule?.minMomentumScore ?? prefs?.globalMinScore ?? 70;

  // Check thresholds
  if (Math.abs(payload.priceChange) < effectivePriceThreshold) {
    return { shouldFire: false, channels: [] };
  }
  if (payload.volumeChange < effectiveVolumeThreshold) {
    return { shouldFire: false, channels: [] };
  }
  if (payload.momentumScore < effectiveMinScore) {
    return { shouldFire: false, channels: [] };
  }

  // Check severity filter
  if (prefs) {
    if (payload.severity === 'CRITICAL' && !prefs.notifyCritical) return { shouldFire: false, channels: [] };
    if (payload.severity === 'IMPORTANT' && !prefs.notifyImportant) return { shouldFire: false, channels: [] };
    if (payload.severity === 'INFO' && !prefs.notifyInfo) return { shouldFire: false, channels: [] };
  }

  // Check rule enabled
  if (rule && !rule.isEnabled) return { shouldFire: false, channels: [] };

  // Collect enabled channels
  const channels: string[] = [];
  if (prefs?.inappEnabled !== false) channels.push('inapp');
  if (prefs?.browserPushEnabled) channels.push('browser');
  if (prefs?.emailEnabled) channels.push('email');
  if (prefs?.telegramEnabled) channels.push('telegram');
  if (prefs?.discordEnabled) channels.push('discord');

  return { shouldFire: channels.length > 0, channels };
}
