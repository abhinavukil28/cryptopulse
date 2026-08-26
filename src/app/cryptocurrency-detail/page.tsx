import React from 'react';
import AppLayout from '@/components/AppLayout';
import CoinHeader from './components/CoinHeader';
import PriceChart from './components/PriceChart';
import VolumeDetailChart from './components/VolumeDetailChart';
import MomentumBreakdown from './components/MomentumBreakdown';
import CoinAlertHistory from './components/CoinAlertHistory';
import PerformanceStats from './components/PerformanceStats';

export default function CryptocurrencyDetailPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-1">
          Dashboard / Coin Analytics
        </p>
        <h1 className="text-2xl font-bold text-foreground">Coin Analytics</h1>
      </div>

      <div className="space-y-5">
        {/* Header card */}
        <CoinHeader />

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {/* Charts + breakdown */}
          <div className="xl:col-span-2 2xl:col-span-3 space-y-5">
            <PriceChart />
            <VolumeDetailChart />
            <CoinAlertHistory />
          </div>

          {/* Right panel */}
          <div className="xl:col-span-1 2xl:col-span-1 space-y-5">
            <MomentumBreakdown />
            <PerformanceStats />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}