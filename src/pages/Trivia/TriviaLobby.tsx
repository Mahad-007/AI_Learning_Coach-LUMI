import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Users, UserPlus, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { TriviaService } from "@/services/triviaService";

export default function TriviaLobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async (mode: 'global' | 'private' | 'friends') => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const { room, roomCode } = await TriviaService.createRoom(user.id, mode);
      
      // Join as host
      await TriviaService.joinRoom(user.id, user.name, roomCode || room.id, user.avatar);
      
      toast.success(
        mode === 'private' ? `Room created! Code: ${roomCode}` : "Room created!",
        { description: "Waiting for players to join..." }
      );
      
      navigate(`/trivia/room/${room.id}`, {
        state: { roomCode, isHost: true },
      });
    } catch (error: any) {
      toast.error("Failed to create room", { description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !joinCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    setIsJoining(true);
    try {
      const { room } = await TriviaService.joinRoom(
        user.id,
        user.name,
        joinCode.toUpperCase(),
        user.avatar
      );
      
      toast.success("Joined room successfully!");
      navigate(`/trivia/room/${room.id}`, {
        state: { roomCode: joinCode.toUpperCase(), isHost: false },
      });
    } catch (error: any) {
      toast.error("Failed to join room", { description: error.message });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500">
          <div className="inline-flex p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Trivia Battle Arena
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Challenge players worldwide, compete with friends, or battle in private rooms!
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Global Battle */}
          <Card className="p-6 hover:shadow-xl transition-all group border-2 hover:border-blue-500/50 animate-in fade-in slide-in-from-left duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full group-hover:scale-110 transition-transform">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold">Global Battle</h3>
              <p className="text-sm text-muted-foreground">
                Match with players worldwide. Up to 50 players!
              </p>
              <Button
                onClick={() => handleCreateRoom('global')}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Globe className="w-4 h-4 mr-2" />
                Join Global Battle
              </Button>
            </div>
          </Card>

          {/* Private Room */}
          <Card className="p-6 hover:shadow-xl transition-all group border-2 border-purple-500/30 relative animate-in fade-in zoom-in duration-500 delay-100">
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              POPULAR
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold">Private Room</h3>
              <p className="text-sm text-muted-foreground">
                Create a room and share the code with friends
              </p>
              <Button
                onClick={() => handleCreateRoom('private')}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isCreating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Create Private Room
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Friends Battle */}
          <Card className="p-6 hover:shadow-xl transition-all group border-2 hover:border-green-500/50 animate-in fade-in slide-in-from-right duration-500 delay-200">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full group-hover:scale-110 transition-transform">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold">Friends Battle</h3>
              <p className="text-sm text-muted-foreground">
                Invite your learning buddies for a friendly match
              </p>
              <Button
                onClick={() => handleCreateRoom('friends')}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
            </div>
          </Card>
        </div>

        {/* Join Room Section */}
        <Card className="p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-500">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Have a Room Code?</h2>
            <p className="text-muted-foreground">Enter the code to join an existing battle</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter 6-character code (e.g., 7XK3P)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              maxLength={6}
              className="text-center text-xl font-bold tracking-widest uppercase"
            />
            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || joinCode.length < 5}
              size="lg"
              className="bg-gradient-primary"
            >
              {isJoining ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">10</div>
            <p className="text-sm text-muted-foreground">Questions per Battle</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">50</div>
            <p className="text-sm text-muted-foreground">Max Players per Room</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">10</div>
            <p className="text-sm text-muted-foreground">Points per Correct Answer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

