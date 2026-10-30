export interface WakatimeItem {
  name: string;
  percent?: number;
  total_seconds?: number;
  text?: string;
  digital?: string;
}

export interface WakatimeStats {
  human_readable_total?: string;
  human_readable_daily_average?: string;
  range?: string;
  projects?: WakatimeItem[];
  languages?: WakatimeItem[];
  editors?: WakatimeItem[];
  operating_systems?: WakatimeItem[];
  grand_total?: string | null;
}

export interface WakatimeStatsResponse {
  data?: WakatimeStats;
}
