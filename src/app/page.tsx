'use client';

import React, { useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import MarketKPICards from './components/MarketKPICards';
import MomentumLeaderboard from './components/MomentumLeaderboard';
import AlertFeed from './components/AlertFeed';
import BtcDominanceChart from './components/BtcDominanceChart';
import VolumeChart from './components/VolumeChart';
import RealTimeMovers from './components/RealTimeMovers';
import SearchModal from '@/components/ui/SearchModal';
import { useSyncMarket } from '@/hooks/useSyncMarket';
import { RefreshCw, Search } from 'lucide-react';

export default function DashboardPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'live' | 'delayed' | 'error'>('live');
  const [lastSyncLabel, setLastSyncLabel] = useState<string>('Updated just now');

  const handleSyncSuccess = useCallback(() => {
    setSyncStatus('live');
    setLastSyncLabel('Updated just now');
    setSyncing(false);
  }, []);

  const handleSyncSkipped = useCallback(() => {
    setSyncing(false);
  }, []);

  const { triggerSync } = useSyncMarket({
    autoSync: true,
    onSuccess: handleSyncSuccess,
    onSkipped: handleSyncSkipped,
  });

  const handleRefresh = async () => {
    setSyncing(true);
    const result = await triggerSync();
    if (result?.status === 'rate_limited' || result?.status === 'fallback') {
      setSyncStatus('delayed');
      setLastSyncLabel('Using cached data');
    } else if (result?.status === 'error') {
      setSyncStatus('error');
      setLastSyncLabel('Connection error');
    } else if (result?.status === 'success') {
      setSyncStatus('live');
      setLastSyncLabel('Updated just now');
    }
    setSyncing(false);
  };

  const statusDot =
    syncStatus === 'live' ?'bg-positive'
      : syncStatus === 'delayed' ?'bg-yellow-400' :'bg-red-500';

  const statusLabel =
    syncStatus === 'live' ? 'Live' : syncStatus === 'delayed' ? 'Delayed' : 'Disconnected';

  return (
    <AppLayout>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time momentum analytics · {lastSyncLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-sm hover:text-foreground transition-all duration-150"
          >
            <Search size={14} />
          </button>
          <div className={`flex items-center gap-1.5 text-xs ${syncStatus === 'live' ? 'text-positive' : syncStatus === 'delayed' ? 'text-yellow-400' : 'text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${statusDot} ${syncStatus === 'live' ? 'live-pulse' : ''}`} />
            <span className="font-medium">{statusLabel}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground hover:bg-muted transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="mb-6">
        <MarketKPICards />
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {/* Left: Leaderboard (spans 2 cols on xl, 3 on 2xl) */}
        <div className="xl:col-span-2 2xl:col-span-3 space-y-5">
          <MomentumLeaderboard />

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BtcDominanceChart />
            <VolumeChart />
          </div>
        </div>

        {/* Right: Alert feed + movers */}
        <div className="xl:col-span-1 2xl:col-span-1 space-y-5">
          <RealTimeMovers />
          <AlertFeed />
        </div>
      </div>
    </AppLayout>
  );
}