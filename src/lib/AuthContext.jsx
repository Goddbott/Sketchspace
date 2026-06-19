import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { migrateAnonymousCanvas } from './canvasApi';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to check and process any pending migrations
    const checkPendingMigration = async (userId) => {
      const pendingCanvasId = localStorage.getItem('pendingMigration');
      if (pendingCanvasId && userId) {
        try {
          await migrateAnonymousCanvas(pendingCanvasId, userId);
          localStorage.removeItem('pendingMigration');
        } catch (e) {
          console.error("Delayed migration failed:", e);
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPendingMigration(session.user.id);
      }
    }).catch(err => {
      console.error("Auth session error:", err);
    }).finally(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPendingMigration(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    signOut: () => supabase.auth.signOut(),
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
