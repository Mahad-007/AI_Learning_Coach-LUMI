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
  const [selectedTab, setSelectedTab] = useState<"global" | "friends">("global");
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
    selectedTab === "friends" ? leaderboard.global : 
    leaderboard.global;

  const getXPValue = (entry: LeaderboardEntry) => {
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
          <TabsList className="grid w-full grid-cols-2 mb-8" data-aos="fade-up">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="friends">👥 Friends</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {/* Friends Coming Soon Message */}
            {selectedTab === "friends" && (
              <Card className="p-8 mb-6 text-center bg-gradient-to-br from-primary/10 to-purple-500/10">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Friends Leaderboard Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with friends and compete on a private leaderboard. This feature is currently under development.
                </p>
                <p className="text-sm text-muted-foreground">
                  For now, check out the Global leaderboard to see how you rank against all learners!
                </p>
              </Card>
            )}

            {/* Top 3 Podium - Show if at least 1 user and not on friends tab */}
            {selectedTab !== "friends" && currentLeaderboard.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8" data-aos="zoom-in">
                {/* 2nd Place - only show if exists */}
                {currentLeaderboard[1] && (
                  <div className="text-center pt-12">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300">
                      <div className="mb-2 flex justify-center">
                        {currentLeaderboard[1].avatar_url ? (
                          <img src={currentLeaderboard[1].avatar_url} alt="" className="w-16 h-16 rounded-full" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/30 flex items-center justify-center text-2xl font-bold text-secondary">
                            {currentLeaderboard[1].user_name.charAt(0).toUpperCase()}
                          </div>
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
                )}

                {/* 1st Place - always show if any users */}
                <div className="text-center">
                  <Card className="p-6 hover:shadow-glow transition-all duration-300 bg-gradient-to-b from-primary/5 to-transparent border-primary/50">
                    <div className="mb-2 flex justify-center">
                      {currentLeaderboard[0].avatar_url ? (
                        <img src={currentLeaderboard[0].avatar_url} alt="" className="w-20 h-20 rounded-full" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-3xl font-bold text-primary">
                          {currentLeaderboard[0].user_name.charAt(0).toUpperCase()}
                        </div>
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

                {/* 3rd Place - only show if exists */}
                {currentLeaderboard[2] && (
                  <div className="text-center pt-12">
                    <Card className="p-6 hover:shadow-lg transition-all duration-300">
                      <div className="mb-2 flex justify-center">
                        {currentLeaderboard[2].avatar_url ? (
                          <img src={currentLeaderboard[2].avatar_url} alt="" className="w-16 h-16 rounded-full" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/30 flex items-center justify-center text-2xl font-bold text-accent">
                            {currentLeaderboard[2].user_name.charAt(0).toUpperCase()}
                          </div>
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
                )}
              </div>
            )}

            {/* Rest of Leaderboard - Only show if more than 3 users and not on friends tab */}
            {selectedTab !== "friends" && currentLeaderboard.length > 3 && (
              <Card className="overflow-hidden" data-aos="fade-up">
                <div className="divide-y divide-border">
                  {currentLeaderboard.slice(3).map((user, index) => (
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
                      <div className="flex items-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-lg font-bold text-muted-foreground">
                            {user.user_name.charAt(0).toUpperCase()}
                          </div>
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
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        {leaderboard.user_position && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-aos="fade-up">
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">#{leaderboard.user_position.rank}</p>
              <p className="text-sm text-muted-foreground">Your Global Rank</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Medal className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">{leaderboard.user_position.total_xp.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              <Award className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-2xl font-bold mb-1">Level {leaderboard.user_position.level}</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
