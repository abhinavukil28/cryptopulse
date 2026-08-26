'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, TrendingUp, Flame, Rocket } from 'lucide-react';
import { marketService, type MarketSnapshot } from '@/lib/services/cryptoService';
import { COINS, formatPrice } from '@/lib/mockData';
import type { CryptoCoin } from '@/lib/mockData';
import MomentumScoreBadge from '@/components/ui/MomentumScoreBadge';

type MoverType = 'momentum' | 'gainers' | 'volume' | 'breakout';

const MOVER_CONFIGS = {
  momentum: { label: '🏆 Momentum', key: 'momentumScore' as const, icon: <Flame size={13} /> },
  gainers: { label: '🚀 Top Gainers', key: 'change1h' as const, icon: <Rocket size={13} /> },
  volume: { label: '📈 Volume', key: 'volumeChange' as const, icon: <TrendingUp size={13} /> },
  breakout: { label: '💥 Breakout', key: 'breakoutStrength' as const, icon: <Zap size={13} /> },
};

export default function RealTimeMovers() {
  const [active, setActive] = useState<MoverType>('momentum');
  const [coins, setCoins] = useState<CryptoCoin[]>(COINS);

  useEffect(() => {
    marketService.getLatestSnapshot().then((snapshot: MarketSnapshot | null) => {
      if (snapshot?.coinsData && snapshot.coinsData.length > 0) {
        setCoins(snapshot.coinsData);
      }
    });
  }, []);

  const config = MOVER_CONFIGS[active];
  const sorted = [...coins]
    .sort((a, b) => (b[config.key] as number) - (a[config.key] as number))
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Real-Time Movers</h2>
          <span className="flex items-center gap-1 text-2xs text-positive">
            <span className="w-1.5 h-1.5 rounded-full bg-positive live-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
        {(Object.entries(MOVER_CONFIGS) as [MoverType, typeof MOVER_CONFIGS[MoverType]][]).map(([key, cfg]) => (
          <button
            key={`mover-tab-${key}`}
            onClick={() => setActive(key)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-150 ${
              active === key
                ? 'bg-primary/15 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Coin list */}
      <div className="divide-y divide-border/50">
        {sorted.map((coin, idx) => {
          const metricValue = coin[config.key] as number;
          const isPositive = metricValue >= 0;
          return (
            <Link
              key={coin.id}
              href="/cryptocurrency-detail"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors duration-100"
            >
              <span className="text-xs font-mono-nums text-muted-foreground w-4 flex-shrink-0">
                {idx + 1}
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: coin.logoColor + '22', color: coin.logoColor }}
              >
                {coin.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{coin.symbol}</p>
                <p className="text-xs text-muted-foreground truncate">{coin.category}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono-nums text-foreground">${formatPrice(coin.price)}</p>
                <p className={`text-xs font-mono-nums font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                  {active === 'momentum' || active === 'breakout'
                    ? <MomentumScoreBadge score={metricValue} size="sm" />
                    : `${isPositive ? '+' : ''}${metricValue.toFixed(1)}%`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}