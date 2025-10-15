import { supabase } from '../lib/supabaseClient';
import type { SignupData, LoginData, AuthResponse, User } from '../types/user';

/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */

export class AuthService {
  /**
   * Register a new user
   */
  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          xp: 0,
          level: 1,
          streak: 0,
          persona: 'friendly',
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create initial leaderboard entry
      await supabase.from('leaderboard').insert({
        user_id: authData.user.id,
        total_xp: 0,
        weekly_xp: 0,
        monthly_xp: 0,
        rank: 0,
      });

      // Award first user badge
      await this.awardFirstUserBadge(authData.user.id);

      return {
        user: userData as User,
        session: {
          access_token: authData.session?.access_token || '',
          refresh_token: authData.session?.refresh_token || '',
          expires_at: authData.session?.expires_at || 0,
        },
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  /**
   * Login existing user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Login failed');

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      // Ensure leaderboard entry exists (for users created before this fix)
      const { data: leaderboardEntry } = await supabase
        .from('leaderboard')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      if (!leaderboardEntry) {
        await supabase.from('leaderboard').insert({
          user_id: authData.user.id,
          total_xp: userData.xp || 0,
          weekly_xp: 0,
          monthly_xp: 0,
          rank: 0,
        });
      }

      return {
        user: userData as User,
        session: {
          access_token: authData.session?.access_token || '',
          refresh_token: authData.session?.refresh_token || '',
          expires_at: authData.session?.expires_at || 0,
        },
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) return null;

      return userData as User;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if username is available
   */
  static async checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      
      // Username is available if no data, or if it belongs to current user
      return !data || (currentUserId && data.id === currentUserId);
    } catch (error: any) {
      console.error('Check username error:', error);
      return false;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Check username availability if username is being updated
      if (updates.username) {
        const isAvailable = await this.checkUsernameAvailability(updates.username, userId);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data as User;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Update user persona
   */
  static async updatePersona(userId: string, persona: User['persona']): Promise<User> {
    return this.updateProfile(userId, { persona });
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      // Use the current origin (localhost in dev, production domain in prod)
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  /**
   * Private helper: Award first user badge
   */
  private static async awardFirstUserBadge(userId: string): Promise<void> {
    try {
      await supabase.from('badges').insert({
        user_id: userId,
        badge_type: 'milestone',
        badge_name: 'Welcome Aboard',
        badge_description: 'Created your account and joined the learning community',
        badge_icon: '🎉',
      });
    } catch (error) {
      console.error('Failed to award first user badge:', error);
    }
  }

  /**
   * Private helper: Update login streak
   */
  private static async updateLoginStreak(userId: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('streak, updated_at')
        .eq('id', userId)
        .single();

      if (!user) return;

      const lastLogin = new Date(user.updated_at);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = user.streak;

      if (daysDiff === 1) {
        // Consecutive day login
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If daysDiff === 0, same day login, keep streak

      await supabase
        .from('users')
        .update({ 
          streak: newStreak,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update login streak:', error);
    }
  }
}

export default AuthService;

