import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getScopedStorage } from "@/lib/scopedStorage";

const SCOPED_KEY = "read_sources";

export function useReadSources() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [readMap, setReadMap] = useState<Record<string, number>>(() =>
    getScopedStorage(userId).get<Record<string, number>>(SCOPED_KEY, {})
  );

  // Rebuild when user changes
  useEffect(() => {
    setReadMap(getScopedStorage(userId).get<Record<string, number>>(SCOPED_KEY, {}));
  }, [userId]);

  const markRead = useCallback((name: string) => {
    setReadMap((prev) => {
      const next = { ...prev, [name]: Date.now() };
      getScopedStorage(userId).set(SCOPED_KEY, next);
      return next;
    });
  }, [userId]);

  const isRead = useCallback((name: string) => !!readMap[name], [readMap]);

  const getReadTime = useCallback((name: string) => readMap[name] || 0, [readMap]);

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
