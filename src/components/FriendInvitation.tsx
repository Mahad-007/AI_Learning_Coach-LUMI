import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  UserPlus, 
  Facebook, 
  Globe, 
  Mail,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { WhiteboardService } from '@/services/whiteboardService';
import { supabase } from '@/lib/supabaseClient';
import type { FriendInvitation, FacebookFriend } from '@/types/whiteboard';
import { toast } from 'sonner';

interface FriendInvitationProps {
  sessionId: string;
  sessionTitle: string;
}

export const FriendInvitationComponent: React.FC<FriendInvitationProps> = ({ 
  sessionId, 
  sessionTitle 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [facebookFriends, setFacebookFriends] = useState<FacebookFriend[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<FriendInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState(`Join my whiteboard session: ${sessionTitle}`);

  useEffect(() => {
    if (isOpen) {
      loadPendingInvitations();
      loadFacebookFriends();
    }
  }, [isOpen]);

  const loadPendingInvitations = async () => {
    try {
      const invitations = await WhiteboardService.getPendingInvitations();
      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const loadFacebookFriends = async () => {
    // This would integrate with Facebook API
    // For now, we'll use mock data
    setFacebookFriends([
      {
        id: '1',
        name: 'John Doe',
        picture: {
          data: {
            url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
          }
        }
      },
      {
        id: '2',
        name: 'Jane Smith',
        picture: {
          data: {
            url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
          }
        }
      },
      {
        id: '3',
        name: 'Mike Johnson',
        picture: {
          data: {
            url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
          }
        }
      }
    ]);
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search for users in the database
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (userId: string, userName: string, invitationType: 'global' | 'facebook') => {
    try {
      await WhiteboardService.inviteFriend({
        sessionId,
        toUserId: userId,
        invitationType,
        message: invitationMessage
      });
      
      toast.success(`Invitation sent to ${userName}!`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleRespondToInvitation = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      await WhiteboardService.respondToInvitation(invitationId, status);
      await loadPendingInvitations();
      
      if (status === 'accepted') {
        toast.success('Invitation accepted! You can now join the session.');
      } else {
        toast.success('Invitation declined.');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Invite Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Invite Friends to Whiteboard Session
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Global Search
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook Friends
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Pending ({pendingInvitations.length})
            </TabsTrigger>
          </TabsList>

          {/* Global Search Tab */}
          <TabsContent value="global" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Search Users</h3>
              <div className="flex space-x-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search by name or email..."
                  className="flex-1"
                />
                <Button 
                  onClick={() => searchUsers(searchQuery)}
                  disabled={loading}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Search Results</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <Card key={user.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInviteUser(user.id, user.name, 'global')}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Invite
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No users found' : 'Start typing to search for users'}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Facebook Friends Tab */}
          <TabsContent value="facebook" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Facebook Friends</h3>
              <p className="text-xs text-gray-500 mb-4">
                Connect your Facebook account to invite friends from your Facebook network.
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {facebookFriends.map((friend) => (
                  <Card key={friend.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={friend.picture.data.url} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{friend.name}</p>
                          <Badge variant="outline" className="text-xs">Facebook</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleInviteUser(friend.id, friend.name, 'facebook')}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Invite
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Pending Invitations Tab */}
          <TabsContent value="pending" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingInvitations.length > 0 ? (
                  pendingInvitations.map((invitation) => (
                    <Card key={invitation.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <div>
                              <p className="text-sm font-medium">Session Invitation</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(invitation.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondToInvitation(invitation.id, 'accepted')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondToInvitation(invitation.id, 'declined')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No pending invitations
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Invitation Message */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Invitation Message</h3>
          <Input
            value={invitationMessage}
            onChange={(e) => setInvitationMessage(e.target.value)}
            placeholder="Customize your invitation message..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
