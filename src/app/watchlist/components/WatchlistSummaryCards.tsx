'use client';

import React, { useState, useEffect } from 'react';
import { watchlistService, marketService, type WatchlistItem, type MarketSnapshot } from '@/lib/services/cryptoService';
import { WATCHLIST_COINS } from '@/lib/mockData';
import type { CryptoCoin } from '@/lib/mockData';
import { TrendingUp, Bell, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SummaryData {
  avgScore: number;
  topGainerSymbol: string;
  topGainerChange: number;
  notifEnabled: number;
  total: number;
  highMomentum: number;
}

function computeSummary(items: WatchlistItem[], coinsData: CryptoCoin[]): SummaryData {
  if (items.length === 0) {
    return { avgScore: 0, topGainerSymbol: '—', topGainerChange: 0, notifEnabled: 0, total: 0, highMomentum: 0 };
  }
  const enriched = items.map(item => {
    const coin = coinsData.find(c => c.id === item.coinId);
    return {
      symbol: item.coinSymbol,
      change24h: coin?.change24h ?? 0,
      momentumScore: coin?.momentumScore ?? 0,
      notificationsEnabled: item.notificationsEnabled,
    };
  });
  const avgScore = Math.round(enriched.reduce((s, c) => s + c.momentumScore, 0) / enriched.length);
  const topGainer = [...enriched].sort((a, b) => b.change24h - a.change24h)[0];
  const notifEnabled = enriched.filter(c => c.notificationsEnabled).length;
  const highMomentum = enriched.filter(c => c.momentumScore >= 75).length;
  return {
    avgScore,
    topGainerSymbol: topGainer?.symbol ?? '—',
    topGainerChange: topGainer?.change24h ?? 0,
    notifEnabled,
    total: items.length,
    highMomentum,
  };
}

export default function WatchlistSummaryCards() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryData>(() => {
    const coins = WATCHLIST_COINS;
    const notifEnabled = coins.filter(c => c.notificationsEnabled).length;
    const avgScore = Math.round(coins.reduce((s, c) => s + c.momentumScore, 0) / coins.length);
    const topGainer = [...coins].sort((a, b) => b.change24h - a.change24h)[0];
    const alertCoins = coins.filter(c => c.momentumScore >= 75).length;
    return {
      avgScore,
      topGainerSymbol: topGainer?.symbol ?? '—',
      topGainerChange: topGainer?.change24h ?? 0,
      notifEnabled,
      total: coins.length,
      highMomentum: alertCoins,
    };
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      watchlistService.getItems(user.id),
      marketService.getLatestSnapshot(),
    ]).then(([items, snapshot]: [WatchlistItem[], MarketSnapshot | null]) => {
      if (items.length > 0) {
        setSummary(computeSummary(items, snapshot?.coinsData ?? []));
      }
    });
  }, [user]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {/* Avg score */}
      <div className="rounded-xl border border-border p-4 gradient-card card-hover">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Avg Score</p>
          <Zap size={15} className="text-primary" />
        </div>
        <p className="text-2xl font-bold font-mono-nums text-primary">{summary.avgScore}</p>
        <p className="text-xs text-muted-foreground mt-1">across {summary.total} watched coins</p>
      </div>

      {/* Top gainer */}
      <div className="rounded-xl border border-positive/20 p-4 bg-positive-subtle card-hover">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top Gainer</p>
          <TrendingUp size={15} className="text-positive" />
        </div>
        <p className="text-2xl font-bold font-mono-nums text-positive">
          {summary.topGainerSymbol}
        </p>
        <p className="text-xs text-positive font-semibold mt-1">
          +{summary.topGainerChange.toFixed(2)}% (24H)
        </p>
      </div>

      {/* Notifications active */}
      <div className="rounded-xl border border-border p-4 gradient-card card-hover">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notified</p>
          <Bell size={15} className="text-warning" />
        </div>
        <p className="text-2xl font-bold font-mono-nums text-foreground">{summary.notifEnabled}</p>
        <p className="text-xs text-muted-foreground mt-1">of {summary.total} coins active</p>
      </div>

      {/* High momentum */}
      <div className="rounded-xl border border-warning/20 p-4 bg-warning-subtle card-hover">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">High Momentum</p>
          <AlertTriangle size={15} className="text-warning" />
        </div>
        <p className="text-2xl font-bold font-mono-nums text-warning">{summary.highMomentum}</p>
        <p className="text-xs text-muted-foreground mt-1">coins score ≥ 75</p>
      </div>
    </div>
  );
}