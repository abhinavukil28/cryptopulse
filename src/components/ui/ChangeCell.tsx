import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface ChangeCellProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

export default function ChangeCell({ value, showIcon = false, className = '' }: ChangeCellProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const colorClass = isNeutral
    ? 'text-muted-foreground'
    : isPositive
    ? 'text-positive' :'text-negative';

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span className={`inline-flex items-center gap-0.5 font-mono-nums text-xs font-semibold ${colorClass} ${className}`}>
      {showIcon && <Icon size={11} />}
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}