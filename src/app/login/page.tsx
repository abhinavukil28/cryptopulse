'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Mail, Lock, TrendingUp, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-10 border-r border-border" style={{ background: 'var(--card)' }}>
        <div className="flex items-center gap-3">
          <AppLogo size={32} />
          <span className="font-bold text-lg text-foreground tracking-tight">CryptoPulse</span>
        </div>
        <div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-positive live-pulse" />
              <span className="text-xs font-medium text-positive">Live Market Intelligence</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground leading-tight mb-3">
              Track momentum.<br />Catch breakouts.<br />Stay ahead.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Real-time cryptocurrency analytics with intelligent alerts — know which coins are performing exceptionally well and why.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <TrendingUp size={14} />, label: 'Momentum Scoring' },
              { icon: <AlertTriangle size={14} />, label: 'Smart Alerts' },
              { icon: <TrendingUp size={14} />, label: 'Watchlists' },
              { icon: <TrendingUp size={14} />, label: 'Volume Analytics' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                <span className="text-primary">{f.icon}</span>
                <span className="text-xs text-muted-foreground font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-2xs text-muted-foreground">
          Market data and alerts are provided for informational purposes only and do not constitute financial or investment advice.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <AppLogo size={28} />
            <span className="font-bold text-foreground">CryptoPulse</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-negative/10 border border-negative/20 mb-5">
              <AlertTriangle size={15} className="text-negative flex-shrink-0 mt-0.5" />
              <p className="text-sm text-negative">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
