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

    // Check if user already exists
    const userExists = await this.checkUserExists(email);
    if (userExists) {
      throw new Error('Používateľ s týmto emailom už existuje');
    }
    
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

      if (error.message === 'Email not confirmed') {
        throw new Error('E-mail nebol potvrdený');
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

  static async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (error) {
        // If error is 'PGRST116' it means no rows found, user doesn't exist
        if (error.code === 'PGRST116') {
          return false;
        }
        // For other errors, log and throw
        console.error('Error checking user existence:', error);
        throw error;
      }

      // If we got data back, user exists
      return data !== null;
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      throw error;
    }
  }
}
