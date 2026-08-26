'use client';

import React from 'react';
import { SOL_SCORE_BREAKDOWN } from '@/lib/mockData';
import { Info } from 'lucide-react';

export default function MomentumBreakdown() {
  const totalScore = SOL_SCORE_BREAKDOWN.reduce((s, c) => s + c.score, 0);

  const getBarColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.85) return 'var(--primary)';
    if (pct >= 0.65) return 'var(--positive)';
    if (pct >= 0.45) return 'var(--warning)';
    return 'var(--negative)';
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Momentum Score Breakdown</h3>
          <div
            className="text-3xl font-bold font-mono-nums"
            style={{ color: 'var(--primary)' }}
          >
            {totalScore}
            <span className="text-base text-muted-foreground font-normal">/100</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Composite score across 6 weighted signals
        </p>
      </div>

      {/* Components */}
      <div className="p-5 space-y-4">
        {SOL_SCORE_BREAKDOWN.map((comp) => {
          const pct = (comp.score / comp.maxScore) * 100;
          const barColor = getBarColor(comp.score, comp.maxScore);
          return (
            <div key={comp.component}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{comp.label}</span>
                  <span className="text-2xs text-muted-foreground">({comp.weight}% weight)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-nums font-bold" style={{ color: barColor }}>
                    +{comp.score}
                  </span>
                  <span className="text-2xs text-muted-foreground">/ {comp.maxScore}</span>
                </div>
              </div>
              {/* Bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full score-bar-fill"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <p className="text-2xs text-muted-foreground">{comp.description}</p>
            </div>
          );
        })}
      </div>

      {/* Explanation card */}
      <div className="mx-5 mb-5 rounded-lg p-4 border border-primary/20" style={{ background: 'rgba(0,212,170,0.05)' }}>
        <div className="flex items-start gap-2">
          <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Why is SOL performing well?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strong price acceleration of +6.82% over the last hour is confirmed by abnormal buy-side volume at 142% above the 7-day average. The price broke above the 30-day resistance at $196.40, triggering a breakout signal. Market-cap adjusted momentum is reliable given SOL's high liquidity — this is not a low-cap noise spike.
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-2xs font-semibold text-positive bg-positive/10 px-2 py-0.5 rounded">High momentum</span>
              <span className="text-2xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">Unusual activity</span>
              <span className="text-2xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded">Potential breakout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}