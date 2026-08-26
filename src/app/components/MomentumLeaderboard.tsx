'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Star, StarOff, ChevronUp, ChevronDown, ExternalLink, Filter } from 'lucide-react';
import { marketService, type MarketSnapshot } from '@/lib/services/cryptoService';
import { COINS, formatPrice, formatLargeNumber } from '@/lib/mockData';
import type { CryptoCoin } from '@/lib/mockData';
import MomentumScoreBadge from '@/components/ui/MomentumScoreBadge';
import ChangeCell from '@/components/ui/ChangeCell';
import CoinSparkline from '@/components/ui/CoinSparkline';

type SortKey = 'rank' | 'momentumScore' | 'change1h' | 'change24h' | 'volume24h' | 'volumeChange' | 'marketCap';
type SortDir = 'asc' | 'desc';

const CATEGORY_FILTERS = ['All', 'Layer 1', 'Layer 2', 'DeFi', 'Meme', 'Oracle', 'Layer 0', 'Store of Value'];

export default function MomentumLeaderboard() {
  const [coins, setCoins] = useState<CryptoCoin[]>(COINS);
  const [sortKey, setSortKey] = useState<SortKey>('momentumScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [watchlisted, setWatchlisted] = useState<Record<string, boolean>>(
    Object.fromEntries(COINS.map(c => [c.id, c.isWatchlisted]))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketService.getLatestSnapshot().then((snapshot: MarketSnapshot | null) => {
      if (snapshot?.coinsData && snapshot.coinsData.length > 0) {
        setCoins(snapshot.coinsData);
        setWatchlisted(Object.fromEntries(snapshot.coinsData.map((c: CryptoCoin) => [c.id, c.isWatchlisted])));
      }
      setLoading(false);
    });
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = coins
    .filter(c => categoryFilter === 'All' || c.category === categoryFilter)
    .sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={11} className="text-muted-foreground opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-primary" />
      : <ChevronDown size={11} className="text-primary" />;
  };

  const ColHeader = ({ label, k, className = '' }: { label: string; k: SortKey; className?: string }) => (
    <th
      className={`text-left py-2 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap ${className}`}
      onClick={() => handleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon k={k} />
      </span>
    </th>
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Momentum Leaderboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ranked by composite performance score</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-muted-foreground" />
          <div className="flex items-center gap-1 overflow-x-auto">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={`cat-${cat}`}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-150 ${
                  categoryFilter === cat
                    ? 'bg-primary/15 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border" style={{ background: 'var(--background)' }}>
                <th className="w-8 py-2 px-3" />
                <ColHeader label="Rank" k="rank" />
                <th className="text-left py-2 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Coin
                </th>
                <th className="text-right py-2 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Price
                </th>
                <ColHeader label="1H %" k="change1h" className="text-right" />
                <ColHeader label="24H %" k="change24h" className="text-right" />
                <ColHeader label="Volume 24H" k="volume24h" className="text-right" />
                <ColHeader label="Vol Chg" k="volumeChange" className="text-right" />
                <ColHeader label="Mkt Cap" k="marketCap" className="text-right" />
                <th className="text-left py-2 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  7D Trend
                </th>
                <ColHeader label="Score" k="momentumScore" className="text-center" />
                <th className="py-2 px-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin) => (
                <tr
                  key={coin.id}
                  className="row-hover border-b border-border/50 group"
                >
                  {/* Watchlist */}
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => setWatchlisted(w => ({ ...w, [coin.id]: !w[coin.id] }))}
                      className="text-muted-foreground hover:text-warning transition-colors duration-150"
                      title={watchlisted[coin.id] ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {watchlisted[coin.id]
                        ? <Star size={13} className="text-warning fill-warning" />
                        : <StarOff size={13} />}
                    </button>
                  </td>

                  {/* Rank */}
                  <td className="py-2.5 px-3">
                    <span className="text-xs font-mono-nums text-muted-foreground font-semibold">
                      #{coin.rank}
                    </span>
                  </td>

                  {/* Coin */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: coin.logoColor + '22', color: coin.logoColor }}
                      >
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{coin.name}</p>
                        <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-sm font-mono-nums font-semibold text-foreground">
                      ${formatPrice(coin.price)}
                    </span>
                  </td>

                  {/* 1H % */}
                  <td className="py-2.5 px-3 text-right">
                    <ChangeCell value={coin.change1h} showIcon />
                  </td>

                  {/* 24H % */}
                  <td className="py-2.5 px-3 text-right">
                    <ChangeCell value={coin.change24h} showIcon />
                  </td>

                  {/* Volume */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-xs font-mono-nums text-foreground">{formatLargeNumber(coin.volume24h)}</span>
                  </td>

                  {/* Vol Change */}
                  <td className="py-2.5 px-3 text-right">
                    <ChangeCell value={coin.volumeChange} />
                  </td>

                  {/* Market Cap */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-xs font-mono-nums text-foreground">{formatLargeNumber(coin.marketCap)}</span>
                  </td>

                  {/* Sparkline */}
                  <td className="py-2.5 px-3">
                    <div className="w-16">
                      <CoinSparkline data={coin.sparkline7d} positive={coin.change24h >= 0} />
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-2.5 px-3 text-center">
                    <MomentumScoreBadge score={coin.momentumScore} />
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3">
                    <Link
                      href="/cryptocurrency-detail"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground inline-flex"
                      title="View analytics"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border" style={{ background: 'var(--background)' }}>
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {coins.length} tracked coins
        </p>
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-150">
          View all coins →
        </button>
      </div>
    </div>
  );
}