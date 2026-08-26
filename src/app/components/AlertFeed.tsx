'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { alertService, type AlertRecord } from '@/lib/services/cryptoService';
import { ALERTS, getTimeAgo } from '@/lib/mockData';
import SeverityBadge from '@/components/ui/SeverityBadge';

function alertRecordToLegacy(a: AlertRecord) {
  return {
    id: a.id,
    coinId: a.coinId,
    coinName: a.coinName,
    coinSymbol: a.coinSymbol,
    severity: a.severity,
    type: a.alertType,
    title: a.title,
    description: a.description,
    priceChange: a.priceChange,
    volumeChange: a.volumeChange,
    momentumScore: a.momentumScore,
    rank: a.rank,
    reason: a.reason,
    timestamp: new Date(a.createdAt),
    timeframeMinutes: a.timeframeMinutes,
    isRead: a.isRead,
  };
}

export default function AlertFeed() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'CRITICAL' | 'IMPORTANT' | 'INFO'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertService.getAlerts(20).then((records) => {
      if (records.length > 0) {
        setAlerts(records.map(alertRecordToLegacy) as typeof ALERTS);
      }
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    await alertService.markAllRead();
  };

  const markRead = async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    await alertService.markRead(id);
  };

  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'CRITICAL' || filter === 'IMPORTANT' || filter === 'INFO') return a.severity === filter;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const severityEmoji = {
    CRITICAL: '⚡',
    IMPORTANT: '🔥',
    INFO: 'ℹ️',
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden flex flex-col" style={{ background: 'var(--card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Alert Feed</h2>
          {unreadCount > 0 && (
            <span className="text-2xs font-bold px-1.5 py-0.5 rounded-full bg-negative text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors duration-150"
        >
          <CheckCheck size={12} />
          Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto flex-shrink-0">
        {(['all', 'unread', 'CRITICAL', 'IMPORTANT', 'INFO'] as const).map(f => (
          <button
            key={`af-${f}`}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-150 ${
              filter === f
                ? 'bg-primary/15 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto max-h-[480px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Loading alerts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertTriangle size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">No alerts</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Alerts will appear here when coins show unusual momentum or volume activity.
            </p>
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              onClick={() => markRead(alert.id)}
              className={`px-4 py-3 border-b border-border/50 cursor-pointer transition-colors duration-100 hover:bg-muted/40 ${
                !alert.isRead ? 'bg-primary/3' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Unread dot */}
                <div className="flex-shrink-0 mt-1">
                  {!alert.isRead
                    ? <span className="w-2 h-2 rounded-full bg-primary block" />
                    : <span className="w-2 h-2 rounded-full bg-transparent block" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="text-xs font-semibold text-foreground">
                      {severityEmoji[alert.severity]} {alert.coinSymbol} — {alert.type}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">
                    {alert.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono-nums font-semibold text-positive">
                      +{alert.priceChange.toFixed(2)}% price
                    </span>
                    <span className="text-xs font-mono-nums font-semibold text-info">
                      +{alert.volumeChange.toFixed(0)}% vol
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Score: <span className="text-primary font-semibold">{alert.momentumScore}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Rank #{alert.rank}
                    </span>
                  </div>

                  {/* Reason */}
                  <div className="mt-2 p-2 rounded-md text-xs text-muted-foreground leading-relaxed" style={{ background: 'var(--background)' }}>
                    <span className="text-foreground font-medium">Why: </span>
                    {alert.reason}
                  </div>

                  <p className="text-2xs text-muted-foreground mt-1.5">{getTimeAgo(alert.timestamp)}</p>
                </div>

                <ChevronRight size={12} className="text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}