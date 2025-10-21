import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "@/services/authService";
import { GamificationService } from "@/services/gamificationService";
import { supabase } from "@/lib/supabaseClient";
import type { User as BackendUser } from "@/types/user";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  role: string;
  xp: number;
  level: number;
  avatar?: string;
  streak?: number;
  persona?: string;
  learning_mode?: string;
  theme_preference?: string;
  email_verified?: boolean;
  email_verified_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  // Real-time XP/Level updates
  useEffect(() => {
    if (!user) return;

    console.log('[AuthContext] Setting up realtime XP subscription for user:', user.id);

    const channel = supabase
      .channel(`user_xp:${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log('[AuthContext] User data updated in database:', payload.new);
        
        const updatedUser = payload.new as any;
        
        // Update local user state with new XP/level
        setUser(prev => {
          if (!prev) return prev;
          
          const xpChanged = prev.xp !== updatedUser.xp;
          const levelChanged = prev.level !== updatedUser.level;
          const emailVerifiedChanged = prev.email_verified !== updatedUser.email_verified;
          
          if (xpChanged || levelChanged || emailVerifiedChanged) {
            console.log(`[AuthContext] XP: ${prev.xp} → ${updatedUser.xp}, Level: ${prev.level} → ${updatedUser.level}, Email Verified: ${prev.email_verified} → ${updatedUser.email_verified}`);
          }
          
          return {
            ...prev,
            xp: updatedUser.xp,
            level: updatedUser.level,
            streak: updatedUser.streak,
            persona: updatedUser.persona,
            learning_mode: updatedUser.learning_mode,
            theme_preference: updatedUser.theme_preference,
            username: updatedUser.username,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar_url || prev.avatar,
            email_verified: updatedUser.email_verified,
            email_verified_at: updatedUser.email_verified_at,
          };
        });
      })
      .subscribe((status) => {
        console.log('[AuthContext] Realtime subscription status:', status);
      });

    return () => {
      console.log('[AuthContext] Cleaning up XP subscription');
      channel.unsubscribe();
    };
  }, [user?.id]);

  const checkUser = async () => {
    try {
      // Check if we have a valid session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('[AuthContext] No valid session found');
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          username: currentUser.username,
          bio: currentUser.bio,
          role: "student", // Default role
          xp: currentUser.xp,
          level: currentUser.level,
          avatar: currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
          streak: currentUser.streak,
          persona: currentUser.persona,
          learning_mode: currentUser.learning_mode,
          theme_preference: currentUser.theme_preference,
          email_verified: currentUser.email_verified,
          email_verified_at: currentUser.email_verified_at,
        });
      }
    } catch (error: any) {
      console.error("Auth check error:", error);
      // If it's an auth error, clear the session
      if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('JWT')) {
        await supabase.auth.signOut();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        username: response.user.username,
        bio: response.user.bio,
        role: "student",
        xp: response.user.xp,
        level: response.user.level,
        avatar: response.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
        streak: response.user.streak,
        persona: response.user.persona,
        learning_mode: response.user.learning_mode,
        theme_preference: response.user.theme_preference,
        email_verified: response.user.email_verified,
        email_verified_at: response.user.email_verified_at,
      });
      
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error: any) {
      // Check if it's a verification redirect error
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.redirect === '/verify') {
          // Don't show toast here - let the login page handle it
          // Throw a specific error that can be caught by the login page
          throw new Error('VERIFICATION_REQUIRED');
        }
      } catch (parseError) {
        // Not a JSON error, handle normally
        toast.error(error.message || "Login failed");
        throw error;
      }
      
      // If we get here, it means the JSON parsing succeeded but redirect wasn't '/verify'
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const signup = async (data: { name: string; email: string; password: string; role?: string }) => {
    try {
      const response = await AuthService.signup({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      
      // Don't set user in context until email is verified
      // The user will be redirected to verification page
      
      toast.success("Account created successfully! Please check your email to verify your account. 🎉");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = await AuthService.updateProfile(user.id, {
        name: updates.name,
        username: updates.username,
        bio: updates.bio,
        avatar_url: updates.avatar,
        persona: updates.persona as any,
        learning_mode: updates.learning_mode as any,
        theme_preference: updates.theme_preference as any,
      });
      
      setUser({
        ...user,
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar_url || user.avatar,
        persona: updatedUser.persona,
        learning_mode: updatedUser.learning_mode,
        theme_preference: updatedUser.theme_preference,
        xp: updatedUser.xp,
        level: updatedUser.level,
        streak: updatedUser.streak,
      });
      
      // Check and award special milestone badges (like Profile Pro)
      await GamificationService.checkSpecialMilestones(user.id);
      
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message || "Update failed");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      login, 
      signup, 
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
