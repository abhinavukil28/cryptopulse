'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Save, Settings2, Mail, Globe, MessageSquare, ChevronDown, ChevronUp, Sliders, Zap, Clock, TrendingUp, BarChart2, Activity, Info } from 'lucide-react';
import { alertRulesService, notificationPrefsService, type AlertRule, type NotificationPreferences } from '@/lib/services/alertRulesService';
import { watchlistService } from '@/lib/services/cryptoService';
import { COINS } from '@/lib/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoinOption {
  id: string;
  name: string;
  symbol: string;
  logoColor: string;
}

interface RuleFormState {
  priceThreshold: number;
  volumeThreshold: number;
  minMomentumScore: number;
  weightPrice: number;
  weightVolume: number;
  weightMomentum: number;
  cooldownMinutes: number;
  isEnabled: boolean;
}

const DEFAULT_RULE: RuleFormState = {
  priceThreshold: 3.0,
  volumeThreshold: 50.0,
  minMomentumScore: 70,
  weightPrice: 40,
  weightVolume: 30,
  weightMomentum: 30,
  cooldownMinutes: 30,
  isEnabled: true,
};

const DEFAULT_PREFS: Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  inappEnabled: true,
  browserPushEnabled: true,
  emailEnabled: false,
  telegramEnabled: false,
  discordEnabled: false,
  globalCooldownMinutes: 30,
  globalMinScore: 75,
  globalMinPricePct: 3.0,
  globalMinVolumePct: 50.0,
  notifyCritical: true,
  notifyImportant: true,
  notifyInfo: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderField({
  label, description, value, min, max, step, unit, onChange,
}: {
  label: string; description: string; value: number; min: number; max: number;
  step: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        <span className="text-xs font-mono-nums font-bold text-primary">
          {value}{unit}
        </span>
      </div>
      <p className="text-2xs text-muted-foreground mb-2">{description}</p>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-2xs text-muted-foreground mt-0.5">
        <span>{min}{unit}</span>
        <span>{Math.round((min + max) / 2)}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function WeightBar({ price, volume, momentum }: { price: number; volume: number; momentum: number }) {
  const total = price + volume + momentum || 100;
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      <div className="rounded-l-full bg-primary transition-all duration-300" style={{ width: `${(price / total) * 100}%` }} />
      <div className="bg-info transition-all duration-300" style={{ width: `${(volume / total) * 100}%` }} />
      <div className="rounded-r-full bg-positive transition-all duration-300" style={{ width: `${(momentum / total) * 100}%` }} />
    </div>
  );
}

function ChannelToggle({
  icon, label, description, badge, enabled, onToggle,
}: {
  icon: React.ReactNode; label: string; description: string;
  badge?: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border/80 transition-all duration-150"
      style={{ background: 'var(--background)' }}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {badge && (
              <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${
                badge === 'Active' ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning'
              }`}>{badge}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-muted'}`}
        role="switch" aria-checked={enabled} aria-label={`Toggle ${label}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${enabled ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AlertRulesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [rules, setRules] = useState<AlertRule[]>([]);
  const [prefs, setPrefs] = useState<typeof DEFAULT_PREFS>(DEFAULT_PREFS);
  const [coinOptions, setCoinOptions] = useState<CoinOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<{ coinId: string; form: RuleFormState } | null>(null);
  const [addingCoin, setAddingCoin] = useState(false);
  const [selectedNewCoin, setSelectedNewCoin] = useState<CoinOption | null>(null);
  const [newRuleForm, setNewRuleForm] = useState<RuleFormState>({ ...DEFAULT_RULE });
  const [savingRule, setSavingRule] = useState<string | null>(null);
  const [deletingRule, setDeletingRule] = useState<string | null>(null);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'channels' | 'global'>('rules');

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router?.replace('/login?next=/alert-rules');
    }
  }, [user, authLoading, router]);

  // Load data
  useEffect(() => {
    if (!user) return;
    Promise.all([
      alertRulesService.getRules(user.id),
      notificationPrefsService.getPrefs(user.id),
      watchlistService.getItems(user.id),
    ]).then(([fetchedRules, fetchedPrefs, watchlistItems]) => {
      setRules(fetchedRules);
      if (fetchedPrefs) {
        setPrefs({
          inappEnabled: fetchedPrefs.inappEnabled,
          browserPushEnabled: fetchedPrefs.browserPushEnabled,
          emailEnabled: fetchedPrefs.emailEnabled,
          telegramEnabled: fetchedPrefs.telegramEnabled,
          discordEnabled: fetchedPrefs.discordEnabled,
          globalCooldownMinutes: fetchedPrefs.globalCooldownMinutes,
          globalMinScore: fetchedPrefs.globalMinScore,
          globalMinPricePct: fetchedPrefs.globalMinPricePct,
          globalMinVolumePct: fetchedPrefs.globalMinVolumePct,
          notifyCritical: fetchedPrefs.notifyCritical,
          notifyImportant: fetchedPrefs.notifyImportant,
          notifyInfo: fetchedPrefs.notifyInfo,
        });
      }
      // Build coin options from watchlist + fallback to mock
      const watchlistCoins: CoinOption[] = watchlistItems.map(w => ({
        id: w.coinId, name: w.coinName, symbol: w.coinSymbol, logoColor: w.logoColor,
      }));
      const mockCoins: CoinOption[] = COINS.map(c => ({
        id: c.id, name: c.name, symbol: c.symbol, logoColor: c.logoColor,
      }));
      const merged = [...watchlistCoins];
      mockCoins.forEach(mc => {
        if (!merged.find(m => m.id === mc.id)) merged.push(mc);
      });
      setCoinOptions(merged);
      setLoading(false);
    });
  }, [user]);

  const savePrefs = async () => {
    if (!user) return;
    setSavingPrefs(true);
    await notificationPrefsService.upsertPrefs(user.id, prefs);
    setSavingPrefs(false);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  };

  const saveRule = async (coinId: string, form: RuleFormState, coin: CoinOption) => {
    if (!user) return;
    setSavingRule(coinId);
    const saved = await alertRulesService.upsertRule(user.id, {
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol,
      logoColor: coin.logoColor,
      ...form,
    });
    if (saved) {
      setRules(prev => {
        const idx = prev.findIndex(r => r.coinId === coinId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
    }
    setSavingRule(null);
    setEditingRule(null);
    setAddingCoin(false);
    setSelectedNewCoin(null);
    setNewRuleForm({ ...DEFAULT_RULE });
  };

  const deleteRule = async (coinId: string) => {
    if (!user) return;
    setDeletingRule(coinId);
    await alertRulesService.deleteRule(user.id, coinId);
    setRules(prev => prev.filter(r => r.coinId !== coinId));
    setDeletingRule(null);
  };

  const toggleRule = async (coinId: string, enabled: boolean) => {
    if (!user) return;
    setRules(prev => prev.map(r => r.coinId === coinId ? { ...r, isEnabled: enabled } : r));
    await alertRulesService.toggleRule(user.id, coinId, enabled);
  };

  const availableCoins = coinOptions.filter(c => !rules.find(r => r.coinId === c.id));

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading alert rules…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert Rules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Customize per-coin thresholds, score weights, cooldowns, and notification channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border">
            {rules.filter(r => r.isEnabled).length} active rules
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg border border-border w-fit" style={{ background: 'var(--background)' }}>
        {([
          { id: 'rules', label: 'Per-Coin Rules', icon: <Sliders size={14} /> },
          { id: 'channels', label: 'Channels', icon: <Bell size={14} /> },
          { id: 'global', label: 'Global Defaults', icon: <Settings2 size={14} /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Per-Coin Rules Tab ── */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Add rule button */}
          {!addingCoin && (
            <button
              onClick={() => setAddingCoin(true)}
              disabled={availableCoins.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={15} />
              Add Coin Rule
            </button>
          )}

          {/* Add new rule form */}
          {addingCoin && (
            <div className="rounded-xl border border-primary/30 overflow-hidden" style={{ background: 'var(--card)' }}>
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus size={15} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">New Coin Rule</h3>
                </div>
                <button
                  onClick={() => { setAddingCoin(false); setSelectedNewCoin(null); setNewRuleForm({ ...DEFAULT_RULE }); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Coin selector */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Select Coin</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableCoins.slice(0, 12).map(coin => (
                      <button
                        key={coin.id}
                        onClick={() => setSelectedNewCoin(coin)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                          selectedNewCoin?.id === coin.id
                            ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/40 text-foreground'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold flex-shrink-0"
                          style={{ background: coin.logoColor + '22', color: coin.logoColor }}
                        >
                          {coin.symbol.slice(0, 2)}
                        </span>
                        <span className="truncate">{coin.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedNewCoin && (
                  <RuleEditor
                    form={newRuleForm}
                    onChange={setNewRuleForm}
                    onSave={() => saveRule(selectedNewCoin.id, newRuleForm, selectedNewCoin)}
                    onCancel={() => { setAddingCoin(false); setSelectedNewCoin(null); setNewRuleForm({ ...DEFAULT_RULE }); }}
                    saving={savingRule === selectedNewCoin.id}
                  />
                )}
              </div>
            </div>
          )}

          {/* Existing rules */}
          {rules.length === 0 && !addingCoin ? (
            <div className="rounded-xl border border-border flex flex-col items-center justify-center py-16 px-4" style={{ background: 'var(--card)' }}>
              <Bell size={36} className="text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground">No coin rules yet</p>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                Add per-coin rules to override global defaults with custom thresholds, score weights, and cooldowns.
              </p>
              <button
                onClick={() => setAddingCoin(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg btn-primary text-sm mt-4"
              >
                <Plus size={14} />
                Add your first rule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => {
                const isExpanded = expandedRuleId === rule.id;
                const isEditing = editingRule?.coinId === rule.coinId;
                return (
                  <div
                    key={rule.id}
                    className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                      rule.isEnabled ? 'border-border' : 'border-border/50 opacity-70'
                    }`}
                    style={{ background: 'var(--card)' }}
                  >
                    {/* Rule header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: rule.logoColor + '22', color: rule.logoColor }}
                      >
                        {rule.coinSymbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{rule.coinName}</p>
                          <span className="text-2xs text-muted-foreground">{rule.coinSymbol}</span>
                          {rule.isEnabled ? (
                            <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-full bg-positive/10 text-positive">Active</span>
                          ) : (
                            <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Paused</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-2xs text-muted-foreground">
                            Price ≥ <span className="text-foreground font-medium">{rule.priceThreshold}%</span>
                          </span>
                          <span className="text-2xs text-muted-foreground">
                            Vol ≥ <span className="text-foreground font-medium">{rule.volumeThreshold}%</span>
                          </span>
                          <span className="text-2xs text-muted-foreground">
                            Score ≥ <span className="text-foreground font-medium">{rule.minMomentumScore}</span>
                          </span>
                          <span className="text-2xs text-muted-foreground">
                            Cooldown <span className="text-foreground font-medium">{rule.cooldownMinutes}m</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => toggleRule(rule.coinId, !rule.isEnabled)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                          title={rule.isEnabled ? 'Pause rule' : 'Enable rule'}
                        >
                          {rule.isEnabled ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            if (isEditing) { setEditingRule(null); } else {
                              setEditingRule({
                                coinId: rule.coinId,
                                form: {
                                  priceThreshold: rule.priceThreshold,
                                  volumeThreshold: rule.volumeThreshold,
                                  minMomentumScore: rule.minMomentumScore,
                                  weightPrice: rule.weightPrice,
                                  weightVolume: rule.weightVolume,
                                  weightMomentum: rule.weightMomentum,
                                  cooldownMinutes: rule.cooldownMinutes,
                                  isEnabled: rule.isEnabled,
                                },
                              });
                              setExpandedRuleId(rule.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
                          title="Edit rule"
                        >
                          <Settings2 size={15} />
                        </button>
                        <button
                          onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button
                          onClick={() => deleteRule(rule.coinId)}
                          disabled={deletingRule === rule.coinId}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-negative hover:bg-negative/10 transition-all duration-150 disabled:opacity-50"
                          title="Delete rule"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: weight bar */}
                    {isExpanded && !isEditing && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Score Weights</p>
                            <WeightBar price={rule.weightPrice} volume={rule.weightVolume} momentum={rule.weightMomentum} />
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                Price {rule.weightPrice}%
                              </span>
                              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-info inline-block" />
                                Volume {rule.weightVolume}%
                              </span>
                              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-positive inline-block" />
                                Momentum {rule.weightMomentum}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Thresholds</p>
                            <div className="flex items-center gap-2 text-xs">
                              <TrendingUp size={12} className="text-primary" />
                              <span className="text-muted-foreground">Price movement:</span>
                              <span className="font-semibold text-foreground">≥ {rule.priceThreshold}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <BarChart2 size={12} className="text-info" />
                              <span className="text-muted-foreground">Volume change:</span>
                              <span className="font-semibold text-foreground">≥ {rule.volumeThreshold}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Activity size={12} className="text-positive" />
                              <span className="text-muted-foreground">Min score:</span>
                              <span className="font-semibold text-foreground">{rule.minMomentumScore}/100</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Clock size={12} className="text-warning" />
                              <span className="text-muted-foreground">Cooldown:</span>
                              <span className="font-semibold text-foreground">{rule.cooldownMinutes} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit form */}
                    {isEditing && editingRule && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/50">
                        <RuleEditor
                          form={editingRule.form}
                          onChange={form => setEditingRule(prev => prev ? { ...prev, form } : null)}
                          onSave={() => {
                            const coin = coinOptions.find(c => c.id === rule.coinId);
                            if (coin && editingRule) saveRule(rule.coinId, editingRule.form, coin);
                          }}
                          onCancel={() => setEditingRule(null)}
                          saving={savingRule === rule.coinId}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Channels Tab ── */}
      {activeTab === 'channels' && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Notification Channels</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Alerts are dispatched to all enabled channels when a rule fires
              </p>
            </div>
            <div className="p-5 space-y-2">
              <ChannelToggle
                icon={<Bell size={16} />} label="In-App Notifications"
                description="Alerts appear in the notification bell in the top bar."
                badge="Active" enabled={prefs.inappEnabled}
                onToggle={() => setPrefs(p => ({ ...p, inappEnabled: !p.inappEnabled }))}
              />
              <ChannelToggle
                icon={<Globe size={16} />} label="Browser Push"
                description="Desktop push notifications even when the tab is in the background."
                enabled={prefs.browserPushEnabled}
                onToggle={() => setPrefs(p => ({ ...p, browserPushEnabled: !p.browserPushEnabled }))}
              />
              <ChannelToggle
                icon={<Mail size={16} />} label="Email Digest"
                description="Hourly digest of critical alerts sent to your registered email."
                badge="Pro" enabled={prefs.emailEnabled}
                onToggle={() => setPrefs(p => ({ ...p, emailEnabled: !p.emailEnabled }))}
              />
              <ChannelToggle
                icon={<MessageSquare size={16} />} label="Telegram Bot"
                description="Instant alerts via Telegram — configure your bot token in settings."
                badge="Pro" enabled={prefs.telegramEnabled}
                onToggle={() => setPrefs(p => ({ ...p, telegramEnabled: !p.telegramEnabled }))}
              />
              <ChannelToggle
                icon={<MessageSquare size={16} />} label="Discord Webhook"
                description="Post alerts to a Discord channel via webhook URL."
                badge="Pro" enabled={prefs.discordEnabled}
                onToggle={() => setPrefs(p => ({ ...p, discordEnabled: !p.discordEnabled }))}
              />
            </div>
          </div>

          {/* Severity filter */}
          <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Severity Filter</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Only dispatch alerts matching these severity levels</p>
            </div>
            <div className="p-5 space-y-2">
              {([
                { key: 'notifyCritical' as const, label: 'Critical', color: 'text-negative', bg: 'bg-negative/10', desc: 'Breakouts, extreme volume surges' },
                { key: 'notifyImportant' as const, label: 'Important', color: 'text-warning', bg: 'bg-warning/10', desc: 'Significant momentum shifts' },
                { key: 'notifyInfo' as const, label: 'Info', color: 'text-info', bg: 'bg-info/10', desc: 'General market updates' },
              ]).map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-border" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${item.bg} ${item.color}`}>{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${prefs[item.key] ? 'bg-primary' : 'bg-muted'}`}
                    role="switch" aria-checked={prefs[item.key]}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${prefs[item.key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <SaveButton saving={savingPrefs} saved={prefsSaved} onClick={savePrefs} />
        </div>
      )}

      {/* ── Global Defaults Tab ── */}
      {activeTab === 'global' && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Global Alert Defaults</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applied to all coins without a per-coin rule override
              </p>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-start gap-2 p-3 rounded-lg border border-info/20 bg-info/5">
                <Info size={14} className="text-info mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Per-coin rules take priority over these defaults. Use this section to set baseline thresholds for all other coins.
                </p>
              </div>

              <SliderField
                label="Minimum Momentum Score"
                description="Only fire alerts for coins scoring above this threshold."
                value={prefs.globalMinScore} min={10} max={100} step={5}
                onChange={v => setPrefs(p => ({ ...p, globalMinScore: v }))}
              />
              <SliderField
                label="Minimum Price Movement"
                description="Suppress alerts for price moves below this percentage."
                value={prefs.globalMinPricePct} min={0.5} max={20} step={0.5} unit="%"
                onChange={v => setPrefs(p => ({ ...p, globalMinPricePct: v }))}
              />
              <SliderField
                label="Minimum Volume Change"
                description="Suppress alerts when volume change is below this percentage."
                value={prefs.globalMinVolumePct} min={10} max={300} step={10} unit="%"
                onChange={v => setPrefs(p => ({ ...p, globalMinVolumePct: v }))}
              />
              <SliderField
                label="Global Cooldown Period"
                description="Prevent the same coin from triggering duplicate alerts within this window."
                value={prefs.globalCooldownMinutes} min={5} max={120} step={5} unit=" min"
                onChange={v => setPrefs(p => ({ ...p, globalCooldownMinutes: v }))}
              />
            </div>
          </div>

          <SaveButton saving={savingPrefs} saved={prefsSaved} onClick={savePrefs} />
        </div>
      )}
    </AppLayout>
  );
}

// ─── Rule Editor ──────────────────────────────────────────────────────────────

function RuleEditor({
  form, onChange, onSave, onCancel, saving,
}: {
  form: RuleFormState;
  onChange: (f: RuleFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const set = (key: keyof RuleFormState, value: number | boolean) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="space-y-5 pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Thresholds */}
        <div className="space-y-4 p-4 rounded-lg border border-border" style={{ background: 'var(--background)' }}>
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Trigger Thresholds</p>
          <SliderField
            label="Price Movement" description="Minimum price change to trigger alert."
            value={form.priceThreshold} min={0.5} max={20} step={0.5} unit="%"
            onChange={v => set('priceThreshold', v)}
          />
          <SliderField
            label="Volume Change" description="Minimum volume increase to trigger alert."
            value={form.volumeThreshold} min={10} max={300} step={10} unit="%"
            onChange={v => set('volumeThreshold', v)}
          />
          <SliderField
            label="Min Momentum Score" description="Minimum score required to fire."
            value={form.minMomentumScore} min={10} max={100} step={5}
            onChange={v => set('minMomentumScore', v)}
          />
          <SliderField
            label="Cooldown Period" description="Minimum time between alerts for this coin."
            value={form.cooldownMinutes} min={5} max={120} step={5} unit=" min"
            onChange={v => set('cooldownMinutes', v)}
          />
        </div>

        {/* Score weights */}
        <div className="space-y-4 p-4 rounded-lg border border-border" style={{ background: 'var(--background)' }}>
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Score Weights</p>
          <div className="mb-2">
            <WeightBar price={form.weightPrice} volume={form.weightVolume} momentum={form.weightMomentum} />
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />Price
              </span>
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-info inline-block" />Volume
              </span>
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-positive inline-block" />Momentum
              </span>
            </div>
          </div>
          <SliderField
            label="Price Weight" description="How much price change contributes to the score."
            value={form.weightPrice} min={0} max={100} step={5} unit="%"
            onChange={v => set('weightPrice', v)}
          />
          <SliderField
            label="Volume Weight" description="How much volume change contributes to the score."
            value={form.weightVolume} min={0} max={100} step={5} unit="%"
            onChange={v => set('weightVolume', v)}
          />
          <SliderField
            label="Momentum Weight" description="How much momentum score contributes."
            value={form.weightMomentum} min={0} max={100} step={5} unit="%"
            onChange={v => set('weightMomentum', v)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg btn-primary text-sm font-semibold disabled:opacity-60"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? 'Saving…' : 'Save Rule'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
        saved ? 'bg-positive text-white' : 'btn-primary'
      }`}
    >
      {saving ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving…
        </>
      ) : saved ? (
        <>
          <Zap size={14} />
          Saved!
        </>
      ) : (
        <>
          <Save size={14} />
          Save Settings
        </>
      )}
    </button>
  );
}
