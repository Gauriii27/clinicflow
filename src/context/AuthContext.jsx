import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserRole(session.user.id);
          } else {
            setUserRole(null);
          }
          setLoading(false);
        })();
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserRole(data.role);
        setUser(prev => ({ ...prev, full_name: data.full_name }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: role,
            },
          ]);

        if (insertError) throw insertError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      const message = error?.message || String(error);

      if (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('Network request failed')
      ) {
        return {
          data: null,
          error: new Error(
            'Unable to reach Supabase. Make sure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env and that your network is online.'
          ),
        };
      }

      if (
        message.toLowerCase().includes('email not confirmed') ||
        message.toLowerCase().includes('confirm your email') ||
        message.toLowerCase().includes('email is not confirmed')
      ) {
        return {
          data: null,
          error: new Error(
            'Your email address is not confirmed. Please check your inbox for the verification email before signing in.'
          ),
        };
      }

      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
