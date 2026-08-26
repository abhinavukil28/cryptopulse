'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { COINS, formatPrice } from '@/lib/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = query.length >= 1
    ? COINS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase()) ||
        c.rank.toString() === query
      ).slice(0, 8)
    : COINS.slice(0, 6);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-border shadow-2xl overflow-hidden fade-in"
        style={{ background: 'var(--card)' }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, symbol, or rank..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
          <kbd className="text-2xs px-1.5 py-0.5 rounded border border-border text-muted-foreground">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground px-4 py-2">
              Top Momentum
            </p>
          )}
          {results.map((coin) => (
            <Link
              key={`search-${coin.id}`}
              href="/cryptocurrency-detail"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors duration-100"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: coin.logoColor + '22', color: coin.logoColor }}
              >
                {coin.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{coin.name}</p>
                <p className="text-xs text-muted-foreground">{coin.symbol} · #{coin.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono-nums text-foreground">${formatPrice(coin.price)}</p>
                <div className="flex items-center gap-1 justify-end">
                  {coin.change24h >= 0
                    ? <TrendingUp size={10} className="text-positive" />
                    : <TrendingDown size={10} className="text-negative" />}
                  <span className={`text-xs font-mono-nums font-semibold ${coin.change24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No coins found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}