import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, role, id }
  const [loading, setLoading] = useState(true);

  // Helper to fetch profile from DB
  const fetchUserProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        return {
          email: data.email,
          id: data.id,
          role:
            data.email.toLowerCase() === 'admin@mystore.com'
              ? 'admin'
              : data.role || 'user',
          name: data.full_name || 'User',
        };
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    // Fallback if profile missing
    return {
      email: email,
      id: userId,
      role: email.toLowerCase() === 'admin@mystore.com' ? 'admin' : 'user',
      name: 'User',
    };
  };

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email
        );
        setUser(profile);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // We need to fetch the profile again to ensure we have the role
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email
        );
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }

    if (data.session) {
      const profile = await fetchUserProfile(
        data.session.user.id,
        data.session.user.email
      );
      console.log('Login successful. User:', data.session.user.email);
      console.log('Fetched Profile:', profile);
      setUser(profile);
      setLoading(false);
      return { success: true, role: profile.role };
    }

    setLoading(false);
    return { success: false, message: 'Login failed' };
  };

  const signup = async (email, password, name) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    setLoading(false);
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const logout = async () => {
    // setLoading(true); // ❌ Don't block UI on logout (prevents unmount issues)
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
