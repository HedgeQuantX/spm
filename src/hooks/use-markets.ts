'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllMarkets } from '@/services/market.service';
import { wsService } from '@/services/websocket.service';
import { ENV } from '@/config/env';
import type { Market, MarketFilter } from '@/types';
import { MarketStatus } from '@/types';

function applyFilters(markets: Market[], filter: MarketFilter): Market[] {
  let result = [...markets];

  if (filter.category) {
    result = result.filter((m) => m.category === filter.category);
  }

  if (filter.status) {
    result = result.filter((m) => m.status === filter.status);
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }

  switch (filter.sortBy) {
    case 'volume':
      result.sort((a, b) => b.totalVolume - a.totalVolume);
      break;
    case 'newest':
      result.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'closing':
      result = result
        .filter((m) => m.status === MarketStatus.Open)
        .sort((a, b) => a.closesAt - b.closesAt);
      break;
    case 'trending':
      result.sort((a, b) => {
        const now = Date.now() / 1000;
        const scoreA = trendingScore(a, now);
        const scoreB = trendingScore(b, now);
        return scoreB - scoreA;
      });
      break;
  }

  return result;
}

function trendingScore(market: Market, now: number): number {
  const ageHours = Math.max(1, (now - market.createdAt) / 3600);
  const recencyBoost = 1000 / ageHours;
  const volumeScore = market.totalVolume / 1_000_000;
  const bountyScore = market.bounty / 1_000_000;
  return volumeScore + recencyBoost + bountyScore;
}

export function useMarkets(filter: MarketFilter) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filtered, setFiltered] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const marketsRef = useRef<Market[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllMarkets();
      marketsRef.current = data;
      setMarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!ENV.PROGRAM_ID) return;

    wsService.connect();
    wsService.subscribe(
      'program-markets',
      'programSubscribe',
      [ENV.PROGRAM_ID, { encoding: 'base64', commitment: 'confirmed' }],
      () => {
        load();
      },
    );

    return () => {
      wsService.unsubscribe('program-markets');
    };
  }, [load]);

  useEffect(() => {
    setFiltered(applyFilters(markets, filter));
  }, [markets, filter]);

  return { markets: filtered, allMarkets: markets, loading, error, refresh: load };
}
