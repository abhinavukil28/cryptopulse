'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Bell, AlertTriangle } from 'lucide-react';

interface ThresholdModalProps {
  isOpen: boolean;
  coin: {
    id: string;
    name: string;
    symbol: string;
    logoColor: string;
    customThreshold: number;
    momentumScore: number;
  };
  onClose: () => void;
  onSave: (id: string, threshold: number) => void;
}

interface FormValues {
  threshold: number;
  priceAlertUp: number;
  priceAlertDown: number;
  volumeThreshold: number;
  scoreThreshold: number;
}

export default function ThresholdModal({ isOpen, coin, onClose, onSave }: ThresholdModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      threshold: coin.customThreshold,
      priceAlertUp: coin.customThreshold,
      priceAlertDown: coin.customThreshold,
      volumeThreshold: 50,
      scoreThreshold: 75,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        threshold: coin.customThreshold,
        priceAlertUp: coin.customThreshold,
        priceAlertDown: coin.customThreshold,
        volumeThreshold: 50,
        scoreThreshold: 75,
      });
    }
  }, [isOpen, coin, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: FormValues) => {
    // Backend integration point: PATCH /api/watchlist/:coinId/threshold
    await new Promise(r => setTimeout(r, 400));
    onSave(coin.id, data.threshold);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl border border-border shadow-2xl fade-in"
        style={{ background: 'var(--card)' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Alert settings for ${coin.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: coin.logoColor + '22', color: coin.logoColor }}
            >
              {coin.symbol.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Alert Settings — {coin.symbol}</h3>
              <p className="text-xs text-muted-foreground">Custom thresholds for {coin.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Price movement threshold */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Price Movement Threshold
            </label>
            <p className="text-2xs text-muted-foreground mb-2">
              Alert fires when price moves by this percentage in the configured timeframe.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                {...register('threshold', {
                  required: 'Threshold is required',
                  min: { value: 0.1, message: 'Minimum 0.1%' },
                  max: { value: 50, message: 'Maximum 50%' },
                  valueAsNumber: true,
                })}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-input text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-150 font-mono-nums"
              />
              <span className="text-sm text-muted-foreground font-mono-nums">%</span>
            </div>
            {errors.threshold && (
              <p className="text-xs text-negative mt-1">{errors.threshold.message}</p>
            )}
          </div>

          {/* Upside / downside alerts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Upside Alert (%)
              </label>
              <p className="text-2xs text-muted-foreground mb-2">Alert when price rises above this.</p>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register('priceAlertUp', { required: true, min: 0.1, valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-150 font-mono-nums"
              />
              {errors.priceAlertUp && (
                <p className="text-xs text-negative mt-1">Required</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Downside Alert (%)
              </label>
              <p className="text-2xs text-muted-foreground mb-2">Alert when price drops below this.</p>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register('priceAlertDown', { required: true, min: 0.1, valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-150 font-mono-nums"
              />
              {errors.priceAlertDown && (
                <p className="text-xs text-negative mt-1">Required</p>
              )}
            </div>
          </div>

          {/* Volume threshold */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Volume Surge Threshold (%)
            </label>
            <p className="text-2xs text-muted-foreground mb-2">
              Alert when trading volume exceeds this percentage above the 7-day average.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="5"
                min="10"
                max="500"
                {...register('volumeThreshold', {
                  required: 'Required',
                  min: { value: 10, message: 'Minimum 10%' },
                  max: { value: 500, message: 'Maximum 500%' },
                  valueAsNumber: true,
                })}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-input text-sm text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-150 font-mono-nums"
              />
              <span className="text-sm text-muted-foreground font-mono-nums">%</span>
            </div>
            {errors.volumeThreshold && (
              <p className="text-xs text-negative mt-1">{errors.volumeThreshold.message}</p>
            )}
          </div>

          {/* Score threshold */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Momentum Score Threshold
            </label>
            <p className="text-2xs text-muted-foreground mb-2">
              Alert when the momentum score exceeds this value (0–100).
            </p>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              {...register('scoreThreshold', { valueAsNumber: true })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-2xs text-muted-foreground mt-1">
              <span>10 (Low)</span>
              <span>55 (Moderate)</span>
              <span>100 (Max)</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg border border-warning/20 bg-warning-subtle">
            <AlertTriangle size={13} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-2xs text-muted-foreground leading-relaxed">
              Alerts identify market performance and momentum signals only. This is not financial advice. Elevated volatility does not guarantee price continuation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 active:scale-97"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Bell size={14} />
                  Save Alert Rules
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}