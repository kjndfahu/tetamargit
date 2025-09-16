import { supabase } from '@/config/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  // Sign up new user
  static async signUp(data: SignUpData) {
    const { email, password, firstName, lastName, phone } = data;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (authData.user && !authData.session) {
      throw new Error('Používateľ s týmto emailom už existuje.');
    }
    
    return authData;
  }

  // Sign in user
  static async signIn(data: SignInData) {
    const { email, password } = data;
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Nesprávne prihlasovacie údaje');
      }

      throw error;
    }

    return authData;
  }

  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  // Sign out user
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return null;
    }

    return user;
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}
