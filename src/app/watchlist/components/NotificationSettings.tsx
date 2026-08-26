'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Channel {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  badge?: string;
}

export default function NotificationSettings() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'ch-inapp',
      label: 'In-App Notifications',
      description: 'Alerts appear in the notification bell in the top bar.',
      icon: <Bell size={16} />,
      enabled: true,
    },
    {
      id: 'ch-browser',
      label: 'Browser Push',
      description: 'Desktop push notifications even when the tab is in the background.',
      icon: <Globe size={16} />,
      enabled: true,
      badge: 'Active',
    },
    {
      id: 'ch-email',
      label: 'Email Digest',
      description: 'Hourly digest of critical alerts sent to your registered email.',
      icon: <Mail size={16} />,
      enabled: false,
      badge: 'Pro',
    },
    {
      id: 'ch-telegram',
      label: 'Telegram Bot',
      description: 'Instant alerts via Telegram — configure your bot token in settings.',
      icon: <MessageSquare size={16} />,
      enabled: false,
      badge: 'Pro',
    },
    {
      id: 'ch-discord',
      label: 'Discord Webhook',
      description: 'Post alerts to a Discord channel via webhook URL.',
      icon: <MessageSquare size={16} />,
      enabled: false,
      badge: 'Pro',
    },
  ]);

  const [cooldown, setCooldown] = useState(30);
  const [minScore, setMinScore] = useState(75);
  const [minPricePct, setMinPricePct] = useState(3);
  const [saving, setSaving] = useState(false);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const saveSettings = async () => {
    setSaving(true);
    // Backend integration point: PATCH /api/users/notification-settings
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Notification settings saved');
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Notification Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure how and when you receive alerts</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Channels */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Notification Channels
          </p>
          <div className="space-y-2">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border/80 transition-all duration-150"
                style={{ background: 'var(--background)' }}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${ch.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
                    {ch.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{ch.label}</p>
                      {ch.badge && (
                        <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${
                          ch.badge === 'Active' ?'bg-positive/10 text-positive' :'bg-warning/10 text-warning'
                        }`}>
                          {ch.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleChannel(ch.id)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
                    ch.enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                  role="switch"
                  aria-checked={ch.enabled}
                  aria-label={`Toggle ${ch.label}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                      ch.enabled ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global thresholds */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Global Alert Thresholds
          </p>
          <div className="space-y-4 p-4 rounded-lg border border-border" style={{ background: 'var(--background)' }}>
            {/* Min score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Minimum Momentum Score
                </label>
                <span className="text-xs font-mono-nums font-bold text-primary">{minScore}</span>
              </div>
              <p className="text-2xs text-muted-foreground mb-2">
                Only fire alerts for coins scoring above this threshold.
              </p>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-2xs text-muted-foreground mt-0.5">
                <span>10</span>
                <span>55</span>
                <span>100</span>
              </div>
            </div>

            {/* Min price pct */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Minimum Price Movement
                </label>
                <span className="text-xs font-mono-nums font-bold text-primary">{minPricePct}%</span>
              </div>
              <p className="text-2xs text-muted-foreground mb-2">
                Suppress alerts for price moves below this percentage.
              </p>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={minPricePct}
                onChange={e => setMinPricePct(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-2xs text-muted-foreground mt-0.5">
                <span>0.5%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Cooldown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Alert Cooldown Period
                </label>
                <span className="text-xs font-mono-nums font-bold text-primary">{cooldown} min</span>
              </div>
              <p className="text-2xs text-muted-foreground mb-2">
                Prevent the same coin from triggering duplicate alerts within this window.
              </p>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={cooldown}
                onChange={e => setCooldown(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-2xs text-muted-foreground mt-0.5">
                <span>5 min</span>
                <span>60 min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save size={14} />
              Save Notification Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}