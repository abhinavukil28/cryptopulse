'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { SOL_PRICE_HISTORY } from '@/lib/mockData';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border px-3 py-2 shadow-xl" style={{ background: 'var(--card)' }}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono-nums text-foreground">{payload[0].value.toLocaleString()} SOL</p>
    </div>
  );
};

const avgVolume = SOL_PRICE_HISTORY.reduce((s, d) => s + d.volume, 0) / SOL_PRICE_HISTORY.length;

export default function VolumeDetailChart() {
  return (
    <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Volume Analysis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Intraday volume vs historical avg</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-3 h-0.5 bg-warning inline-block" />
            Avg volume
          </span>
          <span className="text-positive font-semibold font-mono-nums">+142% above avg</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={SOL_PRICE_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            width={40}
          />
          <ReferenceLine
            y={avgVolume}
            stroke="var(--warning)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
            {SOL_PRICE_HISTORY.map((entry, index) => (
              <Cell
                key={`vol-detail-${index}`}
                fill={entry.volume > avgVolume ? 'var(--primary)' : 'var(--muted-foreground)'}
                fillOpacity={entry.volume > avgVolume ? 0.8 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}