import React from 'react';

interface SeverityBadgeProps {
  severity: 'INFO' | 'IMPORTANT' | 'CRITICAL';
  size?: 'sm' | 'md';
}

export default function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = {
    CRITICAL: { className: 'severity-critical', label: '⚡ CRITICAL' },
    IMPORTANT: { className: 'severity-important', label: '🔥 IMPORTANT' },
    INFO: { className: 'severity-info', label: 'ℹ INFO' },
  };

  const c = config[severity];
  const sizeClass = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center rounded font-semibold tracking-wide ${c.className} ${sizeClass}`}>
      {c.label}
    </span>
  );
}