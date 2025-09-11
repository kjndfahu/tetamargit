'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, type Profile, type SignUpData, type SignInData } from './auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'phone'>>) => Promise<Profile>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    AuthService.getCurrentSession().then(session => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        AuthService.getUserProfile(session.user.id).then(profile => {
          setProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await AuthService.getUserProfile(session.user.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      await AuthService.signUp(data);
      // Note: User will be automatically set via onAuthStateChange
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      await AuthService.signIn(data);
      // Note: User will be automatically set via onAuthStateChange
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      // Note: User will be automatically cleared via onAuthStateChange
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'phone'>>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedProfile = await AuthService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}