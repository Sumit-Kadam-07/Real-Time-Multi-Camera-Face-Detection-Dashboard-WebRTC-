import { WSContext } from 'hono/ws';

// In-memory store for WebSocket connections
const connections = new Set<WSContext>();

export const wsHandler = (c: any) => {
  // This is a simplified WebSocket handler
  // In a real implementation, you'd use a proper WebSocket server
  console.log('WebSocket connection attempt');
  
  return c.json({ 
    message: 'WebSocket endpoint - Use proper WebSocket client to connect',
    wsUrl: 'ws://localhost:8080/ws'
  });
};

// Mock function to broadcast messages to all connected clients
export const broadcast = (message: any) => {
  const payload = JSON.stringify(message);
  console.log('Broadcasting message:', payload);
  
  // In real implementation, send to all connected WebSocket clients
  connections.forEach(ws => {
    try {
      // ws.send(payload);
    } catch (error) {
      console.error('Failed to send message to client:', error);
    }
  });
};

// Simulate real-time events
setInterval(() => {
  if (Math.random() > 0.8) { // 20% chance every 5 seconds
    broadcast({
      type: 'face_detected',
      cameraId: `cam-${Math.floor(Math.random() * 4) + 1}`,
      cameraName: `Camera ${Math.floor(Math.random() * 4) + 1}`,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      timestamp: new Date(),
      boundingBox: {
        x: Math.floor(Math.random() * 400),
        y: Math.floor(Math.random() * 300),
        width: 80 + Math.floor(Math.random() * 40),
        height: 100 + Math.floor(Math.random() * 50)
      }
    });
  }
}, 5000);

// Simulate camera stats updates
setInterval(() => {
  ['cam-1', 'cam-2', 'cam-3', 'cam-4'].forEach(cameraId => {
    broadcast({
      type: 'camera_stats',
      cameraId,
      fps: Math.floor(Math.random() * 5) + 25, // 25-30 fps
      bitrate: Math.floor(Math.random() * 1000) + 2000, // 2000-3000 kbps
      isOnline: Math.random() > 0.1, // 90% uptime
      timestamp: new Date()
    });
  });
}, 3000);