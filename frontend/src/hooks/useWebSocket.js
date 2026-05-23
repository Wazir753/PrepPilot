import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';

export default function useWebSocket(autoConnect = true) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return undefined;

    websocketService.connect();
    const unsub = websocketService.on('connected', setConnected);

    return () => {
      unsub();
    };
  }, [autoConnect]);

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setConnected(false);
  }, []);

  const on = useCallback((event, callback) => websocketService.on(event, callback), []);

  const send = useCallback((event, data) => websocketService.send(event, data), []);

  return { connected, connect, disconnect, on, send, socket: websocketService };
}
