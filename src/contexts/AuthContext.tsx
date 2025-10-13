import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "@/services/authService";
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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
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
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
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
      });
      
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error: any) {
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
      
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        username: response.user.username,
        bio: response.user.bio,
        role: data.role || "student",
        xp: response.user.xp,
        level: response.user.level,
        avatar: response.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
        streak: response.user.streak,
        persona: response.user.persona,
        learning_mode: response.user.learning_mode,
        theme_preference: response.user.theme_preference,
      });
      
      toast.success("Account created successfully! Welcome! 🎉");
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
