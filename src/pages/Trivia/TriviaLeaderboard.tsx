import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Medal, 
  Star, 
  Sparkles,
  Home,
  RotateCw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { TriviaService, TriviaParticipant } from "@/services/triviaService";
import confetti from "canvas-confetti";

export default function TriviaLeaderboard() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [participants, setParticipants] = useState<TriviaParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    if (!roomId) return;
    loadLeaderboard();
  }, [roomId]);

  useEffect(() => {
    // Celebrate if user is in top 3
    if (userRank > 0 && userRank <= 3) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 500);
    }
  }, [userRank]);

  const loadLeaderboard = async () => {
    if (!roomId) return;
    
    try {
      const data = await TriviaService.getRoomLeaderboard(roomId);
      setParticipants(data);
      
      // Find user's rank
      const rank = data.findIndex((p) => p.user_id === user?.id) + 1;
      setUserRank(rank);
      
      // Clean up questions from localStorage
      localStorage.removeItem(`trivia_questions_${roomId}`);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
      case 2:
        return "from-gray-400/20 to-slate-400/20 border-gray-400/50";
      case 3:
        return "from-amber-600/20 to-orange-500/20 border-amber-600/50";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Calculating results...</p>
        </div>
      </div>
    );
  }

  const topPlayer = participants[0];
  const userParticipant = participants.find((p) => p.user_id === user?.id);

  return (
    <div className="min-h-screen px-4 py-16 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="inline-flex p-5 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full mb-4 shadow-lg">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Game Complete!</h1>
          <p className="text-muted-foreground text-lg">
            Amazing battle! Here are the results
          </p>
        </div>

        {/* Winner Highlight */}
        {topPlayer && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30 animate-in zoom-in duration-500">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-3 animate-pulse" />
              <h2 className="text-2xl font-bold mb-4">🏆 Champion 🏆</h2>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <Avatar className="w-20 h-20 border-4 border-yellow-500">
                  <AvatarImage src={topPlayer.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-500 text-white text-2xl">
                    {topPlayer.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{topPlayer.username}</h3>
              
              <div className="flex items-center justify-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-yellow-500">{topPlayer.score}</div>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-green-500">{topPlayer.correct_answers}</div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* User's Performance */}
        {userParticipant && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {userRank <= 3 ? '🎉' : '💪'}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Performance</p>
                  <h3 className="text-xl font-bold">
                    Rank #{userRank} - {userParticipant.score} points
                  </h3>
                </div>
              </div>
              
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                +{userParticipant.score} XP
              </Badge>
            </div>
          </Card>
        )}

        {/* Full Leaderboard */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Final Leaderboard
          </h2>
          
          <div className="space-y-3">
            {participants.map((participant, index) => {
              const rank = index + 1;
              const isUser = participant.user_id === user?.id;
              
              return (
                <Card 
                  key={participant.id}
                  className={`p-4 transition-all ${
                    rank <= 3 
                      ? `bg-gradient-to-r ${getRankColor(rank)} border-2` 
                      : ''
                  } ${isUser ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getMedalIcon(rank)}
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={participant.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate">{participant.username}</p>
                        {isUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {participant.correct_answers} correct answers
                      </p>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {participant.score}
                      </div>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate('/trivia')}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}

