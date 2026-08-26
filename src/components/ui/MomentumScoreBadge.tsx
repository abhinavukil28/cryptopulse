import React from 'react';

interface MomentumScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function MomentumScoreBadge({ score, size = 'md' }: MomentumScoreBadgeProps) {
  const getColor = (s: number) => {
    if (s >= 85) return { bg: 'rgba(0,212,170,0.12)', text: 'var(--primary)', border: 'rgba(0,212,170,0.3)' };
    if (s >= 70) return { bg: 'rgba(16,185,129,0.1)', text: 'var(--positive)', border: 'rgba(16,185,129,0.25)' };
    if (s >= 50) return { bg: 'rgba(245,158,11,0.1)', text: 'var(--warning)', border: 'rgba(245,158,11,0.25)' };
    if (s >= 30) return { bg: 'rgba(100,116,139,0.1)', text: 'var(--muted-foreground)', border: 'rgba(100,116,139,0.2)' };
    return { bg: 'rgba(239,68,68,0.1)', text: 'var(--negative)', border: 'rgba(239,68,68,0.2)' };
  };

  const colors = getColor(score);
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 font-semibold',
    md: 'text-xs px-2 py-1 font-bold',
    lg: 'text-sm px-2.5 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded font-mono-nums ${sizeClasses[size]}`}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {score}
    </span>
  );
}