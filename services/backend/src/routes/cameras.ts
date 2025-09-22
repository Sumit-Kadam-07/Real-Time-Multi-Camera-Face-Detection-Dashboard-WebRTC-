import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

// Mock camera database
let cameras = [
  {
    id: 'cam-1',
    name: 'Front Entrance',
    rtspUrl: 'rtsp://demo:demo@192.168.1.101/stream1',
    location: 'Building A - Main Door',
    isActive: true,
    status: 'online' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'cam-2',
    name: 'Parking Lot',
    rtspUrl: 'rtsp://demo:demo@192.168.1.102/stream1',
    location: 'Building A - East Side',
    isActive: true,
    status: 'online' as const,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

const createCameraSchema = z.object({
  name: z.string().min(1),
  rtspUrl: z.string().url(),
  location: z.string().min(1)
});

const updateCameraSchema = z.object({
  name: z.string().min(1).optional(),
  rtspUrl: z.string().url().optional(),
  location: z.string().min(1).optional()
});

// Get all cameras
app.get('/', (c) => {
  return c.json({ cameras });
});

// Get camera by ID
app.get('/:id', (c) => {
  const id = c.req.param('id');
  const camera = cameras.find(cam => cam.id === id);
  
  if (!camera) {
    return c.json({ error: 'Camera not found' }, 404);
  }

  return c.json({ camera });
});

// Create new camera
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = createCameraSchema.parse(body);

    const newCamera = {
      id: `cam-${Date.now()}`,
      ...data,
      isActive: false,
      status: 'offline' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    cameras.push(newCamera);

    return c.json({ camera: newCamera }, 201);
  } catch (error) {
    console.error('Create camera error:', error);
    return c.json({ error: 'Failed to create camera' }, 400);
  }
});

// Update camera
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = updateCameraSchema.parse(body);

    const cameraIndex = cameras.findIndex(cam => cam.id === id);
    if (cameraIndex === -1) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    cameras[cameraIndex] = {
      ...cameras[cameraIndex],
      ...data,
      updatedAt: new Date()
    };

    return c.json({ camera: cameras[cameraIndex] });
  } catch (error) {
    console.error('Update camera error:', error);
    return c.json({ error: 'Failed to update camera' }, 400);
  }
});

// Delete camera
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  const cameraIndex = cameras.findIndex(cam => cam.id === id);
  
  if (cameraIndex === -1) {
    return c.json({ error: 'Camera not found' }, 404);
  }

  cameras.splice(cameraIndex, 1);
  return c.json({ message: 'Camera deleted successfully' });
});

// Start camera stream
app.post('/:id/start', (c) => {
  const id = c.req.param('id');
  const camera = cameras.find(cam => cam.id === id);
  
  if (!camera) {
    return c.json({ error: 'Camera not found' }, 404);
  }

  camera.isActive = true;
  camera.status = 'online';
  camera.updatedAt = new Date();

  // In real implementation, signal the worker service to start processing this stream
  console.log(`Starting camera stream: ${camera.name}`);

  return c.json({ camera, message: 'Camera stream started' });
});

// Stop camera stream
app.post('/:id/stop', (c) => {
  const id = c.req.param('id');
  const camera = cameras.find(cam => cam.id === id);
  
  if (!camera) {
    return c.json({ error: 'Camera not found' }, 404);
  }

  camera.isActive = false;
  camera.status = 'offline';
  camera.updatedAt = new Date();

  // In real implementation, signal the worker service to stop processing this stream
  console.log(`Stopping camera stream: ${camera.name}`);

  return c.json({ camera, message: 'Camera stream stopped' });
});

export { app as cameraRoutes };