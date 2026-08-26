'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Star,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  User,
  HelpCircle,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'nav-watchlist',
    label: 'Watchlist',
    href: '/watchlist',
    icon: <Star size={18} />,
    badge: 5,
    badgeColor: 'bg-primary text-primary-foreground',
    requiresAuth: true,
  },
  {
    id: 'nav-detail',
    label: 'Coin Analytics',
    href: '/cryptocurrency-detail',
    icon: <TrendingUp size={18} />,
  },
];

const SECONDARY_NAV: NavItem[] = [
  {
    id: 'nav-alerts',
    label: 'Alert Rules',
    href: '#',
    icon: <Bell size={18} />,
    badge: 3,
    badgeColor: 'bg-negative text-white',
    requiresAuth: true,
  },
  {
    id: 'nav-activity',
    label: 'Activity',
    href: '#',
    icon: <Activity size={18} />,
  },
  {
    id: 'nav-anomalies',
    label: 'Anomalies',
    href: '#',
    icon: <AlertTriangle size={18} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch {
      // ignore
    } finally {
      setSigningOut(false);
    }
  };

  const renderNavItem = (item: NavItem) => {
    const isLocked = item.requiresAuth && !user;
    const href = isLocked ? '/login' : item.href;

    return (
      <Link
        key={item.id}
        href={href}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium transition-all duration-150 group relative ${
          isActive(item.href)
            ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="truncate flex-1">{item.label}</span>
            {isLocked && (
              <span className="text-2xs text-muted-foreground/60 font-medium">🔒</span>
            )}
            {!isLocked && item.badge !== undefined && (
              <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge !== undefined && !isLocked && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-negative" />
        )}
      </Link>
    );
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 border-r border-border transition-all duration-300 ease-in-out z-30"
      style={{ width: collapsed ? '64px' : '220px', background: 'var(--card)' }}
    >
      {/* Logo */}
      <div className="flex items-center px-3 py-4 border-b border-border min-h-[60px]">
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={28} />
          {!collapsed && (
            <span className="font-semibold text-sm text-foreground truncate tracking-tight">
              CryptoPulse
            </span>
          )}
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {!collapsed && (
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
            Markets
          </p>
        )}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(renderNavItem)}
        </div>

        <div className="mt-4">
          {!collapsed && (
            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
              Tools
            </p>
          )}
          {collapsed && <div className="border-t border-border my-2" />}
          <div className="space-y-0.5">
            {SECONDARY_NAV.map(renderNavItem)}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-2 py-3 space-y-0.5">
        <button
          title={collapsed ? 'Settings' : undefined}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          title={collapsed ? 'Help' : undefined}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          <HelpCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span>Help & Docs</span>}
        </button>

        {/* User section */}
        {!loading && (
          user ? (
            <>
              <div className="flex items-center gap-2 px-2 py-2 mt-1">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-primary" />
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-2xs text-muted-foreground truncate">{displayEmail}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title={collapsed ? 'Sign out' : undefined}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-negative hover:bg-negative/10 transition-all duration-150 disabled:opacity-50"
              >
                <LogOut size={16} className="flex-shrink-0" />
                {!collapsed && <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              title={collapsed ? 'Sign in' : undefined}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-150"
            >
              <LogIn size={16} className="flex-shrink-0" />
              {!collapsed && <span>Sign in</span>}
            </Link>
          )
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 mt-1"
        >
          {collapsed ? <ChevronRight size={14} /> : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}