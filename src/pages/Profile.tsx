import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Award, BarChart3, Settings, LogOut, Mail, User, Edit, Camera, Loader2, Sparkles, Target, BookOpen, Brain, MessageSquare, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { DashboardService } from "@/services/dashboardService";
import { LeaderboardService } from "@/services/leaderboardService";
import { AvatarSelector } from "@/components/AvatarSelector";
import { AuthService } from "@/services/authService";
import type { DashboardStats, LeaderboardEntry } from "@/types/gamification";
import type { Badge } from "@/types/user";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    learning_mode: "ai_chat",
    theme_preference: "system",
    persona: "friendly",
  });

  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [dashboardStats, userBadges, leaderboardPosition] = await Promise.all([
        DashboardService.getDashboardStats(user.id),
        fetchUserBadges(user.id),
        LeaderboardService.getUserPosition(user.id),
      ]);
      
      setStats(dashboardStats);
      setBadges(userBadges);
      setUserRank(leaderboardPosition);
    } catch (error: any) {
      console.error("Failed to load profile data:", error);
      if (error?.message && !error.message.includes("not found")) {
        toast.error("Failed to load some profile data");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
      setEditForm({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        learning_mode: user.learning_mode || "ai_chat",
        theme_preference: user.theme_preference || "system",
        persona: user.persona || "friendly",
      });
    }
  }, [user, loadUserData]);

  const fetchUserBadges = async (userId: string): Promise<Badge[]> => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error("Failed to fetch badges:", error);
      return [];
    }

    return data || [];
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Reset form when canceling
      setEditForm({
        name: user?.name || "",
        username: user?.username || "",
        bio: user?.bio || "",
        learning_mode: user?.learning_mode || "ai_chat",
        theme_preference: user?.theme_preference || "system",
        persona: user?.persona || "friendly",
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleUsernameChange = async (value: string) => {
    setEditForm({ ...editForm, username: value });
    
    if (value && value !== user?.username) {
      setCheckingUsername(true);
      const isAvailable = await AuthService.checkUsernameAvailability(value, user?.id);
      setCheckingUsername(false);
      
      if (!isAvailable) {
        toast.error("Username is already taken");
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (editForm.username && editForm.username !== user?.username) {
      const isAvailable = await AuthService.checkUsernameAvailability(editForm.username, user?.id);
      if (!isAvailable) {
        toast.error("Username is already taken");
        return;
      }
    }

    try {
      setSaving(true);
      await updateProfile({
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        learning_mode: editForm.learning_mode,
        theme_preference: editForm.theme_preference,
        persona: editForm.persona,
      });
      
      setIsEditMode(false);
      toast.success("Profile updated successfully! ✨");
      await loadUserData();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      await updateProfile({ avatar: avatarUrl });
      toast.success("Avatar updated successfully! 🎨");
      await loadUserData();
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const getLearningModeIcon = (mode: string) => {
    switch (mode) {
      case "ai_chat": return <MessageSquare className="w-4 h-4" />;
      case "stories": return <BookOpen className="w-4 h-4" />;
      case "whiteboard": return <Palette className="w-4 h-4" />;
      case "quiz": return <Brain className="w-4 h-4" />;
      case "tutoring": return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getLearningModeLabel = (mode: string) => {
    switch (mode) {
      case "ai_chat": return "AI Chat";
      case "stories": return "Stories";
      case "whiteboard": return "Whiteboard";
      case "quiz": return "Quiz";
      case "tutoring": return "Tutoring";
      default: return "AI Chat";
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 animate-in fade-in duration-500">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header Card */}
        <Card className="p-6 md:p-8 mb-8 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 opacity-50" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <Avatar className="relative w-32 h-32 border-4 border-primary/20 shadow-xl transition-all duration-300 hover:scale-105">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setAvatarDialogOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            
            {/* User Info Section */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-in slide-in-from-bottom duration-500">
                  {user.name}
                </h1>
                {user.username && (
                  <p className="text-muted-foreground font-medium">@{user.username}</p>
                )}
              </div>

              {user.bio && (
                <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                  {user.bio}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              {user.learning_mode && (
                <div className="flex items-center gap-2 text-primary justify-center md:justify-start">
                  {getLearningModeIcon(user.learning_mode)}
                  <span className="text-sm font-medium">
                    Preferred: {getLearningModeLabel(user.learning_mode)}
                  </span>
                </div>
              )}
              
              {/* Stats Row */}
              <div className="flex gap-6 justify-center md:justify-start flex-wrap pt-2">
                <div className="text-center transition-transform hover:scale-110 duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-1">
                    {user.level}
                    <Sparkles className="w-5 h-5" />
                  </p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
                <div className="text-center transition-transform hover:scale-110 duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-secondary">{user.xp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center transition-transform hover:scale-110 duration-300">
                  <p className="text-2xl md:text-3xl font-bold text-accent">{badges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button 
                variant={isEditMode ? "default" : "outline"} 
                onClick={handleEditToggle}
                className="transition-all duration-300"
              >
                {isEditMode ? "Cancel" : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleLogout} className="transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Card>

        {/* Edit Mode Card */}
        {isEditMode && (
          <Card className="p-6 md:p-8 mb-8 border-2 border-primary/20 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Edit Profile</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name *
                </Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your display name"
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <span>@</span>
                  Username
                  {checkingUsername && <Loader2 className="w-3 h-3 animate-spin" />}
                </Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio / About Me</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={200}
                  className="resize-none transition-all focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {editForm.bio.length}/200 characters
                </p>
              </div>

              {/* Learning Mode */}
              <div className="space-y-2">
                <Label htmlFor="learning_mode" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Preferred Learning Mode
                </Label>
                <Select
                  value={editForm.learning_mode}
                  onValueChange={(value) => setEditForm({ ...editForm, learning_mode: value })}
                >
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_chat">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        AI Chat
                      </div>
                    </SelectItem>
                    <SelectItem value="stories">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Stories
                      </div>
                    </SelectItem>
                    <SelectItem value="whiteboard">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Whiteboard
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Quiz
                      </div>
                    </SelectItem>
                    <SelectItem value="tutoring">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Tutoring
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Preference */}
              <div className="space-y-2">
                <Label htmlFor="theme" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Theme Preference
                </Label>
                <Select
                  value={editForm.theme_preference}
                  onValueChange={(value) => {
                    setEditForm({ ...editForm, theme_preference: value });
                    // Apply theme immediately
                    if (value === 'light') {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('theme', 'light');
                    } else if (value === 'dark') {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('theme', 'dark');
                    } else {
                      localStorage.removeItem('theme');
                      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      document.documentElement.classList.toggle('dark', prefersDark);
                    }
                  }}
                >
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light</SelectItem>
                    <SelectItem value="dark">🌙 Dark</SelectItem>
                    <SelectItem value="system">💻 System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Persona */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="persona" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Learning Persona
                </Label>
                <Select
                  value={editForm.persona}
                  onValueChange={(value) => setEditForm({ ...editForm, persona: value })}
                >
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">😊 Friendly - Supportive and encouraging</SelectItem>
                    <SelectItem value="strict">📚 Strict - Disciplined and focused</SelectItem>
                    <SelectItem value="fun">🎉 Fun - Playful and energetic</SelectItem>
                    <SelectItem value="scholar">🎓 Scholar - Academic and detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving || checkingUsername}
                className="flex-1 md:flex-none transition-all duration-300 hover:shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Profile Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-card p-2">
            <TabsTrigger value="stats" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="transition-all data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Award className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="transition-all data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Trophy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Lessons</h3>
                </div>
                <p className="text-4xl font-bold text-primary mb-2">
                  {stats?.lessons.completed || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats?.lessons.completion_rate || 0}% completion rate
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-secondary/5 to-secondary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Brain className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg">Quiz Average</h3>
                </div>
                <p className="text-4xl font-bold text-secondary mb-2">
                  {stats?.quizzes.average_score || 0}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats?.quizzes.completed || 0} quizzes completed
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-accent/5 to-accent/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg">Perfect Scores</h3>
                </div>
                <p className="text-4xl font-bold text-accent mb-2">
                  {stats?.quizzes.perfect_scores || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  100% quiz scores
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/5 to-secondary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Total XP</h3>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stats?.xp.total || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Level {stats?.xp.level || 1}
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/5 to-accent/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">In Progress</h3>
                </div>
                <p className="text-4xl font-bold text-primary mb-2">
                  {stats?.lessons.in_progress || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Continue your journey
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {badges.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-2xl font-semibold mb-3">No Badges Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start learning and completing quizzes to earn your first badge! 🎯
                </p>
                <Button className="mt-6" onClick={() => navigate("/dashboard")}>
                  Start Learning
                </Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge, index) => (
                  <Card 
                    key={badge.id} 
                    className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-6xl mb-4 text-center">{badge.badge_icon}</div>
                    <h3 className="font-semibold text-lg mb-2 text-center">{badge.badge_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      {badge.badge_description}
                    </p>
                    <p className="text-xs text-muted-foreground text-center border-t pt-3">
                      🗓️ Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Your Ranking
              </h3>
              <div className="space-y-4">
                {userRank ? (
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary">#{userRank.rank || '-'}</span>
                      <Avatar className="w-14 h-14 border-2 border-primary/30">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">{user.name} (You)</p>
                        <p className="text-sm text-muted-foreground capitalize">{user.persona || 'Student'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {userRank.total_xp || user.xp} XP
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>Loading your rank...</p>
                  </div>
                )}
                
                <Button className="w-full transition-all hover:shadow-lg" onClick={() => navigate("/leaderboard")}>
                  <Trophy className="w-4 h-4 mr-2" />
                  View Full Leaderboard
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Account Settings
              </h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 pb-6 border-b">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-lg font-medium mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg font-medium mt-1 break-all">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-lg font-medium mt-1">@{user.username || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Learning Persona</label>
                    <p className="text-lg font-medium mt-1 capitalize">{user.persona || 'friendly'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preferred Mode</label>
                    <p className="text-lg font-medium mt-1 capitalize flex items-center gap-2">
                      {user.learning_mode && getLearningModeIcon(user.learning_mode)}
                      {user.learning_mode ? getLearningModeLabel(user.learning_mode) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Theme</label>
                    <p className="text-lg font-medium mt-1 capitalize">{user.theme_preference || 'system'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="default" onClick={() => setIsEditMode(true)} className="transition-all hover:shadow-lg">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={() => setAvatarDialogOpen(true)} className="transition-all hover:shadow-lg">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Avatar
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Avatar Selector Dialog */}
        <AvatarSelector
          open={avatarDialogOpen}
          onClose={() => setAvatarDialogOpen(false)}
          currentAvatar={user.avatar}
          onSelect={handleAvatarSelect}
        />
      </div>
    </div>
  );
}

