import { Hono } from 'hono';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

app.use('/*', authMiddleware);


const createCameraSchema = z.object({
  name: z.string().min(1),
  rtspUrl: z.string().min(1),
  location: z.string().min(1),
  faceDetectionEnabled: z.boolean().optional(),
  fpsLimit: z.number().min(1).max(60).optional()
});

const updateCameraSchema = z.object({
  name: z.string().min(1).optional(),
  rtspUrl: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  faceDetectionEnabled: z.boolean().optional(),
  fpsLimit: z.number().min(1).max(60).optional()
});

app.get('/', async (c) => {
  try {
    const userId = c.get('userId');

    const { data: cameras, error } = await supabase
      .from('cameras')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get cameras error:', error);
      return c.json({ error: 'Failed to fetch cameras' }, 500);
    }

    return c.json({ cameras: cameras || [] });
  } catch (error) {
    console.error('Get cameras error:', error);
    return c.json({ error: 'Failed to fetch cameras' }, 500);
  }
});

app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const { data: camera, error } = await supabase
      .from('cameras')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Get camera error:', error);
      return c.json({ error: 'Failed to fetch camera' }, 500);
    }

    if (!camera) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    return c.json({ camera });
  } catch (error) {
    console.error('Get camera error:', error);
    return c.json({ error: 'Failed to fetch camera' }, 500);
  }
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = createCameraSchema.parse(body);
    const userId = c.get('userId');

    const { data: camera, error } = await supabase
      .from('cameras')
      .insert({
        user_id: userId,
        name: data.name,
        rtsp_url: data.rtspUrl,
        location: data.location,
        face_detection_enabled: data.faceDetectionEnabled ?? true,
        fps_limit: data.fpsLimit ?? 15,
        is_active: false,
        status: 'offline'
      })
      .select()
      .single();

    if (error) {
      console.error('Create camera error:', error);
      return c.json({ error: 'Failed to create camera' }, 500);
    }

    return c.json({ camera }, 201);
  } catch (error) {
    console.error('Create camera error:', error);
    return c.json({ error: 'Failed to create camera' }, 400);
  }
});

app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = updateCameraSchema.parse(body);
    const userId = c.get('userId');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.rtspUrl !== undefined) updateData.rtsp_url = data.rtspUrl;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.faceDetectionEnabled !== undefined) updateData.face_detection_enabled = data.faceDetectionEnabled;
    if (data.fpsLimit !== undefined) updateData.fps_limit = data.fpsLimit;

    const { data: camera, error } = await supabase
      .from('cameras')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update camera error:', error);
      return c.json({ error: 'Failed to update camera' }, 500);
    }

    if (!camera) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    return c.json({ camera });
  } catch (error) {
    console.error('Update camera error:', error);
    return c.json({ error: 'Failed to update camera' }, 400);
  }
});

app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete camera error:', error);
      return c.json({ error: 'Failed to delete camera' }, 500);
    }

    return c.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Delete camera error:', error);
    return c.json({ error: 'Failed to delete camera' }, 500);
  }
});

app.post('/:id/start', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const { data: camera, error } = await supabase
      .from('cameras')
      .update({
        is_active: true,
        status: 'online'
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Start camera error:', error);
      return c.json({ error: 'Failed to start camera' }, 500);
    }

    if (!camera) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    const workerUrl = process.env.WORKER_API_URL || 'http://localhost:8081';
    fetch(`${workerUrl}/cameras/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camera)
    }).catch(err => console.error('Worker start error:', err));

    return c.json({ camera, message: 'Camera stream started' });
  } catch (error) {
    console.error('Start camera error:', error);
    return c.json({ error: 'Failed to start camera' }, 500);
  }
});

app.post('/:id/stop', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');

    const { data: camera, error } = await supabase
      .from('cameras')
      .update({
        is_active: false,
        status: 'offline'
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Stop camera error:', error);
      return c.json({ error: 'Failed to stop camera' }, 500);
    }

    if (!camera) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    const workerUrl = process.env.WORKER_API_URL || 'http://localhost:8081';
    fetch(`${workerUrl}/cameras/${id}/stop`, {
      method: 'POST'
    }).catch(err => console.error('Worker stop error:', err));

    return c.json({ camera, message: 'Camera stream stopped' });
  } catch (error) {
    console.error('Stop camera error:', error);
    return c.json({ error: 'Failed to stop camera' }, 500);
  }
});

export { app as cameraRoutes };