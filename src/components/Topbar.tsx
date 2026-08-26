'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, Menu, X, TrendingUp, Star, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';

interface TopbarProps {
  connectionStatus?: 'live' | 'delayed' | 'disconnected';
  alertCount?: number;
  onSearchOpen?: () => void;
}

export default function Topbar({
  connectionStatus = 'live',
  alertCount = 3,
  onSearchOpen,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const statusConfig = {
    live: { color: 'text-positive', dot: 'bg-positive', label: 'Live' },
    delayed: { color: 'text-warning', dot: 'bg-warning', label: 'Delayed' },
    disconnected: { color: 'text-negative', dot: 'bg-negative', label: 'Disconnected' },
  };
  const status = statusConfig[connectionStatus];

  const mobileNavItems = [
    { id: 'mn-dash', label: 'Dashboard', href: '/', icon: <LayoutDashboard size={16} />, requiresAuth: false },
    { id: 'mn-watch', label: 'Watchlist', href: '/watchlist', icon: <Star size={16} />, requiresAuth: true },
    { id: 'mn-detail', label: 'Coin Analytics', href: '/cryptocurrency-detail', icon: <TrendingUp size={16} />, requiresAuth: false },
  ];

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch {
      // ignore
    } finally {
      setSigningOut(false);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <header className="h-[60px] border-b border-border flex items-center px-4 gap-4 sticky top-0 z-40" style={{ background: 'var(--card)' }}>
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2">
          <AppLogo size={24} />
          <span className="font-semibold text-sm text-foreground">CryptoPulse</span>
        </div>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border border-border text-muted-foreground text-sm hover:border-primary/40 hover:text-foreground transition-all duration-150 min-w-[200px]"
        >
          <Search size={14} />
          <span>Search coins...</span>
          <span className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border border-border">⌘K</span>
        </button>

        <div className="flex-1" />

        {/* Connection status */}
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot} live-pulse`} />
          <span>{status.label}</span>
        </div>

        {/* Alerts */}
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150">
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-negative text-white text-2xs font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        {/* Auth button (desktop) */}
        {user ? (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-negative hover:bg-negative/10 transition-all duration-150 disabled:opacity-50"
          >
            <LogOut size={14} />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        ) : (
          <Link
            href="/login"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-all duration-150"
          >
            <LogIn size={14} />
            Sign in
          </Link>
        )}

        {/* Mobile menu */}
        <button
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="relative w-64 h-full border-r border-border py-6 px-4 space-y-1 z-10 flex flex-col" style={{ background: 'var(--card)' }}>
            <div className="flex items-center gap-2 mb-6 px-2">
              <AppLogo size={28} />
              <span className="font-semibold text-foreground">CryptoPulse</span>
            </div>
            {mobileNavItems.map((item) => {
              const isLocked = item.requiresAuth && !user;
              const href = isLocked ? '/login' : item.href;
              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                    pathname === item.href
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {isLocked && <span className="text-xs">🔒</span>}
                </Link>
              );
            })}

            <div className="flex-1" />

            {/* Mobile auth */}
            {user ? (
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-2xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-negative hover:bg-negative/10 transition-all duration-150"
                >
                  <LogOut size={16} />
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            ) : (
              <div className="border-t border-border pt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-150"
                >
                  <LogIn size={16} />
                  Sign in
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}