import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AdultScreening {
  id: string;
  user_id: string;
  screening_code: string;
  name: string;
  age: number;
  responses: Record<string, string>;
  classification_responses?: Record<string, string>;
  prediction?: string;
  classification_result?: string;
  chart_data?: any;
  created_at: string;
}

export interface ToddlerScreening {
  id: string;
  user_id: string;
  screening_code: string;
  name: string;
  age_months: number;
  responses: Record<string, string>;
  classification_responses?: Record<string, string>;
  prediction?: string;
  classification_result?: string;
  chart_data?: any;
  created_at: string;
}