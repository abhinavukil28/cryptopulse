-- CryptoPulse: market_snapshots, watchlist_items, alert_history
-- Migration: 20260826124837

-- ─────────────────────────────────────────────
-- 1. TYPES
-- ─────────────────────────────────────────────
DROP TYPE IF EXISTS public.alert_severity CASCADE;
CREATE TYPE public.alert_severity AS ENUM ('INFO', 'IMPORTANT', 'CRITICAL');

-- ─────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────

-- market_snapshots: stores the latest market overview + coin list snapshot
CREATE TABLE IF NOT EXISTS public.market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_market_cap NUMERIC NOT NULL DEFAULT 0,
    market_cap_change_24h NUMERIC NOT NULL DEFAULT 0,
    btc_dominance NUMERIC NOT NULL DEFAULT 0,
    btc_dominance_change NUMERIC NOT NULL DEFAULT 0,
    total_volume_24h NUMERIC NOT NULL DEFAULT 0,
    volume_change_24h NUMERIC NOT NULL DEFAULT 0,
    gainers_count INTEGER NOT NULL DEFAULT 0,
    losers_count INTEGER NOT NULL DEFAULT 0,
    fear_greed_index INTEGER NOT NULL DEFAULT 50,
    fear_greed_label TEXT NOT NULL DEFAULT 'Neutral',
    active_coins INTEGER NOT NULL DEFAULT 0,
    coins_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    btc_dominance_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    volume_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- watchlist_items: per-user watchlist with custom thresholds
CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_id TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    coin_symbol TEXT NOT NULL,
    logo_color TEXT NOT NULL DEFAULT '#888888',
    custom_threshold NUMERIC NOT NULL DEFAULT 3.0,
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, coin_id)
);

-- alert_history: persisted alerts (global, not per-user)
CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coin_id TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    coin_symbol TEXT NOT NULL,
    severity public.alert_severity NOT NULL DEFAULT 'INFO',
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_change NUMERIC NOT NULL DEFAULT 0,
    volume_change NUMERIC NOT NULL DEFAULT 0,
    momentum_score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,
    reason TEXT NOT NULL DEFAULT '',
    timeframe_minutes INTEGER NOT NULL DEFAULT 60,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_market_snapshots_captured_at ON public.market_snapshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_user_id ON public.watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_coin_id ON public.watchlist_items(coin_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON public.alert_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_coin_id ON public.alert_history(coin_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_severity ON public.alert_history(severity);

-- ─────────────────────────────────────────────
-- 4. ENABLE RLS
-- ─────────────────────────────────────────────
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 5. RLS POLICIES
-- ─────────────────────────────────────────────

-- market_snapshots: public read (market data is not user-specific)
DROP POLICY IF EXISTS "public_read_market_snapshots" ON public.market_snapshots;
CREATE POLICY "public_read_market_snapshots"
ON public.market_snapshots
FOR SELECT
TO public
USING (true);

-- watchlist_items: users manage their own
DROP POLICY IF EXISTS "users_manage_own_watchlist_items" ON public.watchlist_items;
CREATE POLICY "users_manage_own_watchlist_items"
ON public.watchlist_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- alert_history: public read, no user-specific write needed (server-side inserts)
DROP POLICY IF EXISTS "public_read_alert_history" ON public.alert_history;
CREATE POLICY "public_read_alert_history"
ON public.alert_history
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "authenticated_update_alert_history" ON public.alert_history;
CREATE POLICY "authenticated_update_alert_history"
ON public.alert_history
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 6. SEED DATA
-- ─────────────────────────────────────────────
DO $$
BEGIN
    -- Seed market snapshot
    INSERT INTO public.market_snapshots (
        total_market_cap, market_cap_change_24h, btc_dominance, btc_dominance_change,
        total_volume_24h, volume_change_24h, gainers_count, losers_count,
        fear_greed_index, fear_greed_label, active_coins,
        coins_data, btc_dominance_history, volume_history
    ) VALUES (
        2847392000000, 3.42, 52.7, -0.8,
        187430000000, 22.4, 1847, 623,
        72, 'Greed', 2470,
        '[
          {"id":"coin-sol","rank":1,"name":"Solana","symbol":"SOL","price":198.47,"change1m":0.18,"change5m":0.62,"change15m":1.24,"change1h":6.82,"change4h":9.14,"change24h":14.37,"volume24h":8742000000,"volumeChange":142.3,"marketCap":87430000000,"momentumScore":91,"breakoutStrength":88,"volatility":4.2,"high24h":201.33,"low24h":173.12,"category":"Layer 1","isWatchlisted":true,"logoColor":"#9945FF","sparkline7d":[138,142,139,155,161,178,198]},
          {"id":"coin-avax","rank":2,"name":"Avalanche","symbol":"AVAX","price":42.18,"change1m":0.31,"change5m":0.94,"change15m":2.11,"change1h":5.47,"change4h":7.83,"change24h":11.29,"volume24h":1284000000,"volumeChange":98.7,"marketCap":17240000000,"momentumScore":87,"breakoutStrength":79,"volatility":5.1,"high24h":43.22,"low24h":37.44,"category":"Layer 1","isWatchlisted":false,"logoColor":"#E84142","sparkline7d":[32,34,33,36,38,40,42]},
          {"id":"coin-link","rank":3,"name":"Chainlink","symbol":"LINK","price":18.94,"change1m":0.22,"change5m":0.71,"change15m":1.58,"change1h":4.93,"change4h":6.21,"change24h":9.84,"volume24h":892000000,"volumeChange":76.4,"marketCap":11180000000,"momentumScore":83,"breakoutStrength":71,"volatility":3.8,"high24h":19.41,"low24h":17.12,"category":"Oracle","isWatchlisted":true,"logoColor":"#375BD2","sparkline7d":[15,15.5,16,16.8,17.4,18.1,18.9]},
          {"id":"coin-eth","rank":4,"name":"Ethereum","symbol":"ETH","price":3284.72,"change1m":0.09,"change5m":0.28,"change15m":0.74,"change1h":2.84,"change4h":4.12,"change24h":5.67,"volume24h":22480000000,"volumeChange":34.8,"marketCap":394200000000,"momentumScore":78,"breakoutStrength":62,"volatility":2.3,"high24h":3311.00,"low24h":3108.44,"category":"Layer 1","isWatchlisted":true,"logoColor":"#627EEA","sparkline7d":[2980,3050,3010,3140,3200,3250,3285]},
          {"id":"coin-matic","rank":5,"name":"Polygon","symbol":"MATIC","price":0.8847,"change1m":0.41,"change5m":1.23,"change15m":2.87,"change1h":7.12,"change4h":10.44,"change24h":15.81,"volume24h":1124000000,"volumeChange":187.2,"marketCap":8870000000,"momentumScore":89,"breakoutStrength":84,"volatility":6.4,"high24h":0.9124,"low24h":0.7631,"category":"Layer 2","isWatchlisted":false,"logoColor":"#8247E5","sparkline7d":[0.62,0.65,0.63,0.71,0.76,0.82,0.88]},
          {"id":"coin-btc","rank":6,"name":"Bitcoin","symbol":"BTC","price":67842.33,"change1m":0.04,"change5m":0.12,"change15m":0.38,"change1h":1.24,"change4h":2.18,"change24h":3.11,"volume24h":48230000000,"volumeChange":18.3,"marketCap":1340000000000,"momentumScore":64,"breakoutStrength":44,"volatility":1.4,"high24h":68420.00,"low24h":65890.00,"category":"Store of Value","isWatchlisted":true,"logoColor":"#F7931A","sparkline7d":[63200,64100,63800,65400,66200,67100,67842]},
          {"id":"coin-arb","rank":7,"name":"Arbitrum","symbol":"ARB","price":1.2847,"change1m":0.55,"change5m":1.74,"change15m":3.42,"change1h":8.94,"change4h":12.37,"change24h":18.42,"volume24h":734000000,"volumeChange":224.8,"marketCap":4110000000,"momentumScore":93,"breakoutStrength":91,"volatility":7.8,"high24h":1.3124,"low24h":1.0841,"category":"Layer 2","isWatchlisted":false,"logoColor":"#28A0F0","sparkline7d":[0.84,0.89,0.87,0.98,1.08,1.19,1.28]},
          {"id":"coin-doge","rank":8,"name":"Dogecoin","symbol":"DOGE","price":0.1847,"change1m":0.38,"change5m":1.14,"change15m":2.73,"change1h":4.71,"change4h":6.88,"change24h":8.94,"volume24h":2847000000,"volumeChange":210.4,"marketCap":26840000000,"momentumScore":85,"breakoutStrength":74,"volatility":5.9,"high24h":0.1924,"low24h":0.1694,"category":"Meme","isWatchlisted":false,"logoColor":"#C3A634","sparkline7d":[0.142,0.148,0.145,0.158,0.167,0.175,0.185]},
          {"id":"coin-op","rank":9,"name":"Optimism","symbol":"OP","price":2.4127,"change1m":-0.12,"change5m":-0.38,"change15m":-0.84,"change1h":-1.47,"change4h":-2.34,"change24h":-4.12,"volume24h":312000000,"volumeChange":-22.4,"marketCap":2870000000,"momentumScore":31,"breakoutStrength":18,"volatility":4.2,"high24h":2.5841,"low24h":2.3847,"category":"Layer 2","isWatchlisted":false,"logoColor":"#FF0420","sparkline7d":[2.84,2.71,2.68,2.55,2.49,2.44,2.41]},
          {"id":"coin-dot","rank":10,"name":"Polkadot","symbol":"DOT","price":8.347,"change1m":0.08,"change5m":0.24,"change15m":0.61,"change1h":1.84,"change4h":2.97,"change24h":4.28,"volume24h":487000000,"volumeChange":28.7,"marketCap":10870000000,"momentumScore":58,"breakoutStrength":42,"volatility":2.8,"high24h":8.524,"low24h":7.984,"category":"Layer 0","isWatchlisted":false,"logoColor":"#E6007A","sparkline7d":[7.2,7.5,7.4,7.8,8.0,8.2,8.35]},
          {"id":"coin-uni","rank":11,"name":"Uniswap","symbol":"UNI","price":11.284,"change1m":0.19,"change5m":0.57,"change15m":1.34,"change1h":3.84,"change4h":5.42,"change24h":7.91,"volume24h":394000000,"volumeChange":54.3,"marketCap":6760000000,"momentumScore":74,"breakoutStrength":61,"volatility":3.4,"high24h":11.584,"low24h":10.424,"category":"DeFi","isWatchlisted":false,"logoColor":"#FF007A","sparkline7d":[9.4,9.8,9.7,10.2,10.7,11.0,11.3]},
          {"id":"coin-atom","rank":12,"name":"Cosmos","symbol":"ATOM","price":9.847,"change1m":-0.08,"change5m":-0.24,"change15m":-0.58,"change1h":-1.12,"change4h":-1.84,"change24h":-3.47,"volume24h":228000000,"volumeChange":-18.7,"marketCap":3840000000,"momentumScore":28,"breakoutStrength":14,"volatility":3.1,"high24h":10.284,"low24h":9.714,"category":"Layer 0","isWatchlisted":false,"logoColor":"#2E3148","sparkline7d":[11.2,10.8,10.4,10.1,9.9,9.8,9.85]}
        ]'::jsonb,
        '[{"time":"06:00","value":54.2},{"time":"07:00","value":53.8},{"time":"08:00","value":53.4},{"time":"09:00","value":54.1},{"time":"10:00","value":53.7},{"time":"11:00","value":53.1},{"time":"12:00","value":52.7},{"time":"13:00","value":52.4},{"time":"14:00","value":52.9},{"time":"15:00","value":52.5},{"time":"16:00","value":52.2},{"time":"17:00","value":52.7}]'::jsonb,
        '[{"time":"06:00","volume":142},{"time":"07:00","volume":158},{"time":"08:00","volume":134},{"time":"09:00","volume":171},{"time":"10:00","volume":163},{"time":"11:00","volume":189},{"time":"12:00","volume":187},{"time":"13:00","volume":201},{"time":"14:00","volume":176},{"time":"15:00","volume":194},{"time":"16:00","volume":211},{"time":"17:00","volume":187}]'::jsonb
    )
    ON CONFLICT DO NOTHING;

    -- Seed alert history
    INSERT INTO public.alert_history (coin_id, coin_name, coin_symbol, severity, alert_type, title, description, price_change, volume_change, momentum_score, rank, reason, timeframe_minutes, is_read, created_at)
    VALUES
        ('coin-arb','Arbitrum','ARB','CRITICAL','Breakout Alert','ARB Breakout Detected','ARB broke above its 30-day resistance at $1.21 with 224% volume surge.',8.94,224.8,93,7,'Price acceleration coinciding with 3.2x normal volume. Breakout above 30-day resistance confirmed.',60,false, now() - interval '3 minutes'),
        ('coin-matic','Polygon','MATIC','CRITICAL','Volume Surge','MATIC Abnormal Volume','MATIC volume is 187% above its 7-day average with accelerating price.',7.12,187.2,89,5,'Volume spike to 3.87x historical average while price accelerated. Unusual buy-side pressure detected.',60,false, now() - interval '8 minutes'),
        ('coin-sol','Solana','SOL','CRITICAL','Momentum Surge','SOL Momentum Alert','SOL is up 6.8% in the last hour with 142% above-average volume.',6.82,142.3,91,1,'Strong price acceleration + abnormal volume. Momentum score reached 91/100 — top 2% of tracked coins.',60,false, now() - interval '14 minutes'),
        ('coin-doge','Dogecoin','DOGE','IMPORTANT','Momentum Surge','DOGE Momentum Surge','DOGE gained 4.7% in 15 minutes. Volume increased 210%.',4.71,210.4,85,8,'Price acceleration occurring together with significantly elevated trading volume. Social signal correlation detected.',15,true, now() - interval '22 minutes'),
        ('coin-avax','Avalanche','AVAX','IMPORTANT','Top Performer','AVAX Entered Top 3','AVAX climbed to #2 momentum rank, up from #9 in the last 4 hours.',5.47,98.7,87,2,'Rapid rank improvement from #9 to #2 over 4 hours. Sustained price momentum with consistent volume.',240,true, now() - interval '31 minutes'),
        ('coin-link','Chainlink','LINK','IMPORTANT','Volume Alert','LINK Volume Spike','LINK trading volume is 76% above 7-day average with positive price action.',4.93,76.4,83,3,'Volume elevated above 1.76x average with sustained upward price movement. Oracle sector rotation detected.',60,true, now() - interval '47 minutes'),
        ('coin-uni','Uniswap','UNI','INFO','Momentum Alert','UNI Momentum Building','UNI entered top 20 performers with improving momentum score.',3.84,54.3,74,11,'Gradual momentum build with above-average volume. DeFi sector showing broad strength.',60,true, now() - interval '68 minutes'),
        ('coin-eth','Ethereum','ETH','INFO','Top 10 Entry','ETH Volume Pickup','ETH volume increased 34.8% with consistent price appreciation.',2.84,34.8,78,4,'Institutional-grade volume pickup with steady price trend. Possible rotation from BTC detected.',60,true, now() - interval '84 minutes')
    ON CONFLICT DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
