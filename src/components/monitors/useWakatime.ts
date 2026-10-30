"use client";

import { useState, useEffect } from "react";
import type { WakatimeStats } from "@/lib/wakatime";

export function useWakatime(): WakatimeStats | null {
  const [data, setData] = useState<WakatimeStats | null>(null);
  useEffect(() => {
    fetch("/api/wakatime")
      .then(r => r.json())
      .then((d: WakatimeStats | null) => setData(d))
      .catch(() => {});
  }, []);
  return data;
}
