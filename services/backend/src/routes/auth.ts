import { Hono } from 'hono';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

const app = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = registerSchema.parse(body);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError) {
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Registration failed' }, 500);
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return c.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name
      },
      session: authData.session
    });

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!data.user || !data.session) {
      return c.json({ error: 'Login failed' }, 500);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', data.user.id)
      .maybeSingle();

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userProfile?.name || 'User'
      },
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.get('/profile', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .maybeSingle();

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: userProfile?.name || 'User'
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

app.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    await supabase.auth.signOut();

    return c.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

export { app as authRoutes };