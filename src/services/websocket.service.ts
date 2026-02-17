import { ENV } from '@/config/env';
import {
  WS_RECONNECT_INTERVAL,
  WS_MAX_RECONNECT_ATTEMPTS,
  WS_HEARTBEAT_INTERVAL,
} from '@/config/constants';

type MessageHandler = (data: unknown) => void;
type StatusHandler = (connected: boolean) => void;

interface Subscription {
  method: string;
  params: unknown[];
  handler: MessageHandler;
  subscriptionId: number | null;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Subscription>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, (result: unknown) => void>();

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(ENV.SOLANA_WS_URL);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearTimers();
    this.subscriptions.clear();
    this.pendingRequests.clear();

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.notifyStatus(false);
  }

  subscribe(key: string, method: string, params: unknown[], handler: MessageHandler): void {
    this.subscriptions.set(key, { method, params, handler, subscriptionId: null });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(key);
    }
  }

  unsubscribe(key: string): void {
    const sub = this.subscriptions.get(key);
    if (sub?.subscriptionId !== null && this.ws?.readyState === WebSocket.OPEN) {
      const unsubMethod = sub.method.replace('Subscribe', 'Unsubscribe');
      this.sendRequest(unsubMethod, [sub.subscriptionId]);
    }
    this.subscriptions.delete(key);
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private handleOpen(): void {
    this.reconnectAttempts = 0;
    this.notifyStatus(true);
    this.startHeartbeat();
    this.resubscribeAll();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (data.id !== undefined && this.pendingRequests.has(data.id)) {
        const resolve = this.pendingRequests.get(data.id)!;
        this.pendingRequests.delete(data.id);
        resolve(data.result);
        return;
      }

      if (data.method === 'accountNotification' || data.method === 'programNotification') {
        const subId = data.params?.subscription;
        for (const sub of this.subscriptions.values()) {
          if (sub.subscriptionId === subId) {
            sub.handler(data.params?.result);
            break;
          }
        }
      }
    } catch {
      /* malformed message, ignore */
    }
  }

  private handleClose(): void {
    this.notifyStatus(false);
    this.clearTimers();
    this.scheduleReconnect();
  }

  private handleError(): void {
    this.ws?.close();
  }

  private sendSubscription(key: string): void {
    const sub = this.subscriptions.get(key);
    if (!sub) return;

    const id = this.sendRequest(sub.method, sub.params);
    this.pendingRequests.set(id, (result) => {
      sub.subscriptionId = result as number;
    });
  }

  private sendRequest(method: string, params: unknown[]): number {
    const id = ++this.requestId;
    const message = JSON.stringify({ jsonrpc: '2.0', id, method, params });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    }

    return id;
  }

  private resubscribeAll(): void {
    for (const key of this.subscriptions.keys()) {
      this.sendSubscription(key);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) return;

    this.reconnectAttempts++;
    const delay = WS_RECONNECT_INTERVAL * Math.pow(1.5, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendRequest('ping', []);
      }
    }, WS_HEARTBEAT_INTERVAL);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private notifyStatus(connected: boolean): void {
    for (const handler of this.statusHandlers) {
      handler(connected);
    }
  }
}

export const wsService = new WebSocketService();
