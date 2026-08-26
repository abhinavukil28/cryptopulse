import React from 'react';
import { ALERTS, getTimeAgo } from '@/lib/mockData';
import SeverityBadge from '@/components/ui/SeverityBadge';

const coinAlerts = ALERTS?.filter(a => a?.coinId === 'coin-sol');

export default function CoinAlertHistory() {
  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Alerts — SOL</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{coinAlerts?.length} alerts in the last 24 hours</p>
      </div>
      {coinAlerts?.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">No alerts for SOL yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {coinAlerts?.map((alert) => (
            <div key={alert?.id} className="px-4 py-3 hover:bg-muted/20 transition-colors duration-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <SeverityBadge severity={alert?.severity} size="sm" />
                    <span className="text-xs font-semibold text-foreground">{alert?.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alert?.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs font-mono-nums text-positive font-semibold">+{alert?.priceChange?.toFixed(2)}%</span>
                    <span className="text-xs font-mono-nums text-info font-semibold">Vol +{alert?.volumeChange?.toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground">Score: <span className="text-primary font-semibold">{alert?.momentumScore}</span></span>
                  </div>
                </div>
                <span className="text-2xs text-muted-foreground whitespace-nowrap flex-shrink-0">{getTimeAgo(alert?.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}