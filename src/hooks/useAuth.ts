import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { data, error };
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred during registration. Please try again.',
          name: 'UnexpectedError',
          status: 500
        } as any
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
        return { data, error };
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected signin error:', err);
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred during login. Please try again.',
          name: 'UnexpectedError',
          status: 500
        } as any
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Always clear local state regardless of server response
      setSession(null);
      setUser(null);
      
      return { error };
    } catch (err) {
      // Clear local state even if logout fails
      setSession(null);
      setUser(null);
      
      console.error('Logout error:', err);
      return { 
        error: { 
          message: 'Logout completed locally',
          name: 'LocalLogout',
          status: 200
        } as any
      };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
}