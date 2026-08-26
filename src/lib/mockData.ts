export interface CryptoCoin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change1m: number;
  change5m: number;
  change15m: number;
  change1h: number;
  change4h: number;
  change24h: number;
  volume24h: number;
  volumeChange: number;
  marketCap: number;
  momentumScore: number;
  breakoutStrength: number;
  volatility: number;
  high24h: number;
  low24h: number;
  category: string;
  isWatchlisted: boolean;
  logoColor: string;
  sparkline7d: number[];
}

export interface Alert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  severity: 'INFO' | 'IMPORTANT' | 'CRITICAL';
  type: string;
  title: string;
  description: string;
  priceChange: number;
  volumeChange: number;
  momentumScore: number;
  rank: number;
  reason: string;
  timestamp: Date;
  timeframeMinutes: number;
  isRead: boolean;
}

export interface MarketOverview {
  totalMarketCap: number;
  marketCapChange24h: number;
  btcDominance: number;
  btcDominanceChange: number;
  totalVolume24h: number;
  volumeChange24h: number;
  gainersCount: number;
  losersCount: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  activeCoins: number;
}

export interface ScoreBreakdown {
  component: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  description: string;
}

export interface PriceDataPoint {
  time: string;
  price: number;
  volume: number;
}

export const MARKET_OVERVIEW: MarketOverview = {
  totalMarketCap: 2_847_392_000_000,
  marketCapChange24h: 3.42,
  btcDominance: 52.7,
  btcDominanceChange: -0.8,
  totalVolume24h: 187_430_000_000,
  volumeChange24h: 22.4,
  gainersCount: 1847,
  losersCount: 623,
  fearGreedIndex: 72,
  fearGreedLabel: 'Greed',
  activeCoins: 2470,
};

export const COINS: CryptoCoin[] = [
  {
    id: 'coin-sol',
    rank: 1,
    name: 'Solana',
    symbol: 'SOL',
    price: 198.47,
    change1m: 0.18,
    change5m: 0.62,
    change15m: 1.24,
    change1h: 6.82,
    change4h: 9.14,
    change24h: 14.37,
    volume24h: 8_742_000_000,
    volumeChange: 142.3,
    marketCap: 87_430_000_000,
    momentumScore: 91,
    breakoutStrength: 88,
    volatility: 4.2,
    high24h: 201.33,
    low24h: 173.12,
    category: 'Layer 1',
    isWatchlisted: true,
    logoColor: '#9945FF',
    sparkline7d: [138, 142, 139, 155, 161, 178, 198],
  },
  {
    id: 'coin-avax',
    rank: 2,
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 42.18,
    change1m: 0.31,
    change5m: 0.94,
    change15m: 2.11,
    change1h: 5.47,
    change4h: 7.83,
    change24h: 11.29,
    volume24h: 1_284_000_000,
    volumeChange: 98.7,
    marketCap: 17_240_000_000,
    momentumScore: 87,
    breakoutStrength: 79,
    volatility: 5.1,
    high24h: 43.22,
    low24h: 37.44,
    category: 'Layer 1',
    isWatchlisted: false,
    logoColor: '#E84142',
    sparkline7d: [32, 34, 33, 36, 38, 40, 42],
  },
  {
    id: 'coin-link',
    rank: 3,
    name: 'Chainlink',
    symbol: 'LINK',
    price: 18.94,
    change1m: 0.22,
    change5m: 0.71,
    change15m: 1.58,
    change1h: 4.93,
    change4h: 6.21,
    change24h: 9.84,
    volume24h: 892_000_000,
    volumeChange: 76.4,
    marketCap: 11_180_000_000,
    momentumScore: 83,
    breakoutStrength: 71,
    volatility: 3.8,
    high24h: 19.41,
    low24h: 17.12,
    category: 'Oracle',
    isWatchlisted: true,
    logoColor: '#375BD2',
    sparkline7d: [15, 15.5, 16, 16.8, 17.4, 18.1, 18.9],
  },
  {
    id: 'coin-eth',
    rank: 4,
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3_284.72,
    change1m: 0.09,
    change5m: 0.28,
    change15m: 0.74,
    change1h: 2.84,
    change4h: 4.12,
    change24h: 5.67,
    volume24h: 22_480_000_000,
    volumeChange: 34.8,
    marketCap: 394_200_000_000,
    momentumScore: 78,
    breakoutStrength: 62,
    volatility: 2.3,
    high24h: 3_311.00,
    low24h: 3_108.44,
    category: 'Layer 1',
    isWatchlisted: true,
    logoColor: '#627EEA',
    sparkline7d: [2980, 3050, 3010, 3140, 3200, 3250, 3285],
  },
  {
    id: 'coin-matic',
    rank: 5,
    name: 'Polygon',
    symbol: 'MATIC',
    price: 0.8847,
    change1m: 0.41,
    change5m: 1.23,
    change15m: 2.87,
    change1h: 7.12,
    change4h: 10.44,
    change24h: 15.81,
    volume24h: 1_124_000_000,
    volumeChange: 187.2,
    marketCap: 8_870_000_000,
    momentumScore: 89,
    breakoutStrength: 84,
    volatility: 6.4,
    high24h: 0.9124,
    low24h: 0.7631,
    category: 'Layer 2',
    isWatchlisted: false,
    logoColor: '#8247E5',
    sparkline7d: [0.62, 0.65, 0.63, 0.71, 0.76, 0.82, 0.88],
  },
  {
    id: 'coin-btc',
    rank: 6,
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 67_842.33,
    change1m: 0.04,
    change5m: 0.12,
    change15m: 0.38,
    change1h: 1.24,
    change4h: 2.18,
    change24h: 3.11,
    volume24h: 48_230_000_000,
    volumeChange: 18.3,
    marketCap: 1_340_000_000_000,
    momentumScore: 64,
    breakoutStrength: 44,
    volatility: 1.4,
    high24h: 68_420.00,
    low24h: 65_890.00,
    category: 'Store of Value',
    isWatchlisted: true,
    logoColor: '#F7931A',
    sparkline7d: [63200, 64100, 63800, 65400, 66200, 67100, 67842],
  },
  {
    id: 'coin-arb',
    rank: 7,
    name: 'Arbitrum',
    symbol: 'ARB',
    price: 1.2847,
    change1m: 0.55,
    change5m: 1.74,
    change15m: 3.42,
    change1h: 8.94,
    change4h: 12.37,
    change24h: 18.42,
    volume24h: 734_000_000,
    volumeChange: 224.8,
    marketCap: 4_110_000_000,
    momentumScore: 93,
    breakoutStrength: 91,
    volatility: 7.8,
    high24h: 1.3124,
    low24h: 1.0841,
    category: 'Layer 2',
    isWatchlisted: false,
    logoColor: '#28A0F0',
    sparkline7d: [0.84, 0.89, 0.87, 0.98, 1.08, 1.19, 1.28],
  },
  {
    id: 'coin-doge',
    rank: 8,
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: 0.1847,
    change1m: 0.38,
    change5m: 1.14,
    change15m: 2.73,
    change1h: 4.71,
    change4h: 6.88,
    change24h: 8.94,
    volume24h: 2_847_000_000,
    volumeChange: 210.4,
    marketCap: 26_840_000_000,
    momentumScore: 85,
    breakoutStrength: 74,
    volatility: 5.9,
    high24h: 0.1924,
    low24h: 0.1694,
    category: 'Meme',
    isWatchlisted: false,
    logoColor: '#C3A634',
    sparkline7d: [0.142, 0.148, 0.145, 0.158, 0.167, 0.175, 0.185],
  },
  {
    id: 'coin-op',
    rank: 9,
    name: 'Optimism',
    symbol: 'OP',
    price: 2.4127,
    change1m: -0.12,
    change5m: -0.38,
    change15m: -0.84,
    change1h: -1.47,
    change4h: -2.34,
    change24h: -4.12,
    volume24h: 312_000_000,
    volumeChange: -22.4,
    marketCap: 2_870_000_000,
    momentumScore: 31,
    breakoutStrength: 18,
    volatility: 4.2,
    high24h: 2.5841,
    low24h: 2.3847,
    category: 'Layer 2',
    isWatchlisted: false,
    logoColor: '#FF0420',
    sparkline7d: [2.84, 2.71, 2.68, 2.55, 2.49, 2.44, 2.41],
  },
  {
    id: 'coin-dot',
    rank: 10,
    name: 'Polkadot',
    symbol: 'DOT',
    price: 8.347,
    change1m: 0.08,
    change5m: 0.24,
    change15m: 0.61,
    change1h: 1.84,
    change4h: 2.97,
    change24h: 4.28,
    volume24h: 487_000_000,
    volumeChange: 28.7,
    marketCap: 10_870_000_000,
    momentumScore: 58,
    breakoutStrength: 42,
    volatility: 2.8,
    high24h: 8.524,
    low24h: 7.984,
    category: 'Layer 0',
    isWatchlisted: false,
    logoColor: '#E6007A',
    sparkline7d: [7.2, 7.5, 7.4, 7.8, 8.0, 8.2, 8.35],
  },
  {
    id: 'coin-uni',
    rank: 11,
    name: 'Uniswap',
    symbol: 'UNI',
    price: 11.284,
    change1m: 0.19,
    change5m: 0.57,
    change15m: 1.34,
    change1h: 3.84,
    change4h: 5.42,
    change24h: 7.91,
    volume24h: 394_000_000,
    volumeChange: 54.3,
    marketCap: 6_760_000_000,
    momentumScore: 74,
    breakoutStrength: 61,
    volatility: 3.4,
    high24h: 11.584,
    low24h: 10.424,
    category: 'DeFi',
    isWatchlisted: false,
    logoColor: '#FF007A',
    sparkline7d: [9.4, 9.8, 9.7, 10.2, 10.7, 11.0, 11.3],
  },
  {
    id: 'coin-atom',
    rank: 12,
    name: 'Cosmos',
    symbol: 'ATOM',
    price: 9.847,
    change1m: -0.08,
    change5m: -0.24,
    change15m: -0.58,
    change1h: -1.12,
    change4h: -1.84,
    change24h: -3.47,
    volume24h: 228_000_000,
    volumeChange: -18.7,
    marketCap: 3_840_000_000,
    momentumScore: 28,
    breakoutStrength: 14,
    volatility: 3.1,
    high24h: 10.284,
    low24h: 9.714,
    category: 'Layer 0',
    isWatchlisted: false,
    logoColor: '#2E3148',
    sparkline7d: [11.2, 10.8, 10.4, 10.1, 9.9, 9.8, 9.85],
  },
];

export const ALERTS: Alert[] = [
  {
    id: 'alert-001',
    coinId: 'coin-arb',
    coinName: 'Arbitrum',
    coinSymbol: 'ARB',
    severity: 'CRITICAL',
    type: 'Breakout Alert',
    title: 'ARB Breakout Detected',
    description: 'ARB broke above its 30-day resistance at $1.21 with 224% volume surge.',
    priceChange: 8.94,
    volumeChange: 224.8,
    momentumScore: 93,
    rank: 7,
    reason: 'Price acceleration coinciding with 3.2× normal volume. Breakout above 30-day resistance confirmed.',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    timeframeMinutes: 60,
    isRead: false,
  },
  {
    id: 'alert-002',
    coinId: 'coin-matic',
    coinName: 'Polygon',
    coinSymbol: 'MATIC',
    severity: 'CRITICAL',
    type: 'Volume Surge',
    title: 'MATIC Abnormal Volume',
    description: 'MATIC volume is 187% above its 7-day average with accelerating price.',
    priceChange: 7.12,
    volumeChange: 187.2,
    momentumScore: 89,
    rank: 5,
    reason: 'Volume spike to 3.87× historical average while price accelerated. Unusual buy-side pressure detected.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    timeframeMinutes: 60,
    isRead: false,
  },
  {
    id: 'alert-003',
    coinId: 'coin-sol',
    coinName: 'Solana',
    coinSymbol: 'SOL',
    severity: 'CRITICAL',
    type: 'Momentum Surge',
    title: 'SOL Momentum Alert',
    description: 'SOL is up 6.8% in the last hour with 142% above-average volume.',
    priceChange: 6.82,
    volumeChange: 142.3,
    momentumScore: 91,
    rank: 1,
    reason: 'Strong price acceleration + abnormal volume. Momentum score reached 91/100 — top 2% of tracked coins.',
    timestamp: new Date(Date.now() - 14 * 60 * 1000),
    timeframeMinutes: 60,
    isRead: false,
  },
  {
    id: 'alert-004',
    coinId: 'coin-doge',
    coinName: 'Dogecoin',
    coinSymbol: 'DOGE',
    severity: 'IMPORTANT',
    type: 'Momentum Surge',
    title: 'DOGE Momentum Surge',
    description: 'DOGE gained 4.7% in 15 minutes. Volume increased 210%.',
    priceChange: 4.71,
    volumeChange: 210.4,
    momentumScore: 85,
    rank: 8,
    reason: 'Price acceleration occurring together with significantly elevated trading volume. Social signal correlation detected.',
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
    timeframeMinutes: 15,
    isRead: true,
  },
  {
    id: 'alert-005',
    coinId: 'coin-avax',
    coinName: 'Avalanche',
    coinSymbol: 'AVAX',
    severity: 'IMPORTANT',
    type: 'Top Performer',
    title: 'AVAX Entered Top 3',
    description: 'AVAX climbed to #2 momentum rank, up from #9 in the last 4 hours.',
    priceChange: 5.47,
    volumeChange: 98.7,
    momentumScore: 87,
    rank: 2,
    reason: 'Rapid rank improvement from #9 to #2 over 4 hours. Sustained price momentum with consistent volume.',
    timestamp: new Date(Date.now() - 31 * 60 * 1000),
    timeframeMinutes: 240,
    isRead: true,
  },
  {
    id: 'alert-006',
    coinId: 'coin-link',
    coinName: 'Chainlink',
    coinSymbol: 'LINK',
    severity: 'IMPORTANT',
    type: 'Volume Alert',
    title: 'LINK Volume Spike',
    description: 'LINK trading volume is 76% above 7-day average with positive price action.',
    priceChange: 4.93,
    volumeChange: 76.4,
    momentumScore: 83,
    rank: 3,
    reason: 'Volume elevated above 1.76× average with sustained upward price movement. Oracle sector rotation detected.',
    timestamp: new Date(Date.now() - 47 * 60 * 1000),
    timeframeMinutes: 60,
    isRead: true,
  },
  {
    id: 'alert-007',
    coinId: 'coin-uni',
    coinName: 'Uniswap',
    coinSymbol: 'UNI',
    severity: 'INFO',
    type: 'Momentum Alert',
    title: 'UNI Momentum Building',
    description: 'UNI entered top 20 performers with improving momentum score.',
    priceChange: 3.84,
    volumeChange: 54.3,
    momentumScore: 74,
    rank: 11,
    reason: 'Gradual momentum build with above-average volume. DeFi sector showing broad strength.',
    timestamp: new Date(Date.now() - 68 * 60 * 1000),
    timeframeMinutes: 60,
    isRead: true,
  },
  {
    id: 'alert-008',
    coinId: 'coin-eth',
    coinName: 'Ethereum',
    coinSymbol: 'ETH',
    severity: 'INFO',
    type: 'Top 10 Entry',
    title: 'ETH Volume Pickup',
    description: 'ETH volume increased 34.8% with consistent price appreciation.',
    priceChange: 2.84,
    volumeChange: 34.8,
    momentumScore: 78,
    rank: 4,
    reason: 'Institutional-grade volume pickup with steady price trend. Possible rotation from BTC detected.',
    timestamp: new Date(Date.now() - 84 * 60 * 1000),
    timeframeMinutes: 60,
    isRead: true,
  },
];

export const BTC_DOMINANCE_HISTORY = [
  { time: '06:00', value: 54.2 },
  { time: '07:00', value: 53.8 },
  { time: '08:00', value: 53.4 },
  { time: '09:00', value: 54.1 },
  { time: '10:00', value: 53.7 },
  { time: '11:00', value: 53.1 },
  { time: '12:00', value: 52.7 },
  { time: '13:00', value: 52.4 },
  { time: '14:00', value: 52.9 },
  { time: '15:00', value: 52.5 },
  { time: '16:00', value: 52.2 },
  { time: '17:00', value: 52.7 },
];

export const VOLUME_HISTORY = [
  { time: '06:00', volume: 142 },
  { time: '07:00', volume: 158 },
  { time: '08:00', volume: 134 },
  { time: '09:00', volume: 171 },
  { time: '10:00', volume: 163 },
  { time: '11:00', volume: 189 },
  { time: '12:00', volume: 187 },
  { time: '13:00', volume: 201 },
  { time: '14:00', volume: 176 },
  { time: '15:00', volume: 194 },
  { time: '16:00', volume: 211 },
  { time: '17:00', volume: 187 },
];

export const SOL_PRICE_HISTORY: PriceDataPoint[] = [
  { time: '08:00', price: 173.12, volume: 4200 },
  { time: '08:30', price: 175.84, volume: 4800 },
  { time: '09:00', price: 174.22, volume: 4400 },
  { time: '09:30', price: 178.91, volume: 5200 },
  { time: '10:00', price: 177.34, volume: 4900 },
  { time: '10:30', price: 181.47, volume: 5800 },
  { time: '11:00', price: 183.22, volume: 6100 },
  { time: '11:30', price: 180.84, volume: 5400 },
  { time: '12:00', price: 184.91, volume: 6400 },
  { time: '12:30', price: 187.34, volume: 7100 },
  { time: '13:00', price: 186.22, volume: 6800 },
  { time: '13:30', price: 191.47, volume: 7800 },
  { time: '14:00', price: 193.84, volume: 8200 },
  { time: '14:30', price: 192.11, volume: 7400 },
  { time: '15:00', price: 195.47, volume: 8600 },
  { time: '15:30', price: 197.84, volume: 9100 },
  { time: '16:00', price: 196.22, volume: 8400 },
  { time: '16:30', price: 199.41, volume: 9800 },
  { time: '17:00', price: 201.33, volume: 10200 },
  { time: '17:30', price: 198.47, volume: 8742 },
];

export const SOL_SCORE_BREAKDOWN: ScoreBreakdown[] = [
  {
    component: '1h-momentum',
    label: '1H Price Momentum',
    score: 27,
    maxScore: 30,
    weight: 30,
    description: 'Strong 1-hour price acceleration of +6.82%',
  },
  {
    component: 'volume-accel',
    label: 'Volume Acceleration',
    score: 18,
    maxScore: 20,
    weight: 20,
    description: 'Volume 142% above 7-day average — significant buy-side pressure',
  },
  {
    component: '24h-momentum',
    label: '24H Trend',
    score: 17,
    maxScore: 20,
    weight: 20,
    description: '+14.37% sustained upward trend over 24 hours',
  },
  {
    component: 'mktcap-adj',
    label: 'Market Cap Adjusted',
    score: 9,
    maxScore: 10,
    weight: 10,
    description: 'High liquidity large-cap with strong momentum — reliable signal',
  },
  {
    component: 'volatility-adj',
    label: 'Volatility Adjusted',
    score: 8,
    maxScore: 10,
    weight: 10,
    description: 'Volatility within acceptable range — not a noise spike',
  },
  {
    component: 'breakout',
    label: 'Breakout Strength',
    score: 12,
    maxScore: 10,
    weight: 10,
    description: 'Price broke above 30-day resistance at $196.40',
  },
];

export const WATCHLIST_COINS = COINS.filter(c =>
  ['coin-btc', 'coin-eth', 'coin-sol', 'coin-link', 'coin-avax'].includes(c.id)
).map((c, i) => ({
  ...c,
  customThreshold: [3.0, 2.5, 5.0, 4.0, 4.5][i],
  notificationsEnabled: [true, true, true, false, true][i],
  addedAt: new Date(Date.now() - [7, 14, 3, 21, 5][i] * 24 * 60 * 60 * 1000),
}));

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toFixed(0)}`;
}

export function formatChange(change: number): string {
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

export function getTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}