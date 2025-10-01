import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Using mock data mode.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cameras: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          rtsp_url: string;
          location: string;
          is_active: boolean;
          status: string;
          face_detection_enabled: boolean;
          fps_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          rtsp_url: string;
          location: string;
          is_active?: boolean;
          status?: string;
          face_detection_enabled?: boolean;
          fps_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          rtsp_url?: string;
          location?: string;
          is_active?: boolean;
          status?: string;
          face_detection_enabled?: boolean;
          fps_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          camera_id: string;
          type: string;
          message: string;
          confidence: number | null;
          metadata: any | null;
          snapshot_url: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          camera_id: string;
          type: string;
          message: string;
          confidence?: number | null;
          metadata?: any | null;
          snapshot_url?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          camera_id?: string;
          type?: string;
          message?: string;
          confidence?: number | null;
          metadata?: any | null;
          snapshot_url?: string | null;
          timestamp?: string;
        };
      };
    };
  };
}
