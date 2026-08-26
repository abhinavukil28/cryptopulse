'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { marketService, type MarketSnapshot } from '@/lib/services/cryptoService';
import { BTC_DOMINANCE_HISTORY, MARKET_OVERVIEW } from '@/lib/mockData';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border px-3 py-2 shadow-xl" style={{ background: 'var(--card)' }}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono-nums text-foreground">{payload[0].value.toFixed(1)}%</p>
      <p className="text-2xs text-muted-foreground">BTC Dominance</p>
    </div>
  );
};

export default function BtcDominanceChart() {
  const [history, setHistory] = useState(BTC_DOMINANCE_HISTORY);
  const [btcDominance, setBtcDominance] = useState(MARKET_OVERVIEW.btcDominance);
  const [btcDominanceChange, setBtcDominanceChange] = useState(MARKET_OVERVIEW.btcDominanceChange);

  useEffect(() => {
    marketService.getLatestSnapshot().then((snapshot: MarketSnapshot | null) => {
      if (snapshot) {
        if (snapshot.btcDominanceHistory?.length > 0) setHistory(snapshot.btcDominanceHistory);
        setBtcDominance(snapshot.btcDominance);
        setBtcDominanceChange(snapshot.btcDominanceChange);
      }
    });
  }, []);

  return (
    <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">BTC Dominance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">12-hour trend</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-mono-nums text-foreground">{btcDominance.toFixed(1)}%</p>
          <p className={`text-xs font-mono-nums ${btcDominanceChange >= 0 ? 'text-positive' : 'text-negative'}`}>
            {btcDominanceChange >= 0 ? '+' : ''}{btcDominanceChange.toFixed(1)}% today
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="btcDomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--warning)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--warning)"
            strokeWidth={2}
            fill="url(#btcDomGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}