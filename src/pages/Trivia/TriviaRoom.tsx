import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Crown,
  LogOut,
  Play,
  Loader2,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { TriviaService, TriviaParticipant, TriviaRoom as TriviaRoomType } from "@/services/triviaService";
import { ProfilePreview } from "@/components/ProfilePreview";
import { supabase } from "@/lib/supabaseClient";

export default function TriviaRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<TriviaRoomType | null>(null);
  const [participants, setParticipants] = useState<TriviaParticipant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [friends, setFriends] = useState<any[]>([]);
  const [inviting, setInviting] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const categories = [
    { value: "general", label: "General Knowledge" },
    { value: "science", label: "Science & Technology" },
    { value: "history", label: "History" },
    { value: "mathematics", label: "Mathematics" },
    { value: "geography", label: "Geography" },
    { value: "literature", label: "Literature" },
    { value: "arts", label: "Arts & Culture" },
    { value: "sports", label: "Sports" },
  ];

  useEffect(() => {
    if (!roomId || !user) return;

    // Get initial room data
    loadRoomData();
    loadParticipants();
    // Load friends with presence
    TriviaService.listFriendsWithPresence(user.id).then(setFriends).catch(() => {});

    // Subscribe to room changes with better handling
    const roomChannel = supabase
      .channel(`room-${roomId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id },
        },
      })
      .on(
        'broadcast',
        { event: 'game_starting' },
        (payload: any) => {
          console.log('🎮 Received game starting broadcast:', payload);
          // Store questions in localStorage so game page has them
          if (payload.payload.questions && payload.payload.roomId === roomId) {
            localStorage.setItem(
              `trivia_questions_${roomId}`,
              JSON.stringify(payload.payload.questions)
            );
            console.log('✅ Questions stored in localStorage:', payload.payload.questions.length);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trivia_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log('Room updated:', payload);
          const updatedRoom = payload.new as TriviaRoomType;
          setRoom(updatedRoom);
          
          // If game started, navigate to game
          if (updatedRoom.game_started) {
            toast.success("Game is starting!");
            setTimeout(() => {
              navigate(`/trivia/game/${roomId}`);
            }, 1000);
          }
        }
      )
      .subscribe((status) => {
        console.log('Room channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to room updates and broadcasts');
        }
      });

    // Subscribe to participants changes
    const participantsChannel = supabase
      .channel(`participants-${roomId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: '' },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trivia_participants',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('👤 New participant joined:', payload.new);
          loadParticipants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'trivia_participants',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('👋 Participant left:', payload.old);
          loadParticipants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trivia_participants',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('📊 Participant updated:', payload.new);
          loadParticipants();
        }
      )
      .subscribe((status) => {
        console.log('Participants channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to participant updates (INSERT, UPDATE, DELETE)');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to participants');
        }
      });

    return () => {
      console.log('Unsubscribing from channels');
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [roomId, user, navigate]);

  const loadRoomData = async () => {
    if (!roomId) return;
    
    try {
      const { data, error } = await supabase
        .from('trivia_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      
      const roomData = data as TriviaRoomType;
      setRoom(roomData);
      setIsHost(roomData.host_id === user?.id);
      setRoomCode(location.state?.roomCode || roomData.room_code);
      
      // Check if game already started
      if (roomData.game_started) {
        navigate(`/trivia/game/${roomId}`);
      }
    } catch (error: any) {
      console.error('Failed to load room:', error);
      toast.error("Room not found");
      navigate('/trivia');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    if (!roomId) return;
    const data = await TriviaService.getRoomParticipants(roomId);
    setParticipants(data);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!roomId || !isHost) return;
    
    if (participants.length < 1) {
      toast.error("Need at least 1 player to start");
      return;
    }

    setIsStarting(true);
    try {
      // Generate trivia questions with selected category and difficulty
      const categoryLabel = categories.find(c => c.value === selectedCategory)?.label || "General Knowledge";
      toast.info(`Generating ${selectedDifficulty} questions about ${categoryLabel}...`);
      
      const questions = await TriviaService.generateTriviaQuestions(10, selectedDifficulty, selectedCategory);
      
      // Store questions in localStorage for ALL players
      localStorage.setItem(`trivia_questions_${roomId}`, JSON.stringify(questions));
      
      // Broadcast questions to all players via Realtime
      const roomChannel = supabase.channel(`room-${roomId}`);
      await roomChannel.send({
        type: 'broadcast',
        event: 'game_starting',
        payload: { questions, roomId },
      });
      
      console.log('Broadcasting questions to all players:', questions.length);
      
      // Start the game (updates database)
      await TriviaService.startGame(roomId, questions);
      
      toast.success("Game starting!");
      setTimeout(() => {
        navigate(`/trivia/game/${roomId}`);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to start game:', error);
      toast.error("Failed to start game", { description: error.message });
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId || !user) return;
    
    try {
      await TriviaService.leaveRoom(roomId, user.id);
      toast.success("Left the room");
      navigate('/trivia');
    } catch (error) {
      console.error('Failed to leave room:', error);
      toast.error("Failed to leave room");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{room.room_name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize">
                  {room.mode} Mode
                </Badge>
                <Badge variant="secondary">
                  {participants.length}/{room.max_players} Players
                </Badge>
              </div>
            </div>
            
            {roomCode && (
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Room Code</p>
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                    <span className="text-2xl font-bold tracking-widest">{roomCode}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCode}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Friends Online - Invite */}
        {isHost && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Invite Friends</h2>
              <span className="text-muted-foreground text-sm">{friends.length} friends</span>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {friends.map((f) => (
                <Card key={f.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedProfile(f.id)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10"><AvatarImage src={f.avatar_url || undefined} /><AvatarFallback>{(f.name||'?').charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.presence?.status === 'online' ? 'Online' : f.presence?.status === 'away' ? 'Away' : `Last active ${new Date(f.presence?.last_active_at || 0).toLocaleTimeString()}`}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" disabled={!!inviting} onClick={async (e)=>{
                    e.stopPropagation();
                    if (!roomId || !user) return;
                    try {
                      setInviting(f.id);
                      await TriviaService.inviteFriend(roomId, f.id, { id: user.id, name: user.name });
                      toast.success(`Invited ${f.name}`);
                    } catch (e:any) {
                      toast.error('Failed to invite',{ description: e.message});
                    } finally {
                      setInviting(null);
                    }
                  }}>Invite</Button>
                </Card>
              ))}
              {friends.length === 0 && (
                <div className="text-sm text-muted-foreground">No friends yet. Add some from Friends page.</div>
              )}
            </div>
          </Card>
        )}

        {/* Participants Grid */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players in Lobby
            </h2>
            <span className="text-muted-foreground">
              {participants.length} {participants.length === 1 ? 'player' : 'players'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <Card key={participant.id} className="p-4 relative">
                {participant.user_id === room.host_id && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-1.5 shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={participant.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                      {participant.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{participant.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {participant.user_id === room.host_id ? 'Host' : 'Player'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Waiting for players to join...</p>
            </div>
          )}
        </Card>

        {/* Quiz Settings (Host Only) */}
        {isHost && (
          <Card className="p-6 mb-6 border-2 border-primary/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Quiz Settings
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Category Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>AI will generate 10 questions based on your selection</span>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="outline"
              onClick={handleLeaveRoom}
              className="sm:order-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Room
            </Button>

            {isHost ? (
              <Button
                onClick={handleStartGame}
                disabled={isStarting || participants.length < 1}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 sm:order-2"
              >
                {isStarting ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Game ({participants.length} Players)
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground sm:order-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for host to start...</span>
              </div>
            )}
          </div>

          {isHost && participants.length < 1 && (
            <p className="text-sm text-center text-muted-foreground mt-3">
              Need at least 1 player to start the game
            </p>
          )}
        </Card>
      </div>

      {/* Profile Preview */}
      <ProfilePreview
        userId={selectedProfile || ''}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  );
}

