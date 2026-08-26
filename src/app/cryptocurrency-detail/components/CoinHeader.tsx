import React from 'react';
import { Star, Bell, Share2 } from 'lucide-react';
import { COINS, formatPrice, formatLargeNumber } from '@/lib/mockData';
import MomentumScoreBadge from '@/components/ui/MomentumScoreBadge';
import ChangeCell from '@/components/ui/ChangeCell';

const coin = COINS.find(c => c.id === 'coin-sol')!;

export default function CoinHeader() {
  return (
    <div className="rounded-xl border border-border p-5 glow-primary-sm" style={{ background: 'var(--card)' }}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Left: Identity */}
        <div className="flex items-start gap-4 flex-1">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: coin.logoColor + '22', color: coin.logoColor, border: `2px solid ${coin.logoColor}44` }}
          >
            {coin.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{coin.name}</h1>
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {coin.symbol}
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                #{coin.rank} Rank
              </span>
              <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground border border-border">
                {coin.category}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-3xl font-bold font-mono-nums text-foreground">
                ${formatPrice(coin.price)}
              </span>
              <ChangeCell value={coin.change24h} showIcon className="text-sm" />
              <MomentumScoreBadge score={coin.momentumScore} size="lg" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs font-medium hover:bg-warning/15 transition-all duration-150">
            <Star size={13} className="fill-warning" />
            Watchlist
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-muted transition-all duration-150">
            <Bell size={13} />
            Alert
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-muted transition-all duration-150">
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5 pt-4 border-t border-border">
        {[
          { label: '1H', value: coin.change1h },
          { label: '4H', value: coin.change4h },
          { label: '24H', value: coin.change24h },
          { label: '1M Chg', value: coin.change1m },
          { label: '5M Chg', value: coin.change5m },
          { label: '15M Chg', value: coin.change15m },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className="text-center">
            <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
            <ChangeCell value={stat.value} showIcon />
          </div>
        ))}
      </div>

      {/* Market data row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Market Cap</p>
          <p className="text-sm font-semibold font-mono-nums text-foreground">{formatLargeNumber(coin.marketCap)}</p>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">24H Volume</p>
          <p className="text-sm font-semibold font-mono-nums text-foreground">{formatLargeNumber(coin.volume24h)}</p>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">24H High</p>
          <p className="text-sm font-semibold font-mono-nums text-positive">${formatPrice(coin.high24h)}</p>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">24H Low</p>
          <p className="text-sm font-semibold font-mono-nums text-negative">${formatPrice(coin.low24h)}</p>
        </div>
      </div>
    </div>
  );
}