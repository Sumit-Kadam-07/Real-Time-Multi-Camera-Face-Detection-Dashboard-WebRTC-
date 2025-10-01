import { Hono } from 'hono';

const app = new Hono();

// Mock events database
let events = [
  {
    id: 'evt-1',
    cameraId: 'cam-1',
    cameraName: 'Front Entrance',
    type: 'face_detected',
    message: 'Face detected in camera feed',
    confidence: 0.87,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    metadata: {
      boundingBox: { x: 100, y: 150, width: 80, height: 100 }
    }
  },
  {
    id: 'evt-2',
    cameraId: 'cam-2',
    cameraName: 'Parking Lot',
    type: 'face_detected',
    message: 'Face detected in camera feed',
    confidence: 0.92,
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    metadata: {
      boundingBox: { x: 200, y: 100, width: 75, height: 95 }
    }
  }
];

// Get all events with filtering and pagination
app.get('/', (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const type = c.req.query('type');
  const cameraId = c.req.query('cameraId');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');

  let filteredEvents = [...events];

  // Apply filters
  if (type) {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }

  if (cameraId) {
    filteredEvents = filteredEvents.filter(event => event.cameraId === cameraId);
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredEvents = filteredEvents.filter(event => event.timestamp >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredEvents = filteredEvents.filter(event => event.timestamp <= end);
  }

  // Sort by timestamp (newest first)
  filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Pagination
  const total = filteredEvents.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedEvents = filteredEvents.slice(offset, offset + limit);

  return c.json({
    events: paginatedEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Get event by ID
app.get('/:id', (c) => {
  const id = c.req.param('id');
  const event = events.find(evt => evt.id === id);
  
  if (!event) {
    return c.json({ error: 'Event not found' }, 404);
  }

  return c.json({ event });
});

// Delete event (for cleanup)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  const eventIndex = events.findIndex(evt => evt.id === id);
  
  if (eventIndex === -1) {
    return c.json({ error: 'Event not found' }, 404);
  }

  events.splice(eventIndex, 1);
  return c.json({ message: 'Event deleted successfully' });
});

// Create new event (typically called by worker service)
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    const newEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      ...body
    };

    events.push(newEvent);

    return c.json({ event: newEvent }, 201);
  } catch (error) {
    console.error('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 400);
  }
});

// Get event statistics
app.get('/stats/summary', (c) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    total: events.length,
    today: events.filter(e => e.timestamp >= today).length,
    thisWeek: events.filter(e => e.timestamp >= thisWeek).length,
    thisMonth: events.filter(e => e.timestamp >= thisMonth).length,
    byType: events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCamera: events.reduce((acc, event) => {
      acc[event.cameraId] = (acc[event.cameraId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return c.json({ stats });
});

export { app as eventRoutes };