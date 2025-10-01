import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

app.use('/*', authMiddleware);


app.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const type = c.req.query('type');
    const cameraId = c.req.query('cameraId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let query = supabase
      .from('events')
      .select(`
        *,
        camera:cameras!inner(
          id,
          name,
          user_id
        )
      `, { count: 'exact' })
      .eq('camera.user_id', userId)
      .order('timestamp', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (cameraId) {
      query = query.eq('camera_id', cameraId);
    }

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }

    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    const offset = (page - 1) * limit;
    const { data: events, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Get events error:', error);
      return c.json({ error: 'Failed to fetch events' }, 500);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return c.json({
      events: events || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        camera:cameras!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('id', id)
      .eq('camera.user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Get event error:', error);
      return c.json({ error: 'Failed to fetch event' }, 500);
    }

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    return c.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const { data: event } = await supabase
      .from('events')
      .select(`
        id,
        camera:cameras!inner(
          user_id
        )
      `)
      .eq('id', id)
      .eq('camera.user_id', userId)
      .maybeSingle();

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete event error:', deleteError);
      return c.json({ error: 'Failed to delete event' }, 500);
    }

    return c.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        camera_id: body.cameraId,
        type: body.type,
        message: body.message,
        confidence: body.confidence || null,
        metadata: body.metadata || null,
        snapshot_url: body.snapshotUrl || null
      })
      .select()
      .single();

    if (error) {
      console.error('Create event error:', error);
      return c.json({ error: 'Failed to create event' }, 500);
    }

    return c.json({ event }, 201);
  } catch (error) {
    console.error('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 400);
  }
});

app.get('/stats/summary', async (c) => {
  try {
    const userId = c.get('userId');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: allEvents, error } = await supabase
      .from('events')
      .select(`
        *,
        camera:cameras!inner(
          user_id
        )
      `)
      .eq('camera.user_id', userId);

    if (error) {
      console.error('Get stats error:', error);
      return c.json({ error: 'Failed to fetch stats' }, 500);
    }

    const events = allEvents || [];

    const stats = {
      total: events.length,
      today: events.filter(e => new Date(e.timestamp) >= today).length,
      thisWeek: events.filter(e => new Date(e.timestamp) >= thisWeek).length,
      thisMonth: events.filter(e => new Date(e.timestamp) >= thisMonth).length,
      byType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCamera: events.reduce((acc, event) => {
        acc[event.camera_id] = (acc[event.camera_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export { app as eventRoutes };