'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { marketService, type MarketSnapshot } from '@/lib/services/cryptoService';
import { VOLUME_HISTORY, MARKET_OVERVIEW, formatLargeNumber } from '@/lib/mockData';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border px-3 py-2 shadow-xl" style={{ background: 'var(--card)' }}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono-nums text-foreground">${payload[0].value}B</p>
      <p className="text-2xs text-muted-foreground">Total Volume</p>
    </div>
  );
};

export default function VolumeChart() {
  const [history, setHistory] = useState(VOLUME_HISTORY);
  const [totalVolume, setTotalVolume] = useState(MARKET_OVERVIEW.totalVolume24h);
  const [volumeChange, setVolumeChange] = useState(MARKET_OVERVIEW.volumeChange24h);

  useEffect(() => {
    marketService.getLatestSnapshot().then((snapshot: MarketSnapshot | null) => {
      if (snapshot) {
        if (snapshot.volumeHistory?.length > 0) setHistory(snapshot.volumeHistory);
        setTotalVolume(snapshot.totalVolume24h);
        setVolumeChange(snapshot.volumeChange24h);
      }
    });
  }, []);

  const max = Math.max(...history.map(d => d.volume));

  return (
    <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Market Volume</h3>
          <p className="text-xs text-muted-foreground mt-0.5">12-hour breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-mono-nums text-foreground">{formatLargeNumber(totalVolume)}</p>
          <p className={`text-xs font-mono-nums ${volumeChange >= 0 ? 'text-positive' : 'text-negative'}`}>
            {volumeChange >= 0 ? '+' : ''}{volumeChange.toFixed(1)}% vs avg
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}B`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
            {history.map((entry, index) => (
              <Cell
                key={`vol-cell-${index}`}
                fill={entry.volume === max ? 'var(--primary)' : 'var(--muted-foreground)'}
                fillOpacity={entry.volume === max ? 0.9 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}