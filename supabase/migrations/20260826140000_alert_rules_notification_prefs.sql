-- CryptoPulse: alert_rules and notification_preferences tables
-- Migration: 20260826140000

-- ─────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────

-- alert_rules: per-coin alert rule overrides per user
CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_id TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    coin_symbol TEXT NOT NULL,
    logo_color TEXT NOT NULL DEFAULT '#888888',
    -- Thresholds
    price_threshold NUMERIC NOT NULL DEFAULT 3.0,
    volume_threshold NUMERIC NOT NULL DEFAULT 50.0,
    min_momentum_score INTEGER NOT NULL DEFAULT 70,
    -- Score weights (0-100, sum should be ~100)
    weight_price NUMERIC NOT NULL DEFAULT 40.0,
    weight_volume NUMERIC NOT NULL DEFAULT 30.0,
    weight_momentum NUMERIC NOT NULL DEFAULT 30.0,
    -- Cooldown in minutes
    cooldown_minutes INTEGER NOT NULL DEFAULT 30,
    -- Rule enabled
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, coin_id)
);

-- notification_preferences: global notification channel settings per user
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    -- Channels
    inapp_enabled BOOLEAN NOT NULL DEFAULT true,
    browser_push_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    telegram_enabled BOOLEAN NOT NULL DEFAULT false,
    discord_enabled BOOLEAN NOT NULL DEFAULT false,
    -- Global thresholds
    global_cooldown_minutes INTEGER NOT NULL DEFAULT 30,
    global_min_score INTEGER NOT NULL DEFAULT 75,
    global_min_price_pct NUMERIC NOT NULL DEFAULT 3.0,
    global_min_volume_pct NUMERIC NOT NULL DEFAULT 50.0,
    -- Severity filter
    notify_critical BOOLEAN NOT NULL DEFAULT true,
    notify_important BOOLEAN NOT NULL DEFAULT true,
    notify_info BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 2. INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON public.alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_coin_id ON public.alert_rules(coin_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ─────────────────────────────────────────────
-- 3. FUNCTIONS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- 4. ENABLE RLS
-- ─────────────────────────────────────────────
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 5. RLS POLICIES
-- ─────────────────────────────────────────────

-- alert_rules: users manage their own
DROP POLICY IF EXISTS "users_manage_own_alert_rules" ON public.alert_rules;
CREATE POLICY "users_manage_own_alert_rules"
ON public.alert_rules
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- notification_preferences: users manage their own
DROP POLICY IF EXISTS "users_manage_own_notification_preferences" ON public.notification_preferences;
CREATE POLICY "users_manage_own_notification_preferences"
ON public.notification_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 6. TRIGGERS
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON public.alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
    BEFORE UPDATE ON public.alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
