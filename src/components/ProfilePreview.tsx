import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Award, 
  BarChart3, 
  Mail, 
  Calendar,
  Target,
  BookOpen,
  Brain,
  MessageSquare,
  Palette,
  Users
} from 'lucide-react';
import { FriendsService } from '@/services/friendsService';
import { DashboardService } from '@/services/dashboardService';
import { LeaderboardService } from '@/services/leaderboardService';
import { AchievementsService } from '@/services/achievementsService';
import { supabase } from '@/lib/supabaseClient';
import type { DashboardStats, LeaderboardEntry } from '@/types/gamification';
import type { Badge as UserBadge } from '@/types/user';

interface ProfilePreviewProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUnfriend?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
}

interface FriendProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  learning_mode?: string;
  persona?: string;
  created_at: string;
  status?: string;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  userId,
  isOpen,
  onClose,
  onUnfriend,
  onSendMessage
}) => {
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [rank, setRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData();
    }
  }, [isOpen, userId]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Get basic profile info
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Get stats, badges, and rank in parallel
      const [statsData, badgesData, rankData] = await Promise.allSettled([
        DashboardService.getUserStats(userId),
        AchievementsService.getUserBadges(userId),
        LeaderboardService.getUserRank(userId)
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (badgesData.status === 'fulfilled') {
        setBadges(badgesData.value);
      }
      if (rankData.status === 'fulfilled') {
        setRank(rankData.value);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLearningModeIcon = (mode: string) => {
    switch (mode) {
      case 'ai_chat': return <MessageSquare className="w-4 h-4" />;
      case 'interactive_lessons': return <BookOpen className="w-4 h-4" />;
      case 'quiz_focused': return <Brain className="w-4 h-4" />;
      case 'visual_learning': return <Palette className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getLearningModeLabel = (mode: string) => {
    switch (mode) {
      case 'ai_chat': return 'AI Chat';
      case 'interactive_lessons': return 'Interactive Lessons';
      case 'quiz_focused': return 'Quiz Focused';
      case 'visual_learning': return 'Visual Learning';
      default: return 'General';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Preview</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback className="text-lg">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {profile.status && (
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    profile.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'
                  }`}></span>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                )}
                <div className="flex items-center gap-2 text-muted-foreground mt-2 justify-center sm:justify-start">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.learning_mode && (
                  <div className="flex items-center gap-2 text-primary mt-2 justify-center sm:justify-start">
                    {getLearningModeIcon(profile.learning_mode)}
                    <span className="text-sm font-medium">
                      {getLearningModeLabel(profile.learning_mode)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground mt-2 justify-center sm:justify-start">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center sm:justify-start">
              {onSendMessage && (
                <Button onClick={() => onSendMessage(profile.id)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              )}
              {onUnfriend && (
                <Button variant="destructive" onClick={() => onUnfriend(profile.id)}>
                  <Users className="w-4 h-4 mr-2" />
                  Unfriend
                </Button>
              )}
            </div>

            <Separator />

            {/* Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Learning Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.total_xp}</div>
                      <div className="text-sm text-muted-foreground">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.level}</div>
                      <div className="text-sm text-muted-foreground">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.streak}</div>
                      <div className="text-sm text-muted-foreground">Day Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.completed_lessons}</div>
                      <div className="text-sm text-muted-foreground">Lessons</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rank */}
            {rank && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Leaderboard Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">#{rank.rank}</div>
                    <div className="text-sm text-muted-foreground">Global Ranking</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Achievements ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {badges.slice(0, 6).map((badge) => (
                      <Badge key={badge.id} variant="secondary" className="text-xs">
                        {badge.name}
                      </Badge>
                    ))}
                    {badges.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{badges.length - 6} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load profile</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
