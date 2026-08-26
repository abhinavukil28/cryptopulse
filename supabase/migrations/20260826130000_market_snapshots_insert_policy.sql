-- CryptoPulse: Add INSERT policy for market_snapshots (server-side sync route)
-- Migration: 20260826130000_market_snapshots_insert_policy

-- Allow server-side API routes (using anon key) to insert new market snapshots
-- The sync route /api/sync-market uses the Supabase server client which operates
-- with the anon key. We allow public INSERT so the route can persist CoinGecko data.

DROP POLICY IF EXISTS "public_insert_market_snapshots" ON public.market_snapshots;
CREATE POLICY "public_insert_market_snapshots"
ON public.market_snapshots
FOR INSERT
TO public
WITH CHECK (true);

-- Allow deletion of old snapshots (pruning) via server-side route
DROP POLICY IF EXISTS "public_delete_market_snapshots" ON public.market_snapshots;
CREATE POLICY "public_delete_market_snapshots"
ON public.market_snapshots
FOR DELETE
TO public
USING (true);
