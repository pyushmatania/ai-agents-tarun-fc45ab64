import { useState, useCallback } from "react";

const STORAGE_KEY = "neuralos_read_sources";

function loadRead(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useReadSources() {
  const [readMap, setReadMap] = useState<Record<string, number>>(loadRead);

  const markRead = useCallback((name: string) => {
    setReadMap((prev) => {
      const next = { ...prev, [name]: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isRead = useCallback((name: string) => !!readMap[name], [readMap]);

  const getReadTime = useCallback((name: string) => readMap[name] || 0, [readMap]);

  /** Sources read in the last 7 days, sorted by most recent */
  const recentlyRead = useCallback(
    (allNames: string[]) => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return allNames
        .filter((n) => readMap[n] && readMap[n] > weekAgo)
        .sort((a, b) => (readMap[b] || 0) - (readMap[a] || 0));
    },
    [readMap]
  );

  return { markRead, isRead, getReadTime, recentlyRead, readMap };
}
