import { useState, useCallback } from "react";

const STORAGE_KEY = "neuralos_followed_sources";

function loadFollowed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFollowedSources() {
  const [followed, setFollowed] = useState<string[]>(loadFollowed);

  const toggle = useCallback((name: string) => {
    setFollowed((prev) => {
      const next = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFollowed = useCallback((name: string) => followed.includes(name), [followed]);

  return { followed, toggle, isFollowed };
}
