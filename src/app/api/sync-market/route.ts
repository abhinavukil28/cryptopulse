import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CryptoCoin } from '@/lib/mockData';

// ─── CoinGecko API Config ─────────────────────────────────────────────────────

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINS_MARKETS_URL = `${COINGECKO_BASE}/coins/markets`;
const GLOBAL_URL = `${COINGECKO_BASE}/global`;

// Top coins to track (free tier supports up to 250 per page)
const TRACKED_COIN_IDS = [
  'bitcoin', 'ethereum', 'solana', 'avalanche-2', 'chainlink',
  'matic-network', 'arbitrum', 'dogecoin', 'optimism', 'polkadot',
  'uniswap', 'cosmos', 'cardano', 'ripple', 'binancecoin',
  'tron', 'litecoin', 'near', 'aptos', 'sui',
];

// Minimum interval between syncs (ms) — prevents hammering the free API
const MIN_SYNC_INTERVAL_MS = 60_000; // 60 seconds

// ─── Logo color map (fallback for coins not in mock data) ────────────────────

const LOGO_COLORS: Record<string, string> = {
  bitcoin: '#F7931A',
  ethereum: '#627EEA',
  solana: '#9945FF',
  'avalanche-2': '#E84142',
  chainlink: '#375BD2',
  'matic-network': '#8247E5',
  arbitrum: '#28A0F0',
  dogecoin: '#C3A634',
  optimism: '#FF0420',
  polkadot: '#E6007A',
  uniswap: '#FF007A',
  cosmos: '#2E3148',
  cardano: '#0033AD',
  ripple: '#346AA9',
  binancecoin: '#F3BA2F',
  tron: '#FF0013',
  litecoin: '#BFBBBB',
  near: '#00C08B',
  aptos: '#00B4D8',
  sui: '#6FBCF0',
};

// ─── Category map ─────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, string> = {
  bitcoin: 'Store of Value',
  ethereum: 'Layer 1',
  solana: 'Layer 1',
  'avalanche-2': 'Layer 1',
  chainlink: 'Oracle',
  'matic-network': 'Layer 2',
  arbitrum: 'Layer 2',
  dogecoin: 'Meme',
  optimism: 'Layer 2',
  polkadot: 'Layer 0',
  uniswap: 'DeFi',
  cosmos: 'Layer 0',
  cardano: 'Layer 1',
  ripple: 'Payments',
  binancecoin: 'Exchange',
  tron: 'Layer 1',
  litecoin: 'Payments',
  near: 'Layer 1',
  aptos: 'Layer 1',
  sui: 'Layer 1',
};

// ─── Momentum Score Calculator ────────────────────────────────────────────────

function calculateMomentumScore(coin: {
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  total_volume?: number;
  market_cap?: number;
  price_change_percentage_24h_in_currency?: number;
}): number {
  const change1h = coin.price_change_percentage_1h_in_currency ?? 0;
  const change24h = coin.price_change_percentage_24h ?? 0;
  const volume = coin.total_volume ?? 0;
  const marketCap = coin.market_cap ?? 1;

  // Normalize volume/market cap ratio (volume acceleration proxy)
  const volumeRatio = Math.min((volume / marketCap) * 100, 100);

  // Weighted score (0-100)
  const score =
    Math.min(Math.abs(change1h) * 5, 30) * (change1h > 0 ? 1 : -0.5) +
    Math.min(Math.abs(change24h) * 2, 20) * (change24h > 0 ? 1 : -0.5) +
    Math.min(volumeRatio * 2, 20) +
    Math.min(Math.abs(change1h) * 3, 10) + // breakout proxy
    Math.min(Math.abs(change24h) * 1.5, 10) + // volatility-adjusted
    Math.min(volumeRatio, 10); // market-cap adjusted

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Transform CoinGecko coin → CryptoCoin ───────────────────────────────────

function transformCoin(raw: any, rank: number): CryptoCoin {
  const change1h = raw.price_change_percentage_1h_in_currency ?? 0;
  const change24h = raw.price_change_percentage_24h ?? 0;
  const momentumScore = calculateMomentumScore(raw);

  return {
    id: `coin-${raw.symbol?.toLowerCase()}`,
    rank,
    name: raw.name ?? raw.id,
    symbol: raw.symbol?.toUpperCase() ?? '',
    price: raw.current_price ?? 0,
    change1m: parseFloat((change1h / 60).toFixed(3)),
    change5m: parseFloat((change1h / 12).toFixed(3)),
    change15m: parseFloat((change1h / 4).toFixed(3)),
    change1h,
    change4h: parseFloat((change1h * 2.5).toFixed(2)), // estimated
    change24h,
    volume24h: raw.total_volume ?? 0,
    volumeChange: parseFloat(((raw.total_volume ?? 0) / Math.max(raw.market_cap ?? 1, 1) * 100 - 5).toFixed(1)),
    marketCap: raw.market_cap ?? 0,
    momentumScore,
    breakoutStrength: Math.max(0, Math.min(100, Math.round(momentumScore * 0.9))),
    volatility: parseFloat((Math.abs(change24h) / 4).toFixed(1)),
    high24h: raw.high_24h ?? raw.current_price ?? 0,
    low24h: raw.low_24h ?? raw.current_price ?? 0,
    category: CATEGORIES[raw.id] ?? 'Altcoin',
    isWatchlisted: false,
    logoColor: LOGO_COLORS[raw.id] ?? '#888888',
    sparkline7d: raw.sparkline_in_7d?.price
      ? raw.sparkline_in_7d.price.filter((_: number, i: number) => i % 24 === 0).slice(0, 7)
      : [],
  };
}

// ─── Build volume history from current data ───────────────────────────────────

function buildVolumeHistory(coins: CryptoCoin[]): { time: string; volume: number }[] {
  const now = new Date();
  const totalVolume = coins.reduce((sum, c) => sum + c.volume24h, 0);
  const volumeB = totalVolume / 1_000_000_000;

  // Generate 12 hourly points ending now, with slight variation
  return Array.from({ length: 12 }, (_, i) => {
    const h = new Date(now.getTime() - (11 - i) * 3_600_000);
    const variation = 0.85 + Math.random() * 0.3;
    return {
      time: `${String(h.getHours()).padStart(2, '0')}:00`,
      volume: parseFloat((volumeB * variation).toFixed(0)),
    };
  });
}

// ─── Build BTC dominance history ─────────────────────────────────────────────

function buildBtcDominanceHistory(btcDominance: number): { time: string; value: number }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const h = new Date(now.getTime() - (11 - i) * 3_600_000);
    const variation = btcDominance + (Math.random() - 0.5) * 1.5;
    return {
      time: `${String(h.getHours()).padStart(2, '0')}:00`,
      value: parseFloat(variation.toFixed(1)),
    };
  });
}

// ─── Rate-limit check ─────────────────────────────────────────────────────────

function isRateLimited(response: Response): boolean {
  return response.status === 429 || response.status === 403;
}

// ─── Main sync handler ────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const supabase = await createClient();

  // ── 1. Check last sync time to avoid hammering CoinGecko ──────────────────
  const { data: lastSnapshot } = await supabase
    .from('market_snapshots')
    .select('captured_at')
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastSnapshot?.captured_at) {
    const lastSyncMs = Date.now() - new Date(lastSnapshot.captured_at).getTime();
    if (lastSyncMs < MIN_SYNC_INTERVAL_MS) {
      return NextResponse.json({
        status: 'skipped',
        message: `Last sync was ${Math.round(lastSyncMs / 1000)}s ago. Minimum interval is ${MIN_SYNC_INTERVAL_MS / 1000}s.`,
        lastSync: lastSnapshot.captured_at,
      });
    }
  }

  // ── 2. Fetch coins/markets from CoinGecko ─────────────────────────────────
  let coinsRaw: any[] = [];
  let globalData: any = null;
  let rateLimited = false;

  try {
    const [coinsRes, globalRes] = await Promise.all([
      fetch(
        `${COINS_MARKETS_URL}?vs_currency=usd&ids=${TRACKED_COIN_IDS.join(',')}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h`,
        {
          headers: { Accept: 'application/json' },
          next: { revalidate: 0 },
        }
      ),
      fetch(GLOBAL_URL, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 0 },
      }),
    ]);

    if (isRateLimited(coinsRes) || isRateLimited(globalRes)) {
      rateLimited = true;
    } else {
      if (coinsRes.ok) coinsRaw = await coinsRes.json();
      if (globalRes.ok) {
        const globalJson = await globalRes.json();
        globalData = globalJson?.data ?? null;
      }
    }
  } catch (fetchErr: any) {
    console.error('[sync-market] CoinGecko fetch error:', fetchErr.message);
    // Network error — fall back to existing data
    return NextResponse.json({
      status: 'fallback',
      message: 'CoinGecko unreachable. Using existing Supabase data.',
      error: fetchErr.message,
    });
  }

  // ── 3. Rate-limit fallback ─────────────────────────────────────────────────
  if (rateLimited) {
    return NextResponse.json({
      status: 'rate_limited',
      message: 'CoinGecko rate limit hit. Existing Supabase data will be used.',
    });
  }

  if (!coinsRaw || coinsRaw.length === 0) {
    return NextResponse.json({
      status: 'fallback',
      message: 'No coin data returned from CoinGecko. Using existing data.',
    });
  }

  // ── 4. Transform data ──────────────────────────────────────────────────────
  const coins: CryptoCoin[] = coinsRaw
    .sort((a: any, b: any) => (b.market_cap ?? 0) - (a.market_cap ?? 0))
    .map((raw: any, i: number) => transformCoin(raw, i + 1));

  const gainersCount = coins.filter((c) => c.change24h > 0).length;
  const losersCount = coins.filter((c) => c.change24h < 0).length;

  // Extract global market data
  const totalMarketCap = globalData?.total_market_cap?.usd ?? coins.reduce((s, c) => s + c.marketCap, 0);
  const totalVolume24h = globalData?.total_volume?.usd ?? coins.reduce((s, c) => s + c.volume24h, 0);
  const btcDominance = globalData?.market_cap_percentage?.btc ?? 52.0;
  const marketCapChange24h = globalData?.market_cap_change_percentage_24h_usd ?? 0;

  const volumeHistory = buildVolumeHistory(coins);
  const btcDominanceHistory = buildBtcDominanceHistory(btcDominance);

  // ── 5. Upsert into Supabase market_snapshots ───────────────────────────────
  const { error: insertError } = await supabase.from('market_snapshots').insert({
    total_market_cap: totalMarketCap,
    market_cap_change_24h: marketCapChange24h,
    btc_dominance: btcDominance,
    btc_dominance_change: globalData?.market_cap_percentage?.btc
      ? parseFloat((btcDominance - 52.7).toFixed(2))
      : 0,
    total_volume_24h: totalVolume24h,
    volume_change_24h: parseFloat((((totalVolume24h / Math.max(totalMarketCap, 1)) * 100) - 6).toFixed(2)),
    gainers_count: gainersCount,
    losers_count: losersCount,
    fear_greed_index: Math.min(100, Math.max(0, Math.round(50 + marketCapChange24h * 5))),
    fear_greed_label: marketCapChange24h > 5 ? 'Extreme Greed' : marketCapChange24h > 2 ? 'Greed' : marketCapChange24h > 0 ? 'Neutral' : marketCapChange24h > -2 ? 'Fear' : 'Extreme Fear',
    active_coins: globalData?.active_cryptocurrencies ?? coins.length,
    coins_data: coins,
    btc_dominance_history: btcDominanceHistory,
    volume_history: volumeHistory,
    captured_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('[sync-market] Supabase insert error:', insertError.message);
    return NextResponse.json(
      { status: 'error', message: 'Failed to persist market data.', error: insertError.message },
      { status: 500 }
    );
  }

  // ── 6. Prune old snapshots (keep last 100) ─────────────────────────────────
  const { data: oldSnapshots } = await supabase
    .from('market_snapshots')
    .select('id, captured_at')
    .order('captured_at', { ascending: false })
    .range(100, 9999);

  if (oldSnapshots && oldSnapshots.length > 0) {
    const idsToDelete = oldSnapshots.map((s: any) => s.id);
    await supabase.from('market_snapshots').delete().in('id', idsToDelete);
  }

  return NextResponse.json({
    status: 'success',
    message: `Synced ${coins.length} coins from CoinGecko.`,
    coinsCount: coins.length,
    gainers: gainersCount,
    losers: losersCount,
    btcDominance,
    totalMarketCapB: (totalMarketCap / 1e12).toFixed(2),
    syncedAt: new Date().toISOString(),
  });
}
