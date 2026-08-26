'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SOL_PRICE_HISTORY } from '@/lib/mockData';

const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border px-3 py-2 shadow-2xl" style={{ background: 'var(--card)' }}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold font-mono-nums text-foreground">${payload[0].value.toFixed(2)}</p>
      <p className="text-2xs text-positive mt-0.5">+6.82% (1H)</p>
    </div>
  );
};

export default function PriceChart() {
  const [timeframe, setTimeframe] = useState('1D');

  return (
    <div className="rounded-xl border border-border p-4" style={{ background: 'var(--card)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Price Chart — SOL/USD</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Intraday price action</p>
        </div>
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={`tf-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all duration-150 ${
                timeframe === tf
                  ? 'bg-primary/15 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={SOL_PRICE_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            domain={['dataMin - 5', 'dataMax + 5']}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}