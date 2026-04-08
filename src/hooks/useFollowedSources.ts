import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import { getScopedStorage } from "@/lib/scopedStorage";

const SCOPED_KEY = "followed_sources";

export function useFollowedSources() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [followed, setFollowed] = useState<string[]>(() =>
    getScopedStorage(userId).get<string[]>(SCOPED_KEY, [])
  );

  // Rebuild when user changes
  useEffect(() => {
    setFollowed(getScopedStorage(userId).get<string[]>(SCOPED_KEY, []));
  }, [userId]);

  const toggle = useCallback((name: string) => {
    setFollowed((prev) => {
      const next = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      getScopedStorage(userId).set(SCOPED_KEY, next);
      return next;
    });
  }, [userId]);

  const isFollowed = useCallback((name: string) => followed.includes(name), [followed]);

  return { followed, toggle, isFollowed };
}
