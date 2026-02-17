'use client';

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { fetchMarket, fetchMarketTrades } from '@/services/market.service';
import { wsService } from '@/services/websocket.service';
import type { Market, MarketTrade } from '@/types';

export function useMarketDetail(address: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [trades, setTrades] = useState<MarketTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pubkey = new PublicKey(address);
      const [marketData, tradesData] = await Promise.all([
        fetchMarket(pubkey),
        fetchMarketTrades(pubkey),
      ]);

      if (!marketData) {
        setError('Market not found');
        return;
      }

      setMarket(marketData);
      setTrades(tradesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const subKey = `market-${address}`;

    wsService.connect();
    wsService.subscribe(
      subKey,
      'accountSubscribe',
      [address, { encoding: 'base64', commitment: 'confirmed' }],
      () => {
        load();
      },
    );

    return () => {
      wsService.unsubscribe(subKey);
    };
  }, [address, load]);

  return { market, trades, loading, error, refresh: load };
}
