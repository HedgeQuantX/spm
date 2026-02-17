'use client';

import { useState, useEffect } from 'react';
import { wsService } from '@/services/websocket.service';

export function useWsStatus(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = wsService.onStatusChange(setConnected);
    setConnected(wsService.isConnected);
    return unsubscribe;
  }, []);

  return connected;
}
