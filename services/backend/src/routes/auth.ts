import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const app = new Hono();

// Mock user database (in production, use Prisma with PostgreSQL)
const users = [
  {
    id: '1',
    email: 'demo@example.com',
    password: bcrypt.hashSync('demo123', 10), // Hashed password
    name: 'Demo User'
  }
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

// Login endpoint
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get user profile
app.get('/profile', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export { app as authRoutes };