import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FriendsService } from '@/services/friendsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { ProfilePreview } from '@/components/ProfilePreview';
import { 
  Search, 
  UserPlus, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Mail,
  Heart,
  Star,
  Trophy,
  Flame
} from 'lucide-react';
import AOS from 'aos';

export default function Friends() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<{ isFriend: boolean; hasPendingRequest: boolean; requestStatus?: string } | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // Debounce the search query for better performance
  const debouncedQuery = useDebounce(query, 500);

  const refresh = useCallback(async () => {
    setFriendsLoading(true);
    try {
      console.log('Refreshing friends and requests...');
      const [f, r] = await Promise.all([FriendsService.listFriends(), FriendsService.listRequests()]);
      console.log('Friends loaded:', f);
      console.log('Requests loaded:', r);
      setFriends(f);
      setRequests(r);
    } catch (error) {
      console.error('Error refreshing friends:', error);
      toast({ title: "Failed to load friends", description: error instanceof Error ? error.message : 'Unknown error', variant: "destructive" });
    } finally {
      setFriendsLoading(false);
    }
  }, [toast]);

  const handleSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResult(null);
      setFriendshipStatus(null);
      return;
    }
    
    setLoading(true);
    try {
      const res = await FriendsService.searchByEmailOrUsername(debouncedQuery.trim());
      setResult(res);
      if (res) {
        const status = await FriendsService.checkFriendshipStatus(res.id);
        setFriendshipStatus(status);
      } else {
        setFriendshipStatus(null);
      }
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, toast]);

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
    refresh();
  }, [refresh]);

  // Auto-search when debounced query changes
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const sendInviteEmail = async (email: string) => {
    try {
      const response = await fetch(`/api/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, inviterName: user?.name, signupLink: `${window.location.origin}/signup` }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast({ title: "Invitation sent!", description: `An invitation has been sent to ${email}` });
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      toast({ 
        title: "Failed to send invitation", 
        description: error.message || 'Please try again later', 
        variant: "destructive" 
      });
    }
  };

  const sendFriendRequest = async (receiverId: string, receiverEmail?: string) => {
    try {
      await FriendsService.sendFriendRequest(receiverId);
      
      // Send email notification (don't fail the entire operation if email fails)
      if (receiverEmail) {
        try {
          await fetch(`/api/send-friend-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: receiverEmail, senderName: user?.name, link: `${window.location.origin}/friends` }),
          });
          toast({ title: "Friend request sent!", description: "The user will be notified via email." });
        } catch (emailError) {
          console.warn('Failed to send email notification:', emailError);
          toast({ title: "Friend request sent!", description: "The user will be notified in the app." });
        }
      } else {
        toast({ title: "Friend request sent!", description: "The user will be notified in the app." });
      }
      
      await refresh();
      
      // Update friendship status
      const status = await FriendsService.checkFriendshipStatus(receiverId);
      setFriendshipStatus(status);
    } catch (error: any) {
      toast({ title: "Failed to send friend request", description: error.message, variant: "destructive" });
    }
  };

  const respond = async (id: string, accept: boolean) => {
    try {
      await FriendsService.respond(id, accept);
      toast({ title: accept ? "Friend request accepted!" : "Friend request declined" });
      await refresh();
    } catch (error: any) {
      toast({ title: "Failed to respond", description: error.message, variant: "destructive" });
    }
  };

  const unfriend = async (friendId: string) => {
    try {
      await FriendsService.unfriend(friendId);
      toast({ title: 'Unfriended', description: 'This user has been removed from your friends.' });
      await refresh();
    } catch (error: any) {
      toast({ title: 'Failed to unfriend', description: error.message, variant: 'destructive' });
    }
  };

  const getButtonText = () => {
    if (!friendshipStatus) return "Send Friend Request";
    if (friendshipStatus.isFriend) return "Already Friends";
    if (friendshipStatus.hasPendingRequest) return "Request Pending";
    if (friendshipStatus.requestStatus === 'declined') return "Send Friend Request";
    return "Send Friend Request";
  };

  const isButtonDisabled = () => {
    return friendshipStatus?.isFriend || friendshipStatus?.hasPendingRequest || loading;
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Find Friends
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Connect with fellow learners and build your learning community
          </p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300" data-aos="fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Search for Friends</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by email or username" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="pl-10 h-11" 
              />
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </div>
            )}
          </div>
          {result === null && query && !loading && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
              <div className="flex items-center gap-3 text-muted-foreground">
                <UserX className="w-5 h-5" />
                <div>
                  <p className="font-medium">No user found</p>
                  <p className="text-sm">You can send an invitation to this email address</p>
                </div>
              </div>
            </div>
          )}
          
          {result ? (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border-2 border-primary/20" data-aos="fade-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg truncate">{result.name} {result.username ? `(@${result.username})` : ''}</div>
                      <div className="text-sm text-muted-foreground truncate">{result.email}</div>
                    </div>
                  </div>
                  {friendshipStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      {friendshipStatus.isFriend && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Already friends
                        </Badge>
                      )}
                      {friendshipStatus.hasPendingRequest && (
                        <Badge variant="secondary" className="bg-yellow-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Request pending
                        </Badge>
                      )}
                      {friendshipStatus.requestStatus === 'declined' && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Request declined
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => sendFriendRequest(result.id, result.email)} 
                  disabled={isButtonDisabled()}
                  variant={friendshipStatus?.isFriend ? "secondary" : "default"}
                  className="w-full sm:w-auto shrink-0"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {getButtonText()}
                </Button>
              </div>
            </div>
          ) : query && !loading ? (
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => sendInviteEmail(query)}
                className="w-full sm:w-auto"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          ) : null}
      </Card>

        {/* Requests Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Received Requests */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300" data-aos="fade-up" data-aos-delay={100}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">Received Requests</h2>
              <Badge variant="secondary" className="ml-auto">{requests.received.length}</Badge>
            </div>
            
            <div className="space-y-4">
              {requests.received.map((r: any, index: number) => (
                <div key={r.id} className="p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300" data-aos="fade-up" data-aos-delay={200 + index * 100}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium truncate">{r.sender?.name || 'Unknown'} {r.sender?.username ? `(@${r.sender.username})` : ''}</div>
                          <div className="text-sm text-muted-foreground">wants to be your friend</div>
                        </div>
                      </div>
                      <Badge variant={r.status === 'pending' ? 'default' : 'secondary'} className="text-xs">
                        {r.status === 'pending' ? 'Pending' : r.status}
                      </Badge>
                    </div>
                    {r.status === 'pending' && (
                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <Button 
                          size="sm" 
                          onClick={() => respond(r.id, true)} 
                          className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => respond(r.id, false)} 
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {requests.received.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No received requests</p>
                  <p className="text-sm">Friend requests will appear here</p>
                </div>
              )}
            </div>
          </Card>

          {/* Sent Requests */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300" data-aos="fade-up" data-aos-delay={200}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold">Sent Requests</h2>
              <Badge variant="secondary" className="ml-auto">{requests.sent.length}</Badge>
            </div>
            
            <div className="space-y-4">
              {requests.sent.map((r: any, index: number) => (
                <div key={r.id} className="p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300" data-aos="fade-up" data-aos-delay={300 + index * 100}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium truncate">{r.receiver?.name || 'Unknown'} {r.receiver?.username ? `(@${r.receiver.username})` : ''}</div>
                          <div className="text-sm text-muted-foreground">friend request sent</div>
                        </div>
                      </div>
                      <Badge variant={r.status === 'pending' ? 'default' : r.status === 'accepted' ? 'default' : 'destructive'} className="text-xs">
                        {r.status === 'pending' ? 'Pending' : r.status}
                      </Badge>
                    </div>
                    {r.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => FriendsService.cancelRequest(r.id).then(refresh)} 
                        className="w-full sm:w-auto shrink-0"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {requests.sent.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No sent requests</p>
                  <p className="text-sm">Your friend requests will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Friends List */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300" data-aos="fade-up" data-aos-delay={300}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-semibold">Your Friends</h2>
              <Badge variant="secondary" className="ml-2">{friends.length}</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={friendsLoading}
              className="hover:bg-primary/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${friendsLoading ? 'animate-spin' : ''}`} />
              {friendsLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          
          {friendsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your friends...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((f, index) => (
                <div 
                  key={f.id} 
                  className="group p-4 rounded-lg border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                  onClick={() => setSelectedProfile(f.id)}
                  data-aos="fade-up"
                  data-aos-delay={400 + index * 100}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {f.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{f.name} {f.username ? `(@${f.username})` : ''}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={f.status === 'online' ? 'default' : 'secondary'} 
                            className={`text-xs ${f.status === 'online' ? 'bg-green-500' : ''}`}
                          >
                            <div className={`w-2 h-2 rounded-full mr-1 ${f.status === 'online' ? 'bg-white' : 'bg-muted-foreground'}`}></div>
                            {f.status || 'offline'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <span>Level {f.level || 1}</span>
                      <Flame className="w-4 h-4 ml-2" />
                      <span>{f.xp || 0} XP</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={(e) => {
                        e.stopPropagation();
                        unfriend(f.id);
                      }} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Unfriend
                    </Button>
                  </div>
                </div>
              ))}
              {friends.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your learning community!</p>
                  <p className="text-sm text-muted-foreground">Search for users above to add friends</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Profile Preview */}
        <ProfilePreview
          userId={selectedProfile || ''}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onUnfriend={(userId) => {
            unfriend(userId);
            setSelectedProfile(null);
          }}
        />
      </div>
    </div>
  );
}


