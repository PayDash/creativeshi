"use client";

import { useState, useEffect } from "react";

export function useWakatime() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/wakatime")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);
  return data;
}
