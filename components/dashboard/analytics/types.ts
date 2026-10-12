export type DateRangeKey = "7d" | "30d" | "month" | "custom";

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  changeDirection: "up" | "down" | "neutral";
  comparisonLabel: string;
  subtext: string;
  microDetail: string;
  accentColor: "emerald" | "cyan" | "indigo" | "violet";
}

export interface HourlyCallVolume {
  hour: string;
  totalCalls: number;
  aiResolved: number;
  deflectionPercent: number;
}

export interface CallIntentDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}
