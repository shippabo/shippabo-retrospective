import { WebSocket, WebSocketServer } from 'ws';

export function setupHeartbeat(websocketServer: WebSocketServer) {
  const heartbeat = new WeakMap<WebSocket, boolean>();

  websocketServer.on('connection', (websocket) => {
    heartbeat.set(websocket, true);

    websocket.on('pong', () => {
      heartbeat.set(websocket, true);
    });
  });

  const interval = setInterval(() => {
    websocketServer.clients.forEach((websocket) => {
      if (!heartbeat.get(websocket)) {
        websocket.terminate();
      }

      heartbeat.set(websocket, false);

      websocket.ping();
    });
  }, 30000);

  websocketServer.on('close', () => {
    clearInterval(interval);
  });
}
