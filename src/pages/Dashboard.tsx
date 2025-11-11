import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, BookOpen, Clock, ArrowRight, Zap, MessageSquare, Brain, Calendar } from "lucide-react";
import AOS from "aos";
import { useAuth } from "@/contexts/AuthContext";
import { useBackend } from "@/hooks/useBackend";
import type { DashboardStats } from "@/types/gamification";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const backend = useBackend();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  }));

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
    loadDashboard();

    const interval = setInterval(() => {
      setCurrentDate(new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
      }));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await backend.dashboard.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonsCardClick = () => {
    navigate('/learn'); // Navigate to learn page
  };

  const handleBadgesCardClick = () => {
    navigate('/profile'); // Navigate to profile page for achievements/badges
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8" data-aos="fade-down">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{stats.user.name}!</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            "The expert in anything was once a beginner." - Keep going! 
          </p>
        </div>

        {/* XP Progress Bar */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8" data-aos="fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Level {stats.xp.level}</p>
              <p className="text-lg sm:text-2xl font-bold truncate">{stats.xp.total.toLocaleString()} / {stats.xp.xp_for_next_level.toLocaleString()} XP</p>
            </div>
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary shrink-0 ml-2" />
          </div>
          <Progress value={stats.xp.progress_percentage} className="h-2 sm:h-3" />
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">{(stats.xp.xp_for_next_level - stats.xp.total).toLocaleString()} XP to next level</p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card 
            className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105" 
            data-aos="zoom-in"
            onClick={handleLessonsCardClick}
          >
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-secondary" />
            <p className="text-xl sm:text-2xl font-bold mb-1">{stats.lessons.completed}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Lessons Completed</p>
          </Card>
          
          <Card 
            className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105" 
            data-aos="zoom-in" 
            data-aos-delay={100}
            onClick={handleBadgesCardClick}
          >
            <Award className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-accent" />
            <p className="text-xl sm:text-2xl font-bold mb-1">{stats.badges.total}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Badges Earned</p>
          </Card>

          {/* Progress to next level */}
          <Card 
            className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105" 
            data-aos="zoom-in" 
            data-aos-delay={200}
            onClick={() => navigate('/progress')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold">{currentDate}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Click to view progress calendar</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link to="/chat">
            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50" data-aos="fade-up">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-1">AI Chat Coach</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get personalized help</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/quiz">
            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-purple-500/50" data-aos="fade-up" data-aos-delay={100}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                  <img src="/logo.png" alt="Lumi Logo" className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-1">Take a Quiz</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Test your knowledge</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/trivia">
            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-amber-500/50 relative" data-aos="fade-up" data-aos-delay={200}>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                NEW
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-1">Trivia Battle</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Compete with others</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ongoing Lessons */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4" data-aos="fade-right">
              <h2 className="text-xl sm:text-2xl font-bold">Continue Learning</h2>
              <Button variant="ghost" size="sm" className="hidden sm:flex">View All</Button>
            </div>

            <div className="space-y-4">
              {stats.recent_activity.slice(0, 3).length > 0 ? (
                stats.recent_activity.slice(0, 3).map((activity, index) => (
                  <Card
                    key={index}
                    className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">{activity.description}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">{new Date(activity.timestamp).toLocaleString()}</span>
                          </span>
                          {activity.xp_gained > 0 && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                              +{activity.xp_gained} XP
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="group-hover:bg-primary/10 shrink-0">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">No recent activity. Start learning to see your progress!</p>
                </Card>
              )}
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div>
            <h2 className="text-2xl font-bold mb-4" data-aos="fade-left">
              Achievements
            </h2>
            <Card className="p-6" data-aos="fade-left" data-aos-delay={200}>
              <div className="grid grid-cols-3 gap-4">
                {stats.badges.recent.slice(0, 6).map((badge, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 bg-primary/10 hover:scale-110 cursor-pointer"
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <p className="text-xs text-center font-medium">{badge.name}</p>
                  </div>
                ))}
                {stats.badges.total === 0 && (
                  <div className="col-span-3 text-center text-muted-foreground text-sm">
                    Complete activities to earn badges!
                  </div>
                )}
              </div>
            </Card>

            {/* Activity Feed */}
            <h2 className="text-2xl font-bold mb-4 mt-8" data-aos="fade-left">
              Recent Activity
            </h2>
            <Card className="p-6" data-aos="fade-left" data-aos-delay={300}>
              <div className="space-y-4">
                {stats.recent_activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'lesson_completed' ? 'bg-success' :
                      activity.type === 'badge_earned' ? 'bg-primary' :
                      'bg-accent'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.recent_activity.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">No recent activity</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
