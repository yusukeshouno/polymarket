"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "polymarket-watchlist";

export function useWatchlist() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  return { ids, toggle, has, count: ids.size };
}
