// ✅ src/context/AuthContext.jsx (UPDATED)
// Fixes:
// 1) Double-login issue (race) by separating "initial auth bootstrap" from "action loading"
// 2) Prevents Cart/Wishlist redirect while auth state is still being restored
// 3) Avoids showing full-page loader on every route change/login (optional but recommended)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, role, id, name }
  const [loading, setLoading] = useState(false); // for actions (login/signup)
  const [authReady, setAuthReady] = useState(false); // ✅ session restored (important)

  // Helper to fetch profile from DB
  const fetchUserProfile = async (userId, email) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const safeEmail = (data.email || email || '').toLowerCase();
        return {
          email: data.email || email,
          id: data.id || userId,
          role:
            safeEmail === 'admin@mystore.com' ? 'admin' : data.role || 'user',
          name: data.full_name || data.name || 'User',
        };
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }

    // Fallback if profile missing
    const safeEmail = (email || '').toLowerCase();
    return {
      email,
      id: userId,
      role: safeEmail === 'admin@mystore.com' ? 'admin' : 'user',
      name: 'User',
    };
  };

  useEffect(() => {
    let mounted = true;

    // ✅ 1) Restore session ONCE on mount
    const bootstrap = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email
          );
          if (!mounted) return;
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('checkSession error:', e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthReady(true); // ✅ auth is ready now
      }
    };

    bootstrap();

    // ✅ 2) Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email
          );
          if (!mounted) return;
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('onAuthStateChange error:', e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthReady(true); // ✅ ensure true
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
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

    if (data?.session?.user) {
      // ✅ set user immediately (avoid redirect race)
      const profile = await fetchUserProfile(
        data.session.user.id,
        data.session.user.email
      );
      setUser(profile);

      setLoading(false);
      setAuthReady(true);
      return { success: true, role: profile.role };
    }

    setLoading(false);
    return { success: false, message: 'Login failed' };
  };

  const signup = async (email, password, name) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    setLoading(false);

    if (error) return { success: false, message: error.message };
    return { success: true };
  };


  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthReady(true);
  };

  // ✅ IMPORTANT CHANGE:
  // Don't block whole app with spinner on auth bootstrap.
  // Instead expose `authReady` and let guarded pages wait.
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        loading, // action loading (login/signup buttons)
        authReady, // ✅ use this in Cart/Wishlist guards
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
