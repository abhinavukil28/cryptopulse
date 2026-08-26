'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CoinSparklineProps {
  data: number[];
  positive?: boolean;
  height?: number;
}

export default function CoinSparkline({ data, positive = true, height = 32 }: CoinSparklineProps) {
  const chartData = data.map((value, i) => ({ i, value }));
  const strokeColor = positive ? 'var(--positive)' : 'var(--negative)';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}