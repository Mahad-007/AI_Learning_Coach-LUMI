import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import AOS from "aos";
import { useBackend } from "@/hooks/useBackend";
import type { LeaderboardResponse, LeaderboardEntry } from "@/types/gamification";
import { toast } from "sonner";

export default function Leaderboard() {
  const backend = useBackend();
  const [selectedTab, setSelectedTab] = useState<"global" | "weekly" | "monthly">("global");
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await backend.leaderboard.getAll();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !leaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const currentLeaderboard = 
    selectedTab === "weekly" ? leaderboard.weekly :
    selectedTab === "monthly" ? leaderboard.monthly :
    leaderboard.global;

  const getXPValue = (entry: LeaderboardEntry) => {
    if (selectedTab === "weekly") return entry.weekly_xp;
    if (selectedTab === "monthly") return entry.monthly_xp;
    return entry.total_xp;
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8" data-aos="fade-down">
          <div className="inline-flex p-4 bg-gradient-primary rounded-full mb-4">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-lg text-muted-foreground">
            Compete with learners worldwide and climb to the top!
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-8" data-aos="fade-up">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="weekly">📅 Weekly</TabsTrigger>
            <TabsTrigger value="monthly">🗓️ Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {/* Top 3 Podium */}
            {currentLeaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8" data-aos="zoom-in">
                {/* 2nd Place */}
                <div className="text-center pt-12">
                  <Card className="p-6 hover:shadow-lg transition-all duration-300">
                    <div className="text-5xl mb-2">
                      {currentLeaderboard[1].avatar_url ? (
                        <img src={currentLeaderboard[1].avatar_url} alt="" className="w-16 h-16 rounded-full mx-auto" />
                      ) : (
                        "👨"
                      )}
                    </div>
                    <div className="text-3xl mb-2">🥈</div>
                    <p className="font-bold mb-1">{currentLeaderboard[1].user_name}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Level {currentLeaderboard[1].level}
                    </p>
                    <div className="inline-flex items-center gap-1 bg-secondary/20 rounded-full px-3 py-1">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium">
                        {getXPValue(currentLeaderboard[1]).toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <Card className="p-6 hover:shadow-glow transition-all duration-300 bg-gradient-to-b from-primary/5 to-transparent border-primary/50">
                    <div className="text-6xl mb-2">
                      {currentLeaderboard[0].avatar_url ? (
                        <img src={currentLeaderboard[0].avatar_url} alt="" className="w-20 h-20 rounded-full mx-auto" />
                      ) : (
                        "👩"
                      )}
                    </div>
                    <div className="text-4xl mb-2">👑</div>
                    <p className="font-bold text-lg mb-1">{currentLeaderboard[0].user_name}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Level {currentLeaderboard[0].level}
                    </p>
                    <div className="inline-flex items-center gap-1 bg-primary/20 rounded-full px-3 py-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold">
                        {getXPValue(currentLeaderboard[0]).toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="text-center pt-12">
                  <Card className="p-6 hover:shadow-lg transition-all duration-300">
                    <div className="text-5xl mb-2">
                      {currentLeaderboard[2].avatar_url ? (
                        <img src={currentLeaderboard[2].avatar_url} alt="" className="w-16 h-16 rounded-full mx-auto" />
                      ) : (
                        "👩"
                      )}
                    </div>
                    <div className="text-3xl mb-2">🥉</div>
                    <p className="font-bold mb-1">{currentLeaderboard[2].user_name}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Level {currentLeaderboard[2].level}
                    </p>
                    <div className="inline-flex items-center gap-1 bg-accent/20 rounded-full px-3 py-1">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">
                        {getXPValue(currentLeaderboard[2]).toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <Card className="overflow-hidden" data-aos="fade-up">
              <div className="divide-y divide-border">
                {currentLeaderboard.slice(3).length > 0 ? (
                  currentLeaderboard.slice(3).map((user, index) => (
                    <div
                      key={user.user_id}
                      className={cn(
                        "p-4 flex items-center gap-4 transition-all duration-300 hover:bg-muted/50",
                        leaderboard.user_position && user.user_id === leaderboard.user_position.user_id && 
                        "bg-primary/5 border-l-4 border-primary"
                      )}
                      data-aos="fade-left"
                      data-aos-delay={index * 50}
                    >
                      <div className="w-8 text-center font-bold text-muted-foreground">
                        #{user.rank}
                      </div>
                      <div className="text-4xl">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                        ) : (
                          "😊"
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-semibold",
                          leaderboard.user_position && user.user_id === leaderboard.user_position.user_id && "text-primary"
                        )}>
                          {user.user_name}
                        </p>
                        <p className="text-sm text-muted-foreground">Level {user.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-bold">{getXPValue(user).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No more entries to show
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats */}
        {leaderboard.user_position && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-aos="fade-up">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">#{leaderboard.user_position.rank}</p>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Medal className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">{leaderboard.user_position.total_xp.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Award className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">{leaderboard.user_position.weekly_xp.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">XP This Week</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
