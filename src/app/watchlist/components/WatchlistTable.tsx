'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Bell, BellOff, Trash2, Settings2, Plus, ExternalLink } from 'lucide-react';
import { watchlistService, marketService, type WatchlistItem, type MarketSnapshot } from '@/lib/services/cryptoService';
import { WATCHLIST_COINS, formatPrice, formatLargeNumber } from '@/lib/mockData';
import type { CryptoCoin } from '@/lib/mockData';
import MomentumScoreBadge from '@/components/ui/MomentumScoreBadge';
import ChangeCell from '@/components/ui/ChangeCell';
import CoinSparkline from '@/components/ui/CoinSparkline';
import ThresholdModal from './ThresholdModal';
import { useAuth } from '@/contexts/AuthContext';

interface WatchlistCoin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  volumeChange: number;
  marketCap: number;
  momentumScore: number;
  volatility: number;
  logoColor: string;
  sparkline7d: number[];
  customThreshold: number;
  notificationsEnabled: boolean;
  addedAt: Date;
  // DB item id for updates
  dbItemId?: string;
}

function mergeWatchlistData(items: WatchlistItem[], coinsData: CryptoCoin[]): WatchlistCoin[] {
  return items.map(item => {
    const coinData = coinsData.find(c => c.id === item.coinId);
    return {
      id: item.coinId,
      dbItemId: item.id,
      rank: coinData?.rank ?? 0,
      name: item.coinName,
      symbol: item.coinSymbol,
      price: coinData?.price ?? 0,
      change1h: coinData?.change1h ?? 0,
      change24h: coinData?.change24h ?? 0,
      volume24h: coinData?.volume24h ?? 0,
      volumeChange: coinData?.volumeChange ?? 0,
      marketCap: coinData?.marketCap ?? 0,
      momentumScore: coinData?.momentumScore ?? 0,
      volatility: coinData?.volatility ?? 0,
      logoColor: item.logoColor,
      sparkline7d: coinData?.sparkline7d ?? [],
      customThreshold: item.customThreshold,
      notificationsEnabled: item.notificationsEnabled,
      addedAt: new Date(item.addedAt),
    };
  });
}

export default function WatchlistTable() {
  const { user } = useAuth();
  const [coins, setCoins] = useState<WatchlistCoin[]>(WATCHLIST_COINS as WatchlistCoin[]);
  const [selectedCoin, setSelectedCoin] = useState<WatchlistCoin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [coinsData, setCoinsData] = useState<CryptoCoin[]>([]);

  useEffect(() => {
    // Load market data for coin details
    marketService.getLatestSnapshot().then((snapshot: MarketSnapshot | null) => {
      if (snapshot?.coinsData) setCoinsData(snapshot.coinsData);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      // Not logged in: show mock data
      setCoins(WATCHLIST_COINS as WatchlistCoin[]);
      setLoading(false);
      return;
    }
    watchlistService.getItems(user.id).then((items) => {
      if (items.length > 0) {
        setCoins(mergeWatchlistData(items, coinsData));
      } else {
        setCoins([]);
      }
      setLoading(false);
    });
  }, [user, coinsData]);

  const toggleNotification = async (coinId: string) => {
    const coin = coins.find(c => c.id === coinId);
    if (!coin) return;
    const newVal = !coin.notificationsEnabled;
    setCoins(prev => prev.map(c => c.id === coinId ? { ...c, notificationsEnabled: newVal } : c));
    if (user) {
      await watchlistService.toggleNotifications(user.id, coinId, newVal);
    }
  };

  const removeCoin = async (coinId: string) => {
    setDeletingId(coinId);
    setTimeout(async () => {
      setCoins(prev => prev.filter(c => c.id !== coinId));
      setDeletingId(null);
      if (user) {
        await watchlistService.removeItem(user.id, coinId);
      }
    }, 300);
  };

  const openThreshold = (coin: WatchlistCoin) => {
    setSelectedCoin(coin);
    setModalOpen(true);
  };

  const saveThreshold = async (id: string, threshold: number) => {
    setCoins(prev => prev.map(c => c.id === id ? { ...c, customThreshold: threshold } : c));
    setModalOpen(false);
    setSelectedCoin(null);
    if (user) {
      await watchlistService.updateThreshold(user.id, id, threshold);
    }
  };

  const daysAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
  };

  return (
    <>
      {selectedCoin && (
        <ThresholdModal
          isOpen={modalOpen}
          coin={selectedCoin}
          onClose={() => { setModalOpen(false); setSelectedCoin(null); }}
          onSave={saveThreshold}
        />
      )}

      <div className="rounded-xl border border-border overflow-hidden" style={{ background: 'var(--card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-warning fill-warning" />
            <h2 className="text-sm font-semibold text-foreground">My Watchlist</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {coins.length} coins
            </span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg btn-primary text-xs">
            <Plus size={13} />
            Add Coin
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border" style={{ background: 'var(--background)' }}>
                  <th className="text-left py-2.5 px-4 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Coin</th>
                  <th className="text-right py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Price</th>
                  <th className="text-right py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">1H %</th>
                  <th className="text-right py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">24H %</th>
                  <th className="text-right py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Volume</th>
                  <th className="text-right py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Mkt Cap</th>
                  <th className="text-left py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">7D</th>
                  <th className="text-center py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Score</th>
                  <th className="text-center py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Alert Threshold</th>
                  <th className="text-center py-2.5 px-3 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Notify</th>
                  <th className="py-2.5 px-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {coins.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Star size={36} className="text-muted-foreground" />
                        <p className="text-sm font-semibold text-foreground">No coins in your watchlist</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Add coins to your watchlist to monitor them with custom alert thresholds and notification settings.
                        </p>
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg btn-primary text-sm mt-1">
                          <Plus size={14} />
                          Add your first coin
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  coins.map((coin) => (
                    <tr
                      key={coin.id}
                      className={`row-hover border-b border-border/50 group transition-all duration-300 ${
                        deletingId === coin.id ? 'opacity-0 scale-95' : 'opacity-100'
                      }`}
                    >
                      {/* Coin */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: coin.logoColor + '22', color: coin.logoColor }}
                          >
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{coin.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {coin.symbol} · #{coin.rank} · Added {daysAgo(coin.addedAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-sm font-mono-nums font-semibold text-foreground">
                          ${formatPrice(coin.price)}
                        </span>
                      </td>

                      {/* 1H */}
                      <td className="py-3 px-3 text-right">
                        <ChangeCell value={coin.change1h} showIcon />
                      </td>

                      {/* 24H */}
                      <td className="py-3 px-3 text-right">
                        <ChangeCell value={coin.change24h} showIcon />
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3 text-right">
                        <div>
                          <p className="text-xs font-mono-nums text-foreground">{formatLargeNumber(coin.volume24h)}</p>
                          <ChangeCell value={coin.volumeChange} className="text-2xs" />
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-mono-nums text-foreground">{formatLargeNumber(coin.marketCap)}</span>
                      </td>

                      {/* Sparkline */}
                      <td className="py-3 px-3">
                        <div className="w-16">
                          <CoinSparkline data={coin.sparkline7d} positive={coin.change24h >= 0} />
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-center">
                        <MomentumScoreBadge score={coin.momentumScore} />
                      </td>

                      {/* Alert threshold */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => openThreshold(coin)}
                          className="inline-flex items-center gap-1 text-xs font-mono-nums font-semibold px-2 py-1 rounded border border-border hover:border-primary/40 hover:text-primary text-muted-foreground transition-all duration-150"
                          title="Edit alert threshold"
                        >
                          ±{coin.customThreshold.toFixed(1)}%
                          <Settings2 size={10} />
                        </button>
                      </td>

                      {/* Notifications */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleNotification(coin.id)}
                          className={`p-1.5 rounded transition-all duration-150 ${
                            coin.notificationsEnabled
                              ? 'text-primary bg-primary/10 hover:bg-primary/15' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={coin.notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                        >
                          {coin.notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <Link
                            href="/cryptocurrency-detail"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
                            title="View analytics"
                          >
                            <ExternalLink size={13} />
                          </Link>
                          <button
                            onClick={() => removeCoin(coin.id)}
                            className="p-1.5 rounded hover:bg-negative/10 text-muted-foreground hover:text-negative transition-all duration-150"
                            title="Remove from watchlist"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {coins.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border" style={{ background: 'var(--background)' }}>
            <p className="text-xs text-muted-foreground">
              {coins.filter(c => c.notificationsEnabled).length} of {coins.length} coins have notifications enabled
            </p>
            <p className="text-xs text-muted-foreground">
              Alerts fire when price moves exceed your custom threshold
            </p>
          </div>
        )}
      </div>
    </>
  );
}