'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalAuthService, type Profile, type SignUpData, type SignInData } from './local-auth';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<Profile>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Load profile from server
        LocalAuthService.getUserProfile(userData.id).then(profileData => {
          setProfile(profileData);
          setLoading(false);
        }).catch(() => {
          // If profile loading fails, clear auth
          localStorage.removeItem('auth_user');
          setLoading(false);
        });
      } catch {
        localStorage.removeItem('auth_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const result = await response.json();
      setUser(result.user);
      setProfile(result.profile);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signin failed');
      }

      const result = await response.json();
      setUser(result.user);
      setProfile(result.profile);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('auth_user');
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Profile update failed');
      }

      const result = await response.json();
      setProfile(result.profile);
      return result.profile;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
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