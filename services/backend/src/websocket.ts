import { Context } from 'hono';
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';

const { upgradeWebSocket, websocket } = createBunWebSocket();

interface WebSocketData {
  userId?: string;
}

const connections = new Map<string, Set<ServerWebSocket<WebSocketData>>>();

export const wsHandler = upgradeWebSocket((c: Context) => {
  return {
    onOpen(evt, ws) {
      console.log('WebSocket connection opened');
    },

    onMessage(evt, ws) {
      try {
        const data = JSON.parse(evt.data.toString());

        if (data.type === 'authenticate' && data.userId) {
          const userId = data.userId;

          if (!connections.has(userId)) {
            connections.set(userId, new Set());
          }
          connections.get(userId)?.add(ws);

          ws.send(JSON.stringify({
            type: 'authenticated',
            message: 'Successfully authenticated'
          }));

          console.log(`User ${userId} authenticated via WebSocket`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    },

    onClose(evt, ws) {
      connections.forEach((userConnections, userId) => {
        if (userConnections.has(ws)) {
          userConnections.delete(ws);
          if (userConnections.size === 0) {
            connections.delete(userId);
          }
          console.log(`User ${userId} disconnected`);
        }
      });
    },

    onError(evt, ws) {
      console.error('WebSocket error:', evt);
    }
  };
});

export const broadcastToUser = (userId: string, message: any) => {
  const userConnections = connections.get(userId);
  if (userConnections) {
    const payload = JSON.stringify(message);
    userConnections.forEach(ws => {
      try {
        ws.send(payload);
      } catch (error) {
        console.error('Failed to send message to client:', error);
      }
    });
  }
};

export const broadcastToAll = (message: any) => {
  const payload = JSON.stringify(message);
  connections.forEach(userConnections => {
    userConnections.forEach(ws => {
      try {
        ws.send(payload);
      } catch (error) {
        console.error('Failed to send message to client:', error);
      }
    });
  });
};

export { websocket };
