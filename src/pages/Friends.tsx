import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FriendsService } from '@/services/friendsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Friends() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<{ isFriend: boolean; hasPendingRequest: boolean; requestStatus?: string } | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const [f, r] = await Promise.all([FriendsService.listFriends(), FriendsService.listRequests()]);
    setFriends(f);
    setRequests(r);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await FriendsService.searchByEmailOrUsername(query.trim());
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
  };

  const sendInviteEmail = async (email: string) => {
    try {
      await fetch(`/api/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, inviterName: user?.name, signupLink: `${window.location.origin}/signup` }),
      });
      toast({ title: "Invitation sent!", description: `An invitation has been sent to ${email}` });
    } catch (error: any) {
      toast({ title: "Failed to send invitation", description: error.message, variant: "destructive" });
    }
  };

  const sendFriendRequest = async (receiverId: string, receiverEmail?: string) => {
    try {
      await FriendsService.sendFriendRequest(receiverId);
      
      // Send email notification
      if (receiverEmail) {
        await fetch(`/api/send-friend-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: receiverEmail, senderName: user?.name, link: `${window.location.origin}/friends` }),
        });
      }
      
      toast({ title: "Friend request sent!", description: "The user will be notified via email." });
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
    <div className="container mx-auto px-4 pt-24 pb-10 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Find Friends</h1>

      <Card className="p-3 sm:p-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input placeholder="Search by email or username" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1" />
          <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">{loading ? "Searching..." : "Search"}</Button>
        </div>
        {result === null && query && !loading && (
          <div className="mt-4 text-sm text-muted-foreground">No user found. You can send an invitation.</div>
        )}
        {result ? (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0 w-full">
              <div className="font-medium truncate">{result.name} {result.username ? `(@${result.username})` : ''}</div>
              <div className="text-sm text-muted-foreground truncate">{result.email}</div>
              {friendshipStatus && (
                <div className="text-xs text-muted-foreground mt-1">
                  {friendshipStatus.isFriend && "✓ Already friends"}
                  {friendshipStatus.hasPendingRequest && "⏳ Request pending"}
                  {friendshipStatus.requestStatus === 'declined' && "❌ Request was declined"}
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
              {getButtonText()}
            </Button>
          </div>
        ) : query && !loading ? (
          <div className="mt-4">
            <Button variant="outline" onClick={() => sendInviteEmail(query)}>Send Invitation</Button>
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Received Requests</h2>
          <div className="space-y-3">
            {requests.received.map((r: any) => (
              <div key={r.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-sm flex-1 min-w-0 w-full">
                  <span className="truncate block">From: {r.sender?.name || 'Unknown'} {r.sender?.username ? `(@${r.sender.username})` : ''}</span>
                  <span className="text-xs text-muted-foreground">Status: {r.status}</span>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <Button size="sm" onClick={() => respond(r.id, true)} className="flex-1 sm:flex-none">Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => respond(r.id, false)} className="flex-1 sm:flex-none">Decline</Button>
                  </div>
                )}
              </div>
            ))}
            {requests.received.length === 0 && (
              <div className="text-sm text-muted-foreground">No received requests</div>
            )}
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Sent Requests</h2>
          <div className="space-y-3">
            {requests.sent.map((r: any) => (
              <div key={r.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-sm flex-1 min-w-0 w-full">
                  <span className="truncate block">To: {r.receiver?.name || 'Unknown'} {r.receiver?.username ? `(@${r.receiver.username})` : ''}</span>
                  <span className="text-xs text-muted-foreground">Status: {r.status}</span>
                </div>
                {r.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => FriendsService.cancelRequest(r.id).then(refresh)} className="w-full sm:w-auto shrink-0">
                    Cancel
                  </Button>
                )}
              </div>
            ))}
            {requests.sent.length === 0 && (
              <div className="text-sm text-muted-foreground">No sent requests</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-3 sm:p-4 mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">Your Friends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {friends.map((f) => (
            <div key={f.id} className="p-3 rounded border bg-card flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{f.name} {f.username ? `(@${f.username})` : ''}</div>
                <Badge variant={f.status === 'online' ? 'default' : 'secondary'} className="text-xs">{f.status || 'offline'}</Badge>
              </div>
              <Button size="sm" variant="destructive" onClick={() => unfriend(f.id)} className="shrink-0 text-xs">Unfriend</Button>
            </div>
          ))}
          {friends.length === 0 && (
            <div className="text-sm text-muted-foreground col-span-full">No friends yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}


