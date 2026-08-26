import React from 'react';
import { COINS, formatPrice, formatLargeNumber } from '@/lib/mockData';


const coin = COINS.find(c => c.id === 'coin-sol')!;

export default function PerformanceStats() {
  return (
    <div className="rounded-xl border border-border p-5" style={{ background: 'var(--card)' }}>
      <h3 className="text-sm font-semibold text-foreground mb-4">Performance Stats</h3>
      <div className="space-y-3">
        {[
          { label: 'Volatility Index', value: `${coin.volatility.toFixed(1)}%`, note: 'Moderate' },
          { label: 'Breakout Strength', value: `${coin.breakoutStrength}/100`, note: 'Strong' },
          { label: 'Vol vs 7D Avg', value: '+142.3%', note: 'Abnormal' },
          { label: '24H High', value: `$${formatPrice(coin.high24h)}`, note: '' },
          { label: '24H Low', value: `$${formatPrice(coin.low24h)}`, note: '' },
          { label: 'Market Cap', value: formatLargeNumber(coin.marketCap), note: '' },
          { label: 'Vol Change', value: `+${coin.volumeChange.toFixed(1)}%`, note: 'Elevated' },
          { label: 'Category', value: coin.category, note: '' },
        ].map((row) => (
          <div key={`ps-${row.label}`} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold font-mono-nums text-foreground">{row.value}</span>
              {row.note && (
                <span className="text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{row.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}