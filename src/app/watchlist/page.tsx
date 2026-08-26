'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import WatchlistSummaryCards from './components/WatchlistSummaryCards';
import WatchlistTable from './components/WatchlistTable';
import NotificationSettings from './components/NotificationSettings';

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router?.replace('/login?next=/watchlist');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor your curated coins with custom alert thresholds
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <WatchlistSummaryCards />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {/* Table */}
        <div className="xl:col-span-2 2xl:col-span-3">
          <WatchlistTable />
        </div>

        {/* Notification settings */}
        <div className="xl:col-span-1 2xl:col-span-1">
          <NotificationSettings />
        </div>
      </div>
    </AppLayout>
  );
}