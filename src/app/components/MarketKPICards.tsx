'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap } from 'lucide-react';
import { marketService, type MarketSnapshot } from '@/lib/services/cryptoService';
import { MARKET_OVERVIEW, formatLargeNumber, formatChange } from '@/lib/mockData';

function KPICard({
  label,
  value,
  subValue,
  change,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  icon: React.ReactNode;
  highlight?: 'positive' | 'negative' | 'warning' | 'neutral';
}) {
  const highlightColors = {
    positive: 'border-positive/20 bg-positive-subtle',
    negative: 'border-negative/20 bg-negative-subtle',
    warning: 'border-warning/20 bg-warning-subtle',
    neutral: 'border-border',
  };

  const borderColor = highlight ? highlightColors[highlight] : 'border-border';

  return (
    <div className={`rounded-xl border p-4 card-hover gradient-card ${borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-bold font-mono-nums text-foreground leading-none mb-1">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {change !== undefined && (
          <span className={`text-xs font-semibold font-mono-nums flex items-center gap-0.5 ${change >= 0 ? 'text-positive' : 'text-negative'}`}>
            {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {formatChange(change)}
          </span>
        )}
        {subValue && (
          <span className="text-xs text-muted-foreground">{subValue}</span>
        )}
      </div>
    </div>
  );
}

export default function MarketKPICards() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);

  useEffect(() => {
    marketService.getLatestSnapshot().then((data) => {
      if (data) setSnapshot(data);
    });
  }, []);

  // Use DB data if available, otherwise fall back to mock
  const m = snapshot ?? {
    totalMarketCap: MARKET_OVERVIEW.totalMarketCap,
    marketCapChange24h: MARKET_OVERVIEW.marketCapChange24h,
    btcDominance: MARKET_OVERVIEW.btcDominance,
    btcDominanceChange: MARKET_OVERVIEW.btcDominanceChange,
    totalVolume24h: MARKET_OVERVIEW.totalVolume24h,
    volumeChange24h: MARKET_OVERVIEW.volumeChange24h,
    gainersCount: MARKET_OVERVIEW.gainersCount,
    losersCount: MARKET_OVERVIEW.losersCount,
    fearGreedIndex: MARKET_OVERVIEW.fearGreedIndex,
    fearGreedLabel: MARKET_OVERVIEW.fearGreedLabel,
    activeCoins: MARKET_OVERVIEW.activeCoins,
  };

  const fearGreedColor = m.fearGreedIndex >= 75 ? 'negative' : m.fearGreedIndex >= 55 ? 'warning' : m.fearGreedIndex >= 45 ? 'neutral' : 'positive';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-3">
      {/* Hero card */}
      <div className="col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
        <KPICard
          label="Total Market Cap"
          value={formatLargeNumber(m.totalMarketCap)}
          change={m.marketCapChange24h}
          subValue="24h change"
          icon={<Activity size={16} />}
          highlight="positive"
        />
      </div>
      <KPICard
        label="BTC Dominance"
        value={`${m.btcDominance}%`}
        change={m.btcDominanceChange}
        subValue="vs yesterday"
        icon={<BarChart2 size={16} />}
        highlight="neutral"
      />
      <KPICard
        label="24H Volume"
        value={formatLargeNumber(m.totalVolume24h)}
        change={m.volumeChange24h}
        subValue="vs avg"
        icon={<TrendingUp size={16} />}
        highlight="positive"
      />
      <KPICard
        label="Gainers / Losers"
        value={`${m.gainersCount} / ${m.losersCount}`}
        subValue={`of ${m.activeCoins} tracked`}
        icon={<Zap size={16} />}
        highlight="positive"
      />
      <KPICard
        label="Fear & Greed"
        value={`${m.fearGreedIndex}`}
        subValue={m.fearGreedLabel}
        icon={<Activity size={16} />}
        highlight={fearGreedColor as 'positive' | 'negative' | 'warning' | 'neutral'}
      />
    </div>
  );
}