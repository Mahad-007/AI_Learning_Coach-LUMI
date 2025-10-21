import { supabase } from '../lib/supabaseClient';
import { EmailValidation } from '../lib/emailValidation';
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
      // Validate email format and check for disposable emails
      const emailValidation = EmailValidation.validateEmail(data.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email address');
      }

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

      // Generate verification token
      const verificationToken = await this.generateVerificationToken(authData.user.id);

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
          email_verified: false,
          verification_token: verificationToken,
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

      // Send verification email
      await this.sendVerificationEmail(data.email, data.name, verificationToken);

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
      // Validate email format and check for disposable emails
      const emailValidation = EmailValidation.validateEmail(data.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email address');
      }

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

      // Check if email is verified
      if (!userData.email_verified || userData.email_verified === null || userData.email_verified === undefined) {
        // Return redirect response for unverified users
        throw new Error(JSON.stringify({ 
          redirect: '/verify',
          message: 'Please verify your email address to continue'
        }));
      }

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
   * Verify user email with token
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Verifying email with token:', token);
      
      const { data, error } = await supabase.rpc('verify_user_email', {
        token_value: token
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      console.log('Email verification result:', data);
      return data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      return { success: false, error: error.message || 'Verification failed' };
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email_verified')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      if (userData.email_verified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = await this.generateVerificationToken(userData.id);

      // Send verification email
      await this.sendVerificationEmail(email, userData.name, verificationToken);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  /**
   * Generate verification token
   */
  private static async generateVerificationToken(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_verification_token', {
        user_uuid: userId
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Generate token error:', error);
      throw new Error('Failed to generate verification token');
    }
  }

  /**
   * Send verification email
   */
  private static async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    try {
      const emailServiceUrl = process.env.VITE_EMAIL_SERVER_URL || 'https://www.lumi-learn.app/api';
      
      console.log('Sending verification email to:', email);
      console.log('Email service URL:', emailServiceUrl);
      console.log('Token:', token);
      
      const response = await fetch(`${emailServiceUrl}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email service error:', errorData);
        throw new Error(errorData.error || 'Failed to send verification email');
      }

      const result = await response.json();
      console.log('Verification email sent successfully:', result);
    } catch (error: any) {
      console.error('Send verification email error:', error);
      // Don't throw error here to avoid breaking signup flow
      // Email sending failure shouldn't prevent account creation
      console.warn('Email sending failed, but account was created successfully');
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

