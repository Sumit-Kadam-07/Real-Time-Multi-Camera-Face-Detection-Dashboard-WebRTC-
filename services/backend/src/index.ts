import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { cameraRoutes } from './routes/cameras';
import { eventRoutes } from './routes/events';
import { wsHandler, websocket } from './websocket';

const app = new Hono();

// Middleware
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/cameras', cameraRoutes);
app.route('/api/events', eventRoutes);

// WebSocket endpoint
app.get('/ws', wsHandler);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 8080;

console.log(`🚀 Backend API server starting on port ${port}`);
console.log(`📊 Health check available at http://localhost:${port}/health`);
console.log(`🔌 WebSocket available at ws://localhost:${port}/ws`);

export default {
  port,
  fetch: app.fetch,
  websocket
};